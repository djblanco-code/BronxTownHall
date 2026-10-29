import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Lock, MapPin, Search, ShieldCheck } from "lucide-react";
import type { CategoryMeta } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { BRONX_NEIGHBORHOODS } from "@/lib/neighborhoods";
import { useResourceMeta } from "@/lib/resource-meta";
import { SpeakButton } from "@/components/SpeakButton";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { LANGS } from "@/lib/i18n";
import { useNycTime } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

const PLACEHOLDERS = [
  "Free events this weekend",
  "Dentist near me",
  "Things happening in my neighborhood",
  "Free kayaking in the Bronx",
  "Food pantry near me",
  "Community meetings this week",
  "Local businesses to discover",
];

/**
 * Top of Home, set like a newspaper nameplate: the dateline and area, the
 * title, one search field (voice inside it), a section menu of needs led by
 * "Ask a question", and two short trust links, closed off by a double rule.
 */
export function HomeHero({
  neighborhood,
  onNeighborhoodChange,
  needs,
}: {
  neighborhood: string;
  onNeighborhoodChange: (value: string) => void;
  /** Categories for the one-tap chips under search, most relevant first. */
  needs: CategoryMeta[];
}) {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const meta = useResourceMeta();

  // Rotating examples: the app is discovery + utility, not only crisis help.
  useEffect(() => {
    const id = setInterval(() => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length), 3800);
    return () => clearInterval(id);
  }, []);

  const verifiedThisWeek = useMemo(
    () =>
      Object.values(meta).filter(
        (m) => m.last_verified && Date.now() - new Date(m.last_verified).getTime() < 7 * 86_400_000,
      ).length,
    [meta],
  );

  const search = (q: string) => nav({ to: "/help", search: { q } });

  return (
    <section className="border-b-[3px] border-double border-foreground bg-background">
      <div className="mx-auto max-w-5xl px-4 pt-3 pb-4 lg:pt-8 lg:pb-6">
        <div className="flex flex-wrap items-center justify-between gap-x-3 border-b border-foreground">
          <Dateline />
          <label className="relative inline-flex min-w-0 items-center">
            <span className="sr-only">{t("interface.neighborhood")}</span>
            <MapPin
              className="pointer-events-none absolute start-0 h-3.5 w-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            <select
              value={neighborhood}
              onChange={(e) => onNeighborhoodChange(e.target.value)}
              className="label-caps no-min-h h-11 max-w-[11rem] min-w-0 appearance-none truncate bg-transparent ps-5 pe-5 text-foreground hover:underline"
            >
              <option value="">{t("interface.allBronx")}</option>
              {BRONX_NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-0 h-3.5 w-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          </label>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <h1 className="text-[2.75rem] leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
            {t("home.todayLead")} <span className="text-primary">{t("home.todayAccent")}</span>
          </h1>
          <div className="mt-1 shrink-0">
            <SpeakButton text={`${t("appName")}. ${t("interface.homeHero")}`} label={t("listen")} />
          </div>
        </div>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
          className="mt-4 lg:mt-6 lg:max-w-3xl"
        >
          <div
            id="search-bar"
            className="flex h-14 items-center gap-2 rounded-md border-2 border-foreground bg-card ps-4 pe-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring"
          >
            <Search className="h-5 w-5 shrink-0 text-foreground" aria-hidden="true" />
            <input
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === "en" ? PLACEHOLDERS[placeholderIndex] : t("interface.searchPlaceholder")
              }
              aria-label={t("interface.searchAria")}
              className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            />
            <VoiceSearchButton
              className="rounded-md bg-bronx-orange text-bronx-orange-foreground hover:bg-bronx-orange/90"
              onResult={(text) => {
                setQuery(text);
                search(text);
              }}
            />
          </div>
        </form>

        {/* A section menu, like a paper's: asking in your own words comes first. */}
        <ul
          aria-label={t("interface.browseCategory")}
          className="-mx-4 mt-2 flex gap-5 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
        >
          <li className="shrink-0">
            <Link to="/ask" className={cn(TAB, "border-primary text-primary")}>
              {t("home.askQuestion")}
            </Link>
          </li>
          {needs.map((c) => (
            <li key={c.id} className="shrink-0">
              <Link
                {...(c.id === "government"
                  ? { to: "/civic" as const }
                  : { to: "/category/$cat" as const, params: { cat: c.id } })}
                className={cn(TAB, "border-transparent hover:border-foreground")}
              >
                {t(c.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <Link
            to="/data-quality"
            className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-foreground hover:underline"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
            {verifiedThisWeek > 0
              ? t("interface.verifiedWeek", { count: verifiedThisWeek })
              : t("interface.howVerifyListings")}
          </Link>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-foreground hover:underline"
          >
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t("interface.privacyLink")}
          </Link>
        </p>
      </div>
    </section>
  );
}

const TAB = "no-min-h inline-flex h-11 items-center border-b-2 text-sm font-bold text-foreground";

/** "Wednesday, October 28", in New York time, like the dateline of a paper. */
function Dateline() {
  const { lang } = useI18n();
  const now = useNycTime();
  const locale = LANGS.find((l) => l.code === lang)?.bcp47;
  if (!now) return <p className="h-4" aria-hidden="true" />;
  const format = (style: "long" | "short") =>
    new Date().toLocaleDateString(locale, {
      weekday: style,
      month: style,
      day: "numeric",
      timeZone: "America/New_York",
    });
  return (
    <p className="label-caps py-1 text-muted-foreground">
      <span className="sm:hidden">{format("short")}</span>
      <span className="hidden sm:inline">{format("long")}</span>
    </p>
  );
}
