import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Lock,
  MapPin,
  MessageCircleQuestion,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { CategoryMeta } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { BRONX_NEIGHBORHOODS } from "@/lib/neighborhoods";
import { useResourceMeta } from "@/lib/resource-meta";
import { SpeakButton } from "@/components/SpeakButton";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { LANGS } from "@/lib/i18n";
import { useNycTime } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";
import { greetingKey } from "../lib/today";

const LATIN = new Set(["en", "es", "fr"]);

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
 * Top of Home: the date and greeting, one search field (voice inside it),
 * a row of one-tap needs led by "Ask a question", and two short trust links.
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
    <section className="relative isolate overflow-hidden bg-masthead text-masthead-foreground">
      {/* Oversized borough mark, like a newspaper nameplate. Decorative only. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-6 -bottom-10 -z-10 select-none font-display text-[11rem] leading-none text-white/[0.06] sm:text-[16rem] lg:-end-2 lg:text-[22rem]"
      >
        BX
      </span>
      <div className="mx-auto max-w-5xl px-4 pt-3 pb-5 lg:pt-8 lg:pb-10">
        <div className="flex items-center justify-between gap-3">
          <label className="relative inline-flex min-w-0 items-center">
            <span className="sr-only">{t("interface.neighborhood")}</span>
            <MapPin
              className="pointer-events-none absolute start-3 h-4 w-4 text-white/80"
              aria-hidden="true"
            />
            <select
              value={neighborhood}
              onChange={(e) => onNeighborhoodChange(e.target.value)}
              className="no-min-h h-10 min-w-0 max-w-[16rem] appearance-none truncate rounded-full border border-white/20 bg-white/10 ps-9 pe-9 text-sm font-semibold text-white hover:bg-white/15 [&>option]:text-foreground"
            >
              <option value="">{t("interface.allBronx")}</option>
              {BRONX_NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-3 h-4 w-4 text-white/70"
              aria-hidden="true"
            />
          </label>
          <SpeakButton text={`${t("appName")}. ${t("interface.homeHero")}`} label={t("listen")} />
        </div>

        <Greeting neighborhood={neighborhood} />
        <h1 className="mt-1 text-[2.6rem] leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {t("home.todayTitle")}
        </h1>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
          className="mt-4 lg:mt-7 lg:max-w-3xl"
        >
          <div
            id="search-bar"
            className="flex h-14 items-center gap-2 rounded-full bg-card ps-4 pe-1.5 shadow-lg shadow-black/20 ring-2 ring-transparent transition focus-within:ring-white/60"
          >
            <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
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
              onResult={(text) => {
                setQuery(text);
                search(text);
              }}
            />
          </div>
        </form>

        {/* One tap to a need, Google Maps–style; asking in your own words comes first. */}
        <ul
          aria-label={t("interface.browseCategory")}
          className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
        >
          <li className="shrink-0">
            <Link to="/ask" className={GHOST_CHIP}>
              <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
              {t("home.askQuestion")}
            </Link>
          </li>
          {needs.map((c) => (
            <li key={c.id} className="shrink-0">
              <Link
                {...(c.id === "government"
                  ? { to: "/civic" as const }
                  : { to: "/category/$cat" as const, params: { cat: c.id } })}
                className={GHOST_CHIP}
              >
                <span aria-hidden="true">{c.emoji}</span>
                {t(c.labelKey)}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75">
          <Link
            to="/data-quality"
            className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-white hover:underline"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#4ade80]" aria-hidden="true" />
            {verifiedThisWeek > 0
              ? t("interface.verifiedWeek", { count: verifiedThisWeek })
              : t("interface.howVerifyListings")}
          </Link>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1.5 underline-offset-2 hover:text-white hover:underline"
          >
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t("interface.privacyLink")}
          </Link>
        </p>
      </div>
      <FlagStripe />
    </section>
  );
}

const GHOST_CHIP =
  "no-min-h inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20";

/** A Bronx-flag stripe under the masthead: orange, with a white band. */
function FlagStripe() {
  return (
    <div aria-hidden="true" className="flex h-1.5">
      <span className="flex-[5] bg-bronx-orange" />
      <span className="flex-1 bg-white" />
      <span className="flex-[5] bg-bronx-orange" />
    </div>
  );
}

function Greeting({ neighborhood }: { neighborhood: string }) {
  const { t, lang } = useI18n();
  const now = useNycTime();
  const locale = LANGS.find((l) => l.code === lang)?.bcp47;
  if (!now) return <p className="mt-4 h-4 lg:mt-8" aria-hidden="true" />;
  const greeting = t(`home.${greetingKey(now.minutes)}`);
  const date = new Date().toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
  return (
    <p
      className={cn(
        "mt-4 flex min-h-4 items-start gap-2 text-xs font-bold text-white/75 uppercase lg:mt-8",
        // Letter-spacing breaks joined scripts (Arabic) and Bengali conjuncts.
        LATIN.has(lang) && "tracking-[0.12em]",
      )}
    >
      <span
        aria-hidden="true"
        className="mt-[0.3em] h-2 w-2 shrink-0 self-start rounded-full bg-bronx-orange"
      />
      <span className="line-clamp-2">
        {date} ·{" "}
        {neighborhood ? t("home.greetingPlace", { greeting, place: neighborhood }) : greeting}
      </span>
    </p>
  );
}
