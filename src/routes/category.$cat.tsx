import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import {
  CATEGORIES,
  RESOURCES,
  Category,
  MinorEligibility,
  YouthSubcategory,
  isArtRelatedEvent,
} from "@/lib/data";
import { getBusinesses, Business } from "@/lib/business";
import { useBusinessSync } from "@/lib/use-business-sync";
import { FavoriteStar } from "@/components/FavoriteStar";
import { PackCheckbox } from "@/components/PackCheckbox";
import { AttributeBadges } from "@/components/AttributeBadges";
import {
  FilterPanel,
  FilterState,
  EMPTY_FILTERS,
  matchesFilters,
  isFilterActive,
} from "@/components/FilterPanel";
import { SUBCATEGORIES_BY_CATEGORY } from "@/lib/subcategories";
import { formatAgeRange, includesAdults, includesMinors } from "@/lib/age-range";
import { ArrowLeft, Plus, X, Check, Star, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trackCategoryBrowsed } from "@/lib/track-journey";
import { ListenButton } from "@/components/ListenButton";
import { buildResourceScript } from "@/lib/tts-context";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { MapView, MapResource } from "@/components/MapView";
import { SpreadsheetView, SheetRow } from "@/components/SpreadsheetView";
import { DirectionsLink } from "@/components/DirectionsLink";
import { isNonSpecificAddress } from "@/lib/address";
import { useLiveDistances } from "@/lib/live-location";
import { LocationSourceCard } from "@/components/LocationSourceCard";
import { After5Toggle } from "@/components/After5Toggle";
import { hasEveningHours, countAfter5 } from "@/lib/evening-hours";
import { loadDirectory } from "@/lib/bronx-resources";
import {
  bronxToResource,
  educationSubcategoryFor,
  eventCrossCategory,
  foodSubcategoryFor,
  jobsSubcategoryFor,
  type ImportedResource,
} from "@/lib/bronx-to-resource";
import { VerifiedPill } from "@/components/VerifiedPill";
import { useResourceMeta, type ResourceMeta } from "@/lib/resource-meta";
import { SponsoredCard } from "@/components/SponsoredCard";
import { PolicyAlerts } from "@/components/PolicyAlerts";
import { AvailabilityBadge, CallAheadNote } from "@/components/AvailabilityBadge";
import { HiringBoard } from "@/components/HiringBoard";

type CategorySearch = { after5?: boolean };

const SITE = SITE_URL;

