import { MessageCircleQuestion } from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DemoTour } from "@/components/DemoTour";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { ReportModal } from "@/components/ReportModal";
import { CATEGORIES, RESOURCES, Category } from "@/lib/data";
import { SpeakButton } from "@/components/SpeakButton";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { usePersonalization, trackUsage } from "@/lib/personalization";
import { useProfile, NEED_TO_CATEGORY } from "@/lib/onboarding";
import { BRONX_NEIGHBORHOODS } from "@/lib/neighborhoods";
import { useResourceMeta } from "@/lib/resource-meta";
import type { VerificationStatus } from "@/lib/verification";
import { Search, MapPin, Phone, MessageCircle, MessageSquare, ChevronDown, ChevronUp, ShieldCheck, WifiOff, Lock } from "lucide-react";
import { SMS_NUMBER, SMS_CONFIGURED, formatSmsNumber } from "@/lib/sms";
import { useEffect, useMemo, useState } from "react";
import { VerifiedPill } from "@/components/VerifiedPill";
import { HappeningNear } from "@/components/HappeningNear";
import { LocationSourceCard } from "@/components/LocationSourceCard";
import { BronxFactPopup } from "@/components/BronxFactPopup";
import { SponsoredBanner } from "@/components/SponsoredBanner";
import { SimplerViewBanner } from "@/components/SimplerViewBanner";
import { CoachMark } from "@/components/CoachMark";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "The Bronx App | Bronx Resources, Events & Local Help" },
      { name: "description", content: "Find trusted Bronx resources, events, local help, and community information in one accessible directory." },
      { property: "og:title", content: "The Bronx App | Bronx Resources, Events & Local Help" },
      { property: "og:description", content: "Find trusted Bronx resources, events, local help, and community information in one accessible directory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

/** Fallback order when we know nothing about the visitor yet. */
const DEFAULT_FEATURED: Category[] = ["food", "events", "health", "jobs", "housing", "youth"];

/** Retail and general services remain valid listing types, but are not public browse categories. */
const BROWSABLE_CATEGORIES = CATEGORIES.filter((category) => category.id !== "retail" && category.id !== "services");

/**
 * Sensitive categories never influence the featured tiles. Someone browsing
 * legal or health help should not have that surfaced back at them on a shared
 * or borrowed phone.
 */
const SENSITIVE_CATEGORIES: Category[] = ["legal", "health"];

const PLACEHOLDERS = [
  "Free events this weekend",
  "Dentist near me",
  "Things happening in my neighborhood",
  "Free kayaking in the Bronx",
  "Food pantry near me",
  "Community meetings this week",
  "Local businesses to discover",
];

function HomePage() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [phIdx, setPhIdx] = useState(0);
  const { favorites, topCategories } = usePersonalization();
  const profile = useProfile();
  const meta = useResourceMeta();
  const needCats = profile.userNeeds.map((n) => NEED_TO_CATEGORY[n]);

  const [neighborhood, setNeighborhood] = useState<string>("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bronx.profile");
      const p = raw ? JSON.parse(raw) : {};
      if (typeof p.neighborhood === "string") setNeighborhood(p.neighborhood);
    } catch { /* ignore */ }
  }, []);

  const saveNeighborhood = (value: string) => {
    setNeighborhood(value);
    try {
      const raw = localStorage.getItem("bronx.profile");
      const p = raw ? JSON.parse(raw) : {};
      localStorage.setItem("bronx.profile", JSON.stringify({ ...p, neighborhood: value }));
      window.dispatchEvent(new CustomEvent("bronx:profile"));
    } catch { /* ignore */ }
  };

  // Rotating placeholder: the app is discovery + utility, not only crisis help.
  useEffect(() => {
    const id = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 3800);
    return () => clearInterval(id);
  }, []);

  // The guided tour is a demo tool: reachable at /?tour=1 and from /pitch,
  // but it no longer competes for a resident's attention on arrival.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("tour") === "1") setTourOpen(true);
  }, []);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/help", search: { q: query } });
  };

  /**
   * Featured tiles: pinned/favorited first, then behavioural signals, then
   * stated needs, then defaults — always 6, drawn only from public browse categories
   * behind "See all".
   */
  const featuredIds = useMemo(() => {
    const favCats = favorites
      .map((id) => RESOURCES.find((r) => r.id === id)?.category)
      .filter(Boolean) as Category[];
    const signals = [...favCats, ...topCategories, ...needCats].filter(
      (c) => !SENSITIVE_CATEGORIES.includes(c),
    );
    const out: Category[] = [];
    for (const c of [...signals, ...DEFAULT_FEATURED]) {
      if (c && !out.includes(c) && BROWSABLE_CATEGORIES.some((x) => x.id === c)) out.push(c);
      if (out.length === 6) break;
    }
    return out;
  }, [favorites, topCategories, needCats]);

  const featuredCats = featuredIds.map((id) => BROWSABLE_CATEGORIES.find((c) => c.id === id)).filter((c) => c !== undefined);
  const moreCats = BROWSABLE_CATEGORIES.filter((c) => !featuredIds.includes(c.id));

  const verifiedThisWeek = useMemo(
    () =>
      Object.values(meta).filter(
        (m) => m.last_verified && Date.now() - new Date(m.last_verified).getTime() < 7 * 86_400_000,
      ).length,
    [meta],
  );

  return (
    <AppShell
      fab={
        <button onClick={() => setShowReport(true)} className="no-min-h inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-foreground text-background shadow-xl hover:scale-105 transition font-semibold">
          <MessageCircle className="h-5 w-5" /> {t("interface.feedback")}
        </button>
      }
    >
      {/* 1. Hero + search — one job: what's around me, right now */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">{t("appName")}</h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("interface.homeHero")}
          </p>

          <form onSubmit={onSubmitSearch} className="mt-5 max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch gap-2">
            <div id="search-bar" className="relative flex-1">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "en" ? PLACEHOLDERS[phIdx] : t("interface.searchPlaceholder")}
                className="w-full ps-12 pe-4 py-4 rounded-2xl border-2 border-border bg-card text-base focus:outline-none focus:border-primary shadow-sm min-h-[56px]"
                aria-label={t("interface.searchAria")}
              />
            </div>
            <div className="flex items-center gap-2 justify-center">
              <div className="relative">
                <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <select
                  value={neighborhood}
                  onChange={(e) => saveNeighborhood(e.target.value)}
                  aria-label={t("interface.neighborhood")}
                  className="w-44 ps-9 pe-3 py-4 rounded-2xl border-2 border-border bg-card text-sm focus:outline-none focus:border-primary shadow-sm min-h-[56px] appearance-none"
                >
                  <option value="">{t("interface.allBronx")}</option>
                  {BRONX_NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <VoiceSearchButton onResult={(text) => { setQuery(text); nav({ to: "/help", search: { q: text } }); }} />
            </div>
          </form>

          <SimplerViewBanner className="mt-4 max-w-2xl mx-auto" />

          {/* Why this beats a generic search engine — stated plainly, once. */}
          <p className="mt-3 text-sm text-muted-foreground">{t("listing.trustLine")}</p>

          {/* Privacy is a product feature, stated where the behaviour happens. */}
          <p className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            {t("interface.privacySearch")}{" "}
            <Link to="/privacy" className="font-semibold text-primary hover:underline">{t("interface.privacyLink")}</Link>
          </p>

          <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
            <SpeakButton text={`${t("appName")}. Everything happening and available around you in the Bronx.`} label={t("listen")} />
            <Link to="/data-quality" className="no-min-h inline-flex items-center gap-1.5 text-xs font-semibold text-success hover:underline">
              <ShieldCheck className="h-3.5 w-3.5" />
              {verifiedThisWeek > 0 ? t("interface.verifiedWeek", { count: verifiedThisWeek }) : t("interface.howVerifyListings")}
            </Link>
            <Link to="/ask" className="no-min-h inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <MessageCircleQuestion className="h-3.5 w-3.5" /> Ask a question
            </Link>
            <Link to="/search" search={{ q: "" }} className="no-min-h inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <Search className="h-3.5 w-3.5" /> {t("interface.keywordSearch")}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Category grid — primary navigation stays immediately below the intro. */}
      <section className="max-w-5xl mx-auto px-4 mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{t("interface.browseCategory")}</h2>
        <CoachMark storageKey="bronx.coach.categories.v1" message={t("common.coachCategories")} delay={350}>
        <div id="category-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {featuredCats.map((c) => {
            const linkProps = c.id === "government"
              ? { to: "/civic" as const }
              : { to: "/category/$cat" as const, params: { cat: c.id } };
            return (
              <Link key={c.id} {...linkProps} className="no-min-h group rounded-2xl p-4 sm:p-5 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 transition flex flex-col items-center justify-center text-center min-h-[110px]" style={{ backgroundColor: c.color }}>
                <span className="text-3xl sm:text-4xl mb-1.5" aria-hidden>{c.emoji}</span>
                <span className="text-sm sm:text-base font-semibold">{t(c.labelKey)}</span>
              </Link>
            );
          })}
        </div>
        </CoachMark>
        {moreCats.length > 0 && (
          <>
            <button onClick={() => setShowMore((v) => !v)} className="no-min-h mt-3 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-border bg-card hover:bg-secondary font-semibold text-foreground min-h-[48px]">
              {showMore ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}{" "}
              {showMore ? t("interface.showFewerCategories") : t("interface.seeAllCategories", { count: BROWSABLE_CATEGORIES.length })}
            </button>
            {showMore && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {moreCats.map((c) => {
                  const linkProps = c.id === "government"
                    ? { to: "/civic" as const }
                    : { to: "/category/$cat" as const, params: { cat: c.id } };
                  return (
                    <Link key={c.id} {...linkProps} className="no-min-h rounded-2xl p-4 text-white shadow-md hover:shadow-xl transition flex flex-col items-center justify-center text-center min-h-[100px]" style={{ backgroundColor: c.color }}>
                      <span className="text-3xl mb-1" aria-hidden>{c.emoji}</span>
                      <span className="text-sm font-semibold">{t(c.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Distance source: zip code by default, live location only on request. */}
      <div className="max-w-5xl mx-auto px-4 mt-5">
        <LocationSourceCard />
      </div>

      {/* 3. Discovery: a brief upcoming-events preview below primary navigation. */}
      <HappeningNear neighborhood={neighborhood || null} />

      {/* Single, clearly-labeled sponsored banner. Contextual only. */}
      <SponsoredBanner />

      {/* 5. Quieter utility rows — present, but no longer competing with the top */}
      <section className="max-w-5xl mx-auto px-4 mt-8 mb-12 grid sm:grid-cols-2 gap-3">
        <Link
          to="/emergency"
          className="no-min-h flex items-center gap-3 rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-4 hover:bg-destructive/15 transition"
        >
          <span className="h-11 w-11 shrink-0 rounded-full bg-destructive text-destructive-foreground grid place-items-center">
            <Phone className="h-5 w-5" />
          </span>
          <span className="min-w-0">
             <span className="block font-bold text-destructive">{t("interface.emergencyHelp")}</span>
            <span className="block text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
               <WifiOff className="h-3.5 w-3.5" /> {t("interface.worksOffline")}
            </span>
          </span>
        </Link>
        <Link
          id="sms-callout"
          to="/sms"
          className="no-min-h flex items-center gap-3 rounded-2xl border-2 border-primary/40 bg-card px-4 py-4 text-start hover:bg-primary/5 transition"
        >
          <span className="h-11 w-11 shrink-0 rounded-full bg-primary/15 text-primary grid place-items-center">
            <MessageSquare className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-foreground text-sm">
              Text “FOOD” to {SMS_CONFIGURED ? formatSmsNumber(SMS_NUMBER) : "our text line"}
            </span>
            <span className="block text-xs text-muted-foreground">
               {t("interface.noSmartphone")}{SMS_CONFIGURED ? "" : ` · ${t("interface.lineSoon")}`}
            </span>
          </span>
        </Link>
      </section>

      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      {tourOpen && <DemoTour onClose={() => setTourOpen(false)} />}
      <BronxFactPopup />
    </AppShell>
  );
}
