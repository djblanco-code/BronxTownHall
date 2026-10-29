import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { AppShell } from "@/features/shell";
import { ResourceCard } from "@/features/resources";
import { useI18n } from "@/lib/i18n-context";
import { CATEGORIES, RESOURCES, Category, YouthSubcategory, isArtRelatedEvent } from "@/lib/data";
import { getBusinesses, isLiveBusiness, Business } from "@/lib/business";
import { useBusinessSync } from "@/lib/use-business-sync";
import {
  FilterPanel,
  FilterState,
  EMPTY_FILTERS,
  matchesFilters,
  isFilterActive,
} from "@/components/FilterPanel";
import { SUBCATEGORIES_BY_CATEGORY } from "@/lib/subcategories";
import { includesAdults, includesMinors } from "@/lib/age-range";
import { ArrowLeft, Check, ChevronRight, Plus, X, SlidersHorizontal } from "lucide-react";
import { Chip, chipVariants } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { useEffect, useMemo, useState } from "react";
import { trackCategoryBrowsed } from "@/lib/track-journey";
import { ListenButton } from "@/components/ListenButton";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { MapView, MapResource } from "@/components/MapView";
import { SpreadsheetView, SheetRow } from "@/components/SpreadsheetView";
import { isNonSpecificAddress } from "@/lib/address";
import { useLiveDistances } from "@/lib/live-location";
import { LocationSourceCard } from "@/components/LocationSourceCard";
import { After5Toggle } from "@/components/After5Toggle";
import { hasEveningHours, countAfter5 } from "@/lib/evening-hours";
import { openingStatus, useNycTime } from "@/lib/opening-hours";
import { loadDirectory } from "@/lib/bronx-resources";
import {
  bronxToResource,
  educationSubcategoryFor,
  eventCrossCategory,
  foodSubcategoryFor,
  jobsSubcategoryFor,
  type ImportedResource,
} from "@/lib/bronx-to-resource";
import { useResourceMeta } from "@/lib/resource-meta";
import { SponsoredCard } from "@/components/SponsoredCard";
import { PolicyAlerts } from "@/components/PolicyAlerts";
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

const SUBS: { id: YouthSubcategory; label: string; desc: string }[] = [
  {
    id: "fun",
    label: "Fun & Activities",
    desc: "Sports, arts, camps, recreation centers, movie nights",
  },
  {
    id: "employment",
    label: "Employment & Internships",
    desc: "Paid jobs, internships, resume help, career counseling",
  },
  {
    id: "mentorship",
    label: "Mentorship & Leadership",
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
  const now = useNycTime();
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
  const businesses = useMemo<Business[]>(() => getBusinesses().filter(isLiveBusiness), [bizTick]);
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

    if (openOnly) l = l.filter((r) => !!now && openingStatus(r.hours.en, now).open === true);
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
    now,
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
        <div className="max-w-5xl mx-auto px-4 py-10">
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
          className="no-min-h inline-flex min-h-[48px] items-center gap-2 rounded-md bg-primary-fill px-5 py-3 font-bold text-primary-fill-foreground shadow-lg transition-colors hover:bg-primary-fill-hover"
        >
          <Plus className="h-5 w-5" aria-hidden /> {t("interface.suggestResource")}
        </button>
      }
    >
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <h1 className="mb-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          {t(meta.titleKey)}
        </h1>
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
          <div className="mb-6 pt-2">
            <p className="text-muted-foreground">{t("interface.chooseLooking")}</p>
            <ul className="mt-1 divide-y divide-border border-b border-border">
              {SUBS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setYouthSub(s.id)}
                    className="no-min-h group flex w-full items-center gap-3 py-3 text-start"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-foreground group-hover:underline">
                        {s.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{s.desc}</span>
                    </span>
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180"
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
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

            <div className="flex flex-wrap items-center gap-2 mb-3">
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
                className={chipVariants({ selected: isFilterActive(filters) })}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden /> {t("interface.filter")}
              </button>
              {isYouth && youthSub === "employment" && (
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value as "all" | "minors" | "adults")}
                  className="h-9 rounded-md border border-border bg-card px-3 text-sm font-semibold"
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
                <Chip selected={!subFilter} onClick={() => setSubFilter(null)}>
                  {t("interface.all")}
                </Chip>
                {subs.map((s) => (
                  <Chip
                    key={s.id}
                    selected={subFilter === s.id}
                    onClick={() => setSubFilter(s.id === subFilter ? null : s.id)}
                    className="h-auto min-h-9 max-w-full shrink py-1.5 text-start"
                  >
                    {s.label}
                  </Chip>
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
              <ul className="">
                {/* At most one sponsored card per category; never on civic/urgent pages. */}
                {cat !== "government" && <SponsoredCard category={cat} />}
                {list.map((r) => (
                  <li key={(r as ResourceWithBiz).__biz?.id ?? r.id}>
                    <ResourceCard
                      resource={r as ResourceWithBiz}
                      meta={resMeta[r.id]}
                      detail="full"
                      selectable
                    />
                  </li>
                ))}
                {list.length === 0 && (
                  <li>
                    <EmptyState
                      icon={SlidersHorizontal}
                      title={t("interface.noFilterResults")}
                      className="border-t-0"
                    />
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
    Object.entries(b.hours ?? {})
      .filter(([, v]) => v?.open)
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
    <Chip selected={active} onClick={onClick}>
      {children}
    </Chip>
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
        className="bg-card rounded-md border border-border shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t("interface.suggestResource")}</h2>
          <button
            onClick={onClose}
            aria-label={t("interface.close")}
            className="no-min-h h-11 w-11 rounded-md grid place-items-center hover:bg-secondary"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {submitted ? (
          <p className="flex items-center justify-center gap-2 py-6 text-center font-medium text-success">
            <Check className="h-5 w-5 shrink-0" aria-hidden /> {t("interface.thankYouReview")}
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
                className="h-11 w-full rounded-md border border-border bg-background px-3"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block">{t("interface.address")}</span>
              <input
                required
                className="h-11 w-full rounded-md border border-border bg-background px-3"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block">{t("interface.category")}</span>
              <select
                defaultValue={defaultCategory}
                className="h-11 w-full rounded-md border border-border bg-background px-3"
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
              className="no-min-h w-full min-h-[44px] py-3 rounded-md bg-primary-fill text-primary-fill-foreground font-bold hover:bg-primary-fill-hover"
            >
              {t("interface.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