export const Route = createFileRoute("/category/$cat")({
  staticData: { sitemap: true },
  component: CategoryPage,
  validateSearch: (s: Record<string, unknown>): CategorySearch => ({
    after5: s.after5 === true || s.after5 === "true" || s.after5 === "1" ? true : undefined,
  }),
  head: ({ params }) => {
    const label = params.cat.charAt(0).toUpperCase() + params.cat.slice(1);
    const title = `${label} Resources in the Bronx — The Bronx App`;
    const desc = `Find ${label.toLowerCase()} resources across the Bronx: addresses, hours, phone numbers and directions, updated by the community.`;
    const url = `${SITE}/category/${params.cat}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

const SUBS: { id: YouthSubcategory; label: string; emoji: string; desc: string }[] = [
  {
    id: "fun",
    label: "Fun & Activities",
    emoji: "⚽",
    desc: "Sports, arts, camps, recreation centers, movie nights",
  },
  {
    id: "employment",
    label: "Employment & Internships",
    emoji: "💼",
    desc: "Paid jobs, internships, resume help, career counseling",
  },
  {
    id: "mentorship",
    label: "Mentorship & Leadership",
    emoji: "🌟",
    desc: "Tutoring, college prep, leadership programs, mentoring",
  },
];

function CategoryPage() {
  const { cat } = Route.useParams();
  const search = Route.useSearch();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [sortDistance, setSortDistance] = useState(true);
  const [openOnly, setOpenOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const after5 = !!search.after5;
  const setAfter5 = (v: boolean) =>
    navigate({
      to: "/category/$cat",
      params: { cat },
      search: { after5: v || undefined },
      replace: true,
    });
  const [showSuggest, setShowSuggest] = useState(false);

  const [youthSub, setYouthSub] = useState<YouthSubcategory | null>(null);
  const [ageFilter, setAgeFilter] = useState<"all" | "minors" | "adults">("all");
  const [youthOpsOnly, setYouthOpsOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  useEffect(() => {
    trackCategoryBrowsed(cat);
  }, [cat]);
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("list");
  const subs = SUBCATEGORIES_BY_CATEGORY[cat as Category] ?? null;
  // Editorial verification layer — the same source the detail page reads, so a
  // card and its detail page can never disagree about verification.
  const resMeta = useResourceMeta();

  const meta = CATEGORIES.find((c) => c.id === cat);
  const isYouth = cat === "youth";
  const isJobs = cat === "jobs";

  // Build merged list = native resources + business listings
  const bizTick = useBusinessSync();
  const businesses = useMemo<Business[]>(() => getBusinesses(), [bizTick]);
  // Addresses in this category, so live mode can measure to the real building.
  const catAddresses = useMemo(
    () => RESOURCES.filter((r) => r.category === cat).map((r) => r.address),
    [cat],
  );
  const distanceFor = useLiveDistances(catAddresses);

  // Listings held in the master database (bulk-imported or admin-entered).
  // They render through the SAME card as everything else in the category.
  const [imported, setImported] = useState<ImportedResource[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await loadDirectory();
      if (cancelled) return;
      // An imported event tagged with another category (e.g. "Nature &
      // Recreation") cross-lists there too, matching the native events pattern.
      const today = new Date().toISOString().slice(0, 10);
      setImported(
        rows
          .filter(
            (row) =>
              row.resource_category !== "community_events" ||
              !row.event_date ||
              (row.event_end_date ?? row.event_date) >= today,
          )
          .filter((row) => {
            const r = bronxToResource(row);
            if (r.category === (cat as Category)) return true;
            return (
              r.category === "events" &&
              eventCrossCategory(row.resource_subcategory) === (cat as Category)
            );
          })
          .map(bronxToResource),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [cat]);

  const list = useMemo(() => {
    if (!meta) return [];
    let l = RESOURCES.filter((r) => r.category === (cat as Category));

    // Cross-posted youth-employment into Jobs
    if (isJobs) {
      const xp = RESOURCES.filter(
        (r) => r.category === "youth" && r.subcategory === "employment" && r.crossPostedToJobs,
      );
      l = [...l, ...xp];
    }

    // Art-related events also appear under Art (Events stays the source of
    // truth — no separate Art > Events subcategory).
    if (cat === "art") {
      l = [...l, ...RESOURCES.filter(isArtRelatedEvent)];
    }

    // Add business listings of this category
    const matchingBiz = businesses.filter((b) => b.category === cat);
    // youth-employment cross-posted businesses also appear in Jobs
    if (isJobs) {
      const xb = businesses.filter((b) => b.youthSubcategory === "employment" && b.crossPostToJobs);
      matchingBiz.push(...xb);
    }
    const bizAsResource = matchingBiz.map((b) => bizToResource(b));
    l = [...l, ...bizAsResource, ...imported];

    // Every food listing must carry a subcategory so the pill filter covers all
    // of them; anything we can't place confidently falls back to "Food Pantry".
    if (cat === "food") {
      l = l.map((r) =>
        r.subcategory
          ? r
          : {
              ...r,
              subcategory: foodSubcategoryFor({
                resource_category: "food",
                resource_subcategory: null,
                description: `${r.name.en} ${r.description.en}`,
              }),
            },
      );
    }

    // Same rule for Jobs: every listing carries one of the four Jobs pills, so
    // the filter never hides anything. Youth-employment cross-posts count as
    // internships; anything unclear falls back to "Full-Time / Part-Time Jobs".
    if (cat === "jobs") {
      const JOB_PILLS = new Set(["internships", "training", "finding", "self"]);
      l = l.map((r) =>
        r.subcategory && JOB_PILLS.has(r.subcategory)
          ? r
          : {
              ...r,
              subcategory:
                r.category === "youth" || r.subcategory === "employment"
                  ? "internships"
                  : jobsSubcategoryFor({ description: `${r.name.en} ${r.description.en}` }),
            },
      );
    }

    // Same rule for Education: every listing carries one of the three
    // life-stage pills, so the filter never hides anything.
    if (cat === "education") {
      const EDU_PILLS = new Set(["k12", "adult", "college", "library"]);
      l = l.map((r) =>
        r.subcategory && EDU_PILLS.has(r.subcategory)
          ? r
          : {
              ...r,
              subcategory: educationSubcategoryFor({
                description: `${r.name.en} ${r.description.en}`,
              }),
            },
      );
    }

    // Youth subcategory filter
    if (isYouth && youthSub) l = l.filter((r) => r.subcategory === youthSub);

    // Age filter (Youth Employment)
    if (isYouth && youthSub === "employment" && ageFilter !== "all") {
      l = l.filter((r) => {
        const me = r.minorEligibility;
        // Prefer the stated age range; fall back to the coarse flag.
        if (ageFilter === "minors")
          return includesMinors(r.ageMin, r.ageMax) ?? (me === "yes" || me === "restricted");
        if (ageFilter === "adults")
          return (
            includesAdults(r.ageMin, r.ageMax) ??
            (me === "no" || me === "restricted" || me === undefined)
          );
        return true;
      });
    }

    // Jobs "Youth Opportunities" toggle
    if (isJobs && youthOpsOnly)
      l = l.filter(
        (r) =>
          r.category === "youth" || (r as ResourceWithBiz).__biz?.youthSubcategory === "employment",
      );

    if (openOnly) l = l.filter((r) => r.openNow);
    if (freeOnly) l = l.filter((r) => r.free);
    if (after5) l = l.filter((r) => hasEveningHours(r));
    // Cross-listed programs (e.g. a GED program serving teens and adults) match
    // every pill they belong to, not just their primary one.
    if (subs && subFilter) {
      l = l.filter(
        (r) => r.subcategory === subFilter || (r.alsoSubcategories ?? []).includes(subFilter),
      );
    }
    if (isFilterActive(filters)) l = l.filter((r) => matchesFilters(r, filters));

    // Distances are measured from whichever origin is active: live coordinates
    // when the resident opted in this visit, otherwise their saved zip centroid.
    l = l.map((r) =>
      isNonSpecificAddress(r.address) ? r : { ...r, distance: distanceFor(r.address, r.distance) },
    );

    // Premium sort priority: premium businesses first, then by distance
    // (listings with no known distance sort last rather than first).
    const dist = (r: { distance: number }) =>
      r.distance < 0 ? Number.POSITIVE_INFINITY : r.distance;
    l = [...l].sort((a, b) => {
      const ap = (a as ResourceWithBiz).__biz?.tier === "premium" ? 0 : 1;
      const bp = (b as ResourceWithBiz).__biz?.tier === "premium" ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return sortDistance ? dist(a) - dist(b) : 0;
    });

    return l;
  }, [
    cat,
    meta,
    sortDistance,
    openOnly,
    freeOnly,
    after5,
    isYouth,
    youthSub,
    ageFilter,
    isJobs,
    youthOpsOnly,
    businesses,
    imported,
    filters,
    subs,
    subFilter,
    distanceFor,
  ]);

  // Counts for chip badges (computed from the already-filtered list).
  const after5Count = useMemo(() => countAfter5(list), [list]);

  if (!meta)
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p>{t("interface.categoryNotFound")}</p>
          <Link to="/" className="text-primary underline">
            ← {t("home")}
          </Link>
        </div>
      </AppShell>
    );

  return (
    <AppShell
      fab={
        <button
          onClick={() => setShowSuggest(true)}
          className="no-min-h inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition font-semibold"
        >
          <Plus className="h-5 w-5" /> {t("interface.suggestResource")}
        </button>
      }
    >
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className="h-12 w-12 rounded-xl grid place-items-center text-2xl shrink-0"
            style={{ backgroundColor: meta.color }}
          >
            {meta.emoji}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex-1">
            {t(meta.titleKey)}
          </h1>
        </div>
        {(() => {
          const catLabel = t(meta.titleKey);
          const totalInCat = RESOURCES.filter((r) => r.category === cat).length;
          const overview = `${catLabel} resources in the Bronx. There are ${totalInCat} ${catLabel.toLowerCase()} resources available. Scroll to browse, or tap any listing for full details. Each listing has its own Listen button so you can hear only the one you want.`;
          return (
            <div className="mb-5">
              <ListenButton
                text={overview}
                title={catLabel}
                style="calm"
                variant="chip"
                label={t("interface.listenOverview")}
              />
            </div>
          );
        })()}

        <PolicyAlerts category={cat} />

        {isJobs && (
          <div className="mb-6">
            <HiringBoard />
          </div>
        )}

        {isYouth && !youthSub && (
          <div className="space-y-3 mb-6">
            <p className="text-muted-foreground">{t("interface.chooseLooking")}</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {SUBS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setYouthSub(s.id)}
                  className="no-min-h text-left rounded-2xl border-2 border-border bg-card p-4 hover:border-primary hover:shadow-md transition"
                >
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <p className="font-bold">{s.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {(!isYouth || youthSub) && (
          <>
            {isYouth && youthSub && (
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setYouthSub(null)}
                  className="no-min-h text-sm text-primary hover:underline"
                >
                  ← {t("interface.allYouth")}
                </button>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm font-semibold">
                  {SUBS.find((s) => s.id === youthSub)?.label}
                </span>
              </div>
            )}

            <LocationSourceCard className="mb-4" />

            <div className="flex flex-wrap items-center gap-2 mb-5">
              <FilterChip active={sortDistance} onClick={() => setSortDistance((v) => !v)}>
                {t("distance")}
              </FilterChip>
              <FilterChip active={openOnly} onClick={() => setOpenOnly((v) => !v)}>
                {t("openNow")}
              </FilterChip>
              <FilterChip active={freeOnly} onClick={() => setFreeOnly((v) => !v)}>
                {t("interface.freeOnly")}
              </FilterChip>
              <After5Toggle active={after5} onToggle={setAfter5} count={after5Count} />

              {isJobs && (
                <FilterChip active={youthOpsOnly} onClick={() => setYouthOpsOnly((v) => !v)}>
                  {t("interface.youthOpportunities")}
                </FilterChip>
              )}
              <button
                onClick={() => setFilterOpen(true)}
                className={`no-min-h px-4 py-2 rounded-full text-sm font-medium border inline-flex items-center gap-1.5 min-h-[44px] ${isFilterActive(filters) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}
              >
                <SlidersHorizontal className="h-4 w-4" /> {t("interface.filter")}
              </button>
              {isYouth && youthSub === "employment" && (
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value as "all" | "minors" | "adults")}
                  className="px-3 py-2 rounded-full text-sm font-medium border border-border bg-card min-h-[44px]"
                >
                  <option value="all">{t("interface.agesAll")}</option>
                  <option value="minors">{t("interface.minorsOnly")}</option>
                  <option value="adults">{t("interface.adultsOnly")}</option>
                </select>
              )}
              <span className="ms-auto">
                <ViewToggle value={view} onChange={setView} />
              </span>
            </div>

            {subs && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSubFilter(null)}
                  className={`no-min-h px-3 py-1.5 rounded-full text-sm font-medium border ${!subFilter ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}
                >
                  {t("interface.all")}
                </button>
                {subs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubFilter(s.id === subFilter ? null : s.id)}
                    className={`no-min-h px-3 py-1.5 rounded-full text-sm font-medium border inline-flex items-center gap-1 ${subFilter === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}
                  >
                    <span>{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            )}

            <FilterPanel
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              value={filters}
              onApply={setFilters}
              showDietary={cat === "food"}
              showFairChance={isJobs}
              resultCount={list.length}
            />

            {view === "map" && (
              <MapView
                resources={list.map((r): MapResource => ({
                  id: (r as ResourceWithBiz).__biz?.id
                    ? `biz-${(r as ResourceWithBiz).__biz!.id}`
                    : r.id,
                  name: r.name.en,
                  category: r.category,
                  address: r.address,
                  phone: r.phone,
                  distance: r.distance,
                  isBiz: !!(r as ResourceWithBiz).__biz,
                }))}
                height={520}
              />
            )}
            {view === "sheet" && (
              <SpreadsheetView
                rows={list.map((r): SheetRow => ({
                  id: r.id,
                  name: r.name.en,
                  category: r.category,
                  address: r.address,
                  phone: r.phone,
                  distance: r.distance,
                  isBiz: !!(r as ResourceWithBiz).__biz,
                }))}
              />
            )}
            {view === "list" && (
              <ul className="space-y-3">
                {/* At most one sponsored card per category; never on civic/urgent pages. */}
                {cat !== "government" && <SponsoredCard category={cat} />}
                {list.map((r) => (
                  <ListingItem
                    key={(r as ResourceWithBiz).__biz?.id ?? r.id}
                    r={r as ResourceWithBiz}
                    lang={lang}
                    isJobs={isJobs}
                    meta={resMeta[r.id]}
                  />
                ))}
                {list.length === 0 && (
                  <li className="text-center text-muted-foreground py-8">
                    {t("interface.noFilterResults")}
                  </li>
                )}
              </ul>
            )}
          </>
        )}
      </div>

      {showSuggest && (
        <SuggestModal onClose={() => setShowSuggest(false)} defaultCategory={cat as Category} />
      )}
    </AppShell>
  );
}

