import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { RESOURCES } from "@/lib/data";
import { ListenButton } from "@/components/ListenButton";
import { ReportModal } from "@/components/ReportModal";
import { FlagBusinessModal } from "@/components/FlagBusinessModal";
import { FavoriteStar } from "@/components/FavoriteStar";
import { AttributeBadges } from "@/components/AttributeBadges";
import {
  ArrowLeft,
  Phone,
  Star,
  Flag,
  ShieldCheck,
  Accessibility,
  Languages,
  Share2,
  CalendarCheck,
  Pencil,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { trackUsage } from "@/lib/personalization";
import { useResourceMeta } from "@/lib/resource-meta";
import { VerifiedPill } from "@/components/VerifiedPill";
import { AvailabilityBadge, CallAheadNote } from "@/components/AvailabilityBadge";
import type { VerificationStatus } from "@/lib/verification";
import { getProfile } from "@/lib/onboarding";
import { SuggestEditModal } from "@/components/SuggestEditModal";
import { ResourceActions } from "@/components/ResourceActions";
import { PrintFlyerButton } from "@/components/PrintFlyerButton";
import { AddToCalendarButton } from "@/components/AddToCalendarButton";
import { CoachMark } from "@/components/CoachMark";

import { DirectionsLink } from "@/components/DirectionsLink";
import { useLiveDistances, useLiveLocation } from "@/lib/live-location";
import { isNonSpecificAddress } from "@/lib/address";
import { buildResourceScript } from "@/lib/tts-context";
import { toast } from "sonner";
import { parseActionLink } from "@/lib/how-to-apply";
import {
  trackResourceViewed,
  trackCallClicked,
  trackDirectionsClicked,
  trackWebsiteClicked,
  trackResourceShared,
} from "@/lib/track-resource";
import { supabase } from "@/integrations/supabase/client";
import { languageSummary } from "@/lib/languages";

const SITE = SITE_URL;

export const Route = createFileRoute("/resource/$id")({
  staticData: { sitemap: true },
  component: ResourcePage,
  head: ({ params }) => {
    const r = RESOURCES.find((x) => x.id === params.id);
    const name = r ? r.name.en : "Resource";
    const desc = r
      ? `${name} — ${r.address}. Hours, phone, directions and details for this Bronx resource.`
      : "Details for this Bronx community resource.";
    const url = `${SITE}/resource/${params.id}`;
    return {
      meta: [
        { title: `${name} — The Bronx App` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — The Bronx App` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: r
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: r.address,
                  addressLocality: "Bronx",
                  addressRegion: "NY",
                },
                ...(r.phone ? { telephone: r.phone } : {}),
                url,
              }),
            },
          ]
        : [],
    };
  },
});

function ResourcePage() {
  const { id } = Route.useParams();
  const { t, lang, speak } = useI18n();
  const navigate = useNavigate();
  const meta = useResourceMeta();
  const m = meta[id];
  const [showReport, setShowReport] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const res = RESOURCES.find((r) => r.id === id);
  // Programs without one physical location: no distance, map pin, or directions.
  const locationVaries = isNonSpecificAddress(res?.address);
  const { mode } = useLiveLocation();
  const distanceFor = useLiveDistances(res?.address && !locationVaries ? [res.address] : []);

  // Real resident reviews only — submitted through the review flow and approved.
  const [realReviews, setRealReviews] = useState<
    { id: string; name: string; rating: number; body: string | null }[]
  >([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, body, created_at")
        .eq("resource_id", id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled && data) {
        setRealReviews(
          data.map((d) => ({ id: d.id, name: "A neighbor", rating: d.rating, body: d.body })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Track view + auto-TTS if user prefers listening
  useEffect(() => {
    if (!res) return;
    trackUsage(res.id, "view");
    trackResourceViewed({ resourceId: res.id, category: res.category });
    const p = getProfile();
    if (p.prefersTTS === "yes") {
      const text = `${res.name[lang]}. ${res.description[lang]}. ${res.address}.`;
      setTimeout(() => speak(text), 350);
    }
  }, [res?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!res) {
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
  }

  const fullText = buildResourceScript({
    name: res.name[lang],
    address: res.address,
    phone: res.phone,
    hours: res.hours[lang],
    distance: res.distance,
    description: res.description[lang],
    notes: res.requirements?.[lang],
  });
  const ttsStyle: "empathetic" | "calm" =
    res.category === "legal" || res.category === "health" ? "empathetic" : "calm";

  // Summary pills are derived from this listing's own attribute data — never
  // hardcoded — so they always match the individual tags shown below.
  const attrs: { icon: React.ReactNode; label: string }[] = [];
  const langLabel = languageSummary(res.languages);
  if (langLabel) {
    attrs.push({ icon: <Languages className="h-3.5 w-3.5" />, label: langLabel });
  }
  if ((res.accessibility ?? []).includes("wheelchair")) {
    attrs.push({
      icon: <Accessibility className="h-3.5 w-3.5" />,
      label: t("interface.wheelchair"),
    });
  }

  const handleShare = async () => {
    trackUsage(res.id, "share");
    const text = `${res.name[lang]}\n${res.address}\nPhone: ${res.phone}\nHours: ${res.hours[lang]}\n\nShared from The Bronx App`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share
    ) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: res.name[lang],
          text,
          url,
        });
        trackResourceShared({ resourceId: res.id, category: res.category, method: "native" });
        return;
      } catch {
        /* fall through */
      }
    }
    const wa = `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;
    window.open(wa, "_blank");
    trackResourceShared({ resourceId: res.id, category: res.category, method: "whatsapp" });
    toast.success("Opened WhatsApp share");
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/category/$cat", params: { cat: res.category } })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        {/* Trust signals are read from the database, never generated. An
            unverified listing says so plainly. */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <VerifiedPill
            category={res.category}
            status={(m?.verification_status as VerificationStatus) ?? "needs_verification"}
            lastVerified={m?.last_verified ?? null}
            verifyEveryDays={m?.verify_every_days}
            source={m?.source}
          />
          {m?.source_url && (
            <a
              href={m.source_url}
              target="_blank"
              rel="noreferrer"
              className="no-min-h text-xs font-semibold text-primary hover:underline"
            >
              {t("interface.source")}
            </a>
          )}
          <Link
            to="/data-quality"
            className="no-min-h text-xs text-muted-foreground hover:underline"
          >
            {t("interface.howVerify")}
          </Link>
          <AvailabilityBadge status={res.availabilityStatus} />
        </div>
        <CallAheadNote className="mb-2" />

        <div className="flex items-start gap-2 mb-2">
          <h1 className="min-w-0 flex-1 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {res.name[lang]}
          </h1>
          <FavoriteStar id={res.id} size="lg" category={res.category} />
        </div>

        {locationVaries ? (
          <p className="text-sm text-muted-foreground font-medium">
            {t("interface.locationVaries")}
          </p>
        ) : (
          <p className="text-sm text-primary font-semibold">
            {distanceFor(res.address, res.distance)} {t("miles")}
            <span className="ms-1.5 font-medium text-muted-foreground">
              ·{" "}
              {mode === "live"
                ? "from your real-time location"
                : "from your zip code (approximate)"}
            </span>
          </p>
        )}

        <div className="mt-3">
          <CoachMark
            storageKey="bronx.coach.tts.v1"
            message={t("common.coachTts")}
            placement="above"
            delay={250}
          >
            <ListenButton
              text={fullText}
              title={res.name[lang]}
              style={ttsStyle}
              variant="primary"
              label={t("interface.listenDetails")}
              className="w-full"
            />
          </CoachMark>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 mb-5">
          {attrs.map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
            >
              {a.icon} {a.label}
            </span>
          ))}
        </div>

        {res.ownership?.length ||
        res.heritage?.length ||
        res.dietary?.length ||
        res.languages?.length ||
        res.accessibility?.length ? (
          <div className="mb-5">
            <AttributeBadges a={res} />
          </div>
        ) : null}

        <div
          className={`grid ${locationVaries && !res.website ? "grid-cols-1" : "grid-cols-2"} gap-3 mb-3`}
        >
          <a
            href={`tel:${res.phone}`}
            onClick={() => {
              trackUsage(res.id, "call");
              trackCallClicked({ resourceId: res.id, category: res.category, phone: res.phone });
            }}
            className="no-min-h inline-flex items-center justify-center gap-2 py-3 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors min-h-[52px]"
          >
            <Phone className="h-5 w-5" aria-hidden /> {t("callNow")}
          </a>
          {locationVaries ? (
            res.website ? (
              <a
                href={res.website.startsWith("http") ? res.website : `https://${res.website}`}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackWebsiteClicked({
                    resourceId: res.id,
                    category: res.category,
                    url: res.website,
                  })
                }
                className="no-min-h inline-flex items-center justify-center gap-2 py-3 min-h-[52px] rounded-md border-2 border-foreground bg-transparent font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ExternalLink className="h-5 w-5" aria-hidden /> {t("interface.seeLocations")}
              </a>
            ) : null
          ) : (
            <DirectionsLink
              address={res.address}
              label={t("getDirections")}
              onClick={() => {
                trackUsage(res.id, "directions");
                trackDirectionsClicked({
                  resourceId: res.id,
                  category: res.category,
                  distanceMiles: res.distance,
                });
              }}
              className="no-min-h justify-center gap-2 py-3 min-h-[52px] hover:no-underline rounded-md border-2 border-foreground bg-transparent font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
            />
          )}
        </div>
        {(() => {
          // "How to Apply" is the direct next step (URL or application phone line);
          // fall back to the older Jobs application link when it isn't filled in.
          const action = parseActionLink(res.howToApply) ?? parseActionLink(res.applicationLink);
          if (!action) return null;
          const isPhone = action.kind === "phone";
          return (
            <a
              href={action.href}
              {...(isPhone ? {} : { target: "_blank", rel: "noreferrer" })}
              onClick={() => {
                if (isPhone)
                  trackCallClicked({
                    resourceId: res.id,
                    category: res.category,
                    phone: action.display,
                  });
                else
                  trackWebsiteClicked({
                    resourceId: res.id,
                    category: res.category,
                    url: action.href,
                  });
              }}
              className="no-min-h w-full inline-flex items-center justify-center gap-2 py-3 mb-3 min-h-[52px] rounded-md border-2 border-foreground bg-transparent font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {isPhone ? (
                <Phone className="h-5 w-5" aria-hidden />
              ) : (
                <ExternalLink className="h-5 w-5" aria-hidden />
              )}
              {t("interface.applyHere")}
              {isPhone ? ` · ${action.display}` : ""}
            </a>
          );
        })()}
        <button
          onClick={handleShare}
          className="no-min-h w-full inline-flex items-center justify-center gap-2 py-3 mb-4 min-h-[48px] print-hide rounded-md border-2 border-foreground bg-transparent font-bold text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <Share2 className="h-5 w-5" aria-hidden /> {t("interface.shareWhatsApp")}
        </button>

        <ResourceActions
          resourceId={res.id}
          resourceName={res.name[lang]}
          address={res.address}
          phone={res.phone}
          category={res.category}
        />

        <div className="divide-y divide-border border-t-[3px] border-b border-t-foreground border-b-border">
          <InfoRow label={t("address")}>{res.address}</InfoRow>
          <InfoRow label={t("phone")}>{res.phone}</InfoRow>
          <InfoRow label={t("hours")}>{res.hours[lang]}</InfoRow>
          {res.category === "health" && res.insuranceAccepted && (
            <InfoRow label={t("listing.insuranceLabel")}>{res.insuranceAccepted}</InfoRow>
          )}
          {res.website && (
            <InfoRow label={t("interface.website")}>
              <a
                href={res.website.startsWith("http") ? res.website : `https://${res.website}`}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackWebsiteClicked({
                    resourceId: res.id,
                    category: res.category,
                    url: res.website,
                  })
                }
                className="text-primary underline break-all"
              >
                {res.website.replace(/^https?:\/\//, "")}
              </a>
            </InfoRow>
          )}
          {res.requirements && (
            <InfoRow label={t("requirements")}>{res.requirements[lang]}</InfoRow>
          )}
        </div>

        <section className="mt-8">
          <h2 className="mb-2 border-t-[3px] border-foreground pt-2 text-lg font-bold text-foreground sm:text-2xl">
            {t("services")}
          </h2>
          <p className="text-foreground leading-relaxed">{res.description[lang]}</p>
          {lang !== "en" && res.description[lang] === res.description.en && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {t("interface.fullTranslationSoon")}
            </p>
          )}
        </section>

        {/* Only real, approved reviews submitted by residents are shown.
            No placeholder content is ever rendered here. */}
        {realReviews.length > 0 && (
          <section className="mt-8">
            <h2 className="border-t-[3px] border-foreground pt-2 text-lg font-bold text-foreground sm:text-2xl">
              {t("neighborsSay")}
            </h2>
            <ul className="mt-1 divide-y divide-border border-b border-border">
              {realReviews.map((rv) => (
                <li key={rv.id} className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{rv.name}</span>
                    <span className="flex" aria-label={`${rv.rating} stars`}>
                      {Array.from({ length: rv.rating }).map((_, k) => (
                        <Star key={k} className="h-4 w-4 fill-warning text-warning" aria-hidden />
                      ))}
                    </span>
                  </div>
                  {rv.body && <p className="text-sm text-muted-foreground mt-1">"{rv.body}"</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap gap-2 mt-8 border-t border-border pt-4">
          {res.eventDate && (
            <AddToCalendarButton
              title={res.name[lang]}
              date={res.eventDate}
              time={res.eventTime}
              location={isNonSpecificAddress(res.address) ? "" : res.address}
              description={res.description[lang]}
              className="no-min-h inline-flex min-h-[44px] items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:border-foreground"
            />
          )}
          <PrintFlyerButton
            data={{
              name: res.name[lang],
              category: res.category,
              address: res.address,
              phone: res.phone,
              hours: res.hours[lang],
              notes: res.requirements?.[lang],
              description: res.description[lang],
              url:
                typeof window !== "undefined"
                  ? window.location.href
                  : `https://thebronxapp.org/resource/${res.id}`,
            }}
          />
          <button
            onClick={() => setShowSuggest(true)}
            className="no-min-h inline-flex min-h-[44px] items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:border-foreground"
          >
            <Pencil className="h-4 w-4" aria-hidden /> {t("interface.suggestEdit")}
          </button>
          <button
            onClick={() => {
              trackUsage(res.id, "report");
              setShowReport(true);
            }}
            className="no-min-h inline-flex min-h-[44px] items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:border-foreground"
          >
            <Flag className="h-4 w-4" aria-hidden /> {t("interface.reportIncorrect")}
          </button>
          <button
            onClick={() => setShowFlag(true)}
            className="no-min-h inline-flex min-h-[44px] items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:border-foreground"
          >
            <ShieldAlert className="h-4 w-4 text-destructive" aria-hidden />{" "}
            {t("interface.flagBusiness")}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("interface.actionHelp")}</p>
      </div>

      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          resourceId={res.id}
          resourceName={res.name[lang]}
          resourceType="resource"
        />
      )}
      {showFlag && (
        <FlagBusinessModal
          onClose={() => setShowFlag(false)}
          resourceId={res.id}
          resourceName={res.name[lang]}
          resourceType="resource"
          category={res.category}
        />
      )}
      {showSuggest && (
        <SuggestEditModal
          mode="edit"
          onClose={() => setShowSuggest(false)}
          resourceId={res.id}
          resourceName={res.name[lang]}
        />
      )}
    </AppShell>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="label-caps shrink-0 text-muted-foreground sm:w-28">{label}</span>
      <span className="min-w-0 text-foreground">{children}</span>
    </div>
  );
}