type ResourceWithBiz = ReturnType<typeof bizToResource> & { __biz?: Business };

function bizToResource(b: Business): import("@/lib/data").Resource & { __biz: Business } {
  const txt = (s: string) => ({ en: s, es: s, fr: s, bn: s, ar: s });
  const hourStr =
    Object.entries(b.hours)
      .filter(([, v]) => v.open)
      .map(([d, v]) => `${d} ${v.from}-${v.to}`)
      .join(", ") || "By appointment";
  return {
    id: `biz-${b.id}`,
    category: b.category as Category,
    subcategory: b.youthSubcategory,
    crossPostedToJobs: b.crossPostToJobs,
    minorEligibility: b.minorEligibility,
    restrictionsNote: b.restrictionsNote,
    name: txt(b.name),
    description: txt(b.description),
    address: b.address,
    phone: b.phone,
    hours: txt(hourStr),
    distance: 1.0,
    free: false,
    openNow: true,
    reviews: [],
    __biz: b,
  };
}

function ListingItem({
  r,
  lang,
  isJobs,
  meta,
}: {
  r: ResourceWithBiz;
  lang: import("@/lib/i18n").Lang;
  isJobs: boolean;
  meta?: ResourceMeta;
}) {
  const { t } = useI18n();
  const isBiz = !!r.__biz;
  const imported = (r as unknown as Partial<ImportedResource>).__imported;
  const isPremium = r.__biz?.tier === "premium";
  const isGov = r.category === "government";
  const locationVaries = isNonSpecificAddress(r.address);
  const inner = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          {r.name[lang]}
          {isPremium && r.__biz?.verified && (
            <Check className="h-4 w-4 text-success bg-success/15 rounded-full p-0.5" />
          )}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{r.description[lang]}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {isPremium ? (
            <Badge cls="bg-warning/20 text-warning">
              <Star className="h-3 w-3" fill="currentColor" /> {t("interface.premium")}
            </Badge>
          ) : isBiz || imported?.listingType === "business" ? (
            <Badge cls="bg-muted text-muted-foreground">{t("interface.localBusiness")}</Badge>
          ) : isGov ? (
            <Badge cls="bg-primary/15 text-primary">{t("government")}</Badge>
          ) : r.free ? (
            <Badge cls="bg-success/15 text-success">{t("interface.free")}</Badge>
          ) : (
            <Badge cls="bg-secondary text-secondary-foreground">{t("interface.resource")}</Badge>
          )}
          {r.openNow && <Badge cls="bg-primary/15 text-primary">{t("interface.openNow")}</Badge>}
          <AvailabilityBadge status={r.availabilityStatus} compact />
          <VerifiedPill
            status={imported?.status ?? meta?.verification_status ?? "needs_verification"}
            lastVerified={imported?.lastVerified ?? meta?.last_verified ?? null}
            verifyEveryDays={meta?.verify_every_days}
            source={meta?.source ?? undefined}
            category={r.category}
            compact
          />

          <AgeBadge r={r} />
        </div>
        <CallAheadNote className="mt-1.5" />
        {lang !== "en" && r.description[lang] === r.description.en && (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {t("interface.fullTranslationSoon")}
          </p>
        )}
        <div className="mt-2">
          <AttributeBadges a={r} />
        </div>
        {imported && (
          <p className="text-sm text-muted-foreground mt-1.5">
            {r.address}
            {r.phone && (
              <>
                {" · "}
                <a
                  href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}
                  className="text-primary hover:underline"
                >
                  {r.phone}
                </a>
              </>
            )}
          </p>
        )}
      </div>
      {locationVaries ? (
        <span className="text-xs font-medium text-muted-foreground max-w-[7.5rem] text-right">
          {t("interface.locationVaries")}
        </span>
      ) : r.distance >= 0 ? (
        <span className="text-sm font-bold text-primary whitespace-nowrap">{r.distance} mi</span>
      ) : null}
    </div>
  );
  const cardScript = buildResourceScript({
    name: r.name[lang],
    address: r.address,
    phone: r.phone,
    hours: r.hours[lang],
    distance: r.distance,
  });
  const cardClass =
    "flex-1 block rounded-2xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition";
  return (
    <li>
      <div className="flex items-stretch gap-2">
        {isBiz || imported ? (
          <div className={cardClass}>{inner}</div>
        ) : (
          <Link to="/resource/$id" params={{ id: r.id }} className={`no-min-h ${cardClass}`}>
            {inner}
          </Link>
        )}
        <div className="flex flex-col items-center justify-center gap-1.5">
          {!isBiz && <FavoriteStar id={r.id} />}
          <ListenButton text={cardScript} title={r.name[lang]} style="calm" />
          {!locationVaries && (
            <DirectionsLink
              address={r.address}
              label={`${t("interface.directions")}: ${r.name[lang]}`}
              iconOnly
              className="no-min-h h-10 w-10 justify-center rounded-full border border-border bg-card hover:bg-secondary hover:no-underline"
            />
          )}
          {!isBiz && <PackCheckbox id={r.id} label={r.name[lang]} />}
        </div>
      </div>
    </li>
  );
}

/**
 * One age tag per listing, from the listing's own data — never derived from
 * which category page it happens to be shown on. Prefers the stated age range
 * ("Ages 14-24"); falls back to the coarse minor-eligibility flag only when no
 * range is recorded.
 */
function AgeBadge({ r }: { r: ResourceWithBiz }) {
  const label = formatAgeRange(r.ageMin, r.ageMax);
  if (label) {
    return (
      <Badge cls="bg-accent/20 text-accent-foreground" title={r.restrictionsNote}>
        {label}
      </Badge>
    );
  }
  const me: MinorEligibility | undefined = r.minorEligibility;
  if (!me) return null;
  if (me === "yes")
    return <Badge cls="bg-success/15 text-success">Open to Minors (Under 18)</Badge>;
  if (me === "no") return <Badge cls="bg-destructive/15 text-destructive">Adults Only (18+)</Badge>;
  return (
    <Badge cls="bg-warning/20 text-warning" title={r.restrictionsNote}>
      Restrictions Apply
    </Badge>
  );
}

function Badge({
  children,
  cls,
  title,
}: {
  children: React.ReactNode;
  cls: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`no-min-h px-4 py-2 rounded-full text-sm font-medium border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:bg-secondary"}`}
    >
      {children}
    </button>
  );
}

function SuggestModal({
  onClose,
  defaultCategory,
}: {
  onClose: () => void;
  defaultCategory: Category;
}) {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t("interface.suggestResource")}</h2>
          <button
            onClick={onClose}
            aria-label={t("interface.close")}
            className="no-min-h h-9 w-9 rounded-full grid place-items-center hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {submitted ? (
          <p className="text-success font-medium py-6 text-center">
            ✓ {t("interface.thankYouReview")}
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              setTimeout(onClose, 1500);
            }}
            className="space-y-3"
          >
            <label className="block">
              <span className="text-sm font-medium mb-1 block">{t("interface.name")}</span>
              <input
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block">{t("interface.address")}</span>
              <input
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block">{t("interface.category")}</span>
              <select
                defaultValue={defaultCategory}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="no-min-h w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              {t("interface.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
