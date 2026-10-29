import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import type { CategoryMeta } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { BRONX_NEIGHBORHOODS } from "@/lib/neighborhoods";
import { SpeakButton } from "@/components/SpeakButton";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { LANGS } from "@/lib/i18n";
import { useNycTime } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";
import { heroPhotoFor } from "../lib/hero-photos";
import { nycIsoDate } from "../lib/today";

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
 * Top of Home: today's Bronx photo with the date, area and title over it and
 * one search field (voice inside it); then a row of one-tap needs led by
 * "Ask a question". Trust links live at the bottom of Home.
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

  // Rotating examples: the app is discovery + utility, not only crisis help.
  useEffect(() => {
    const id = setInterval(() => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length), 3800);
    return () => clearInterval(id);
  }, []);

  const search = (q: string) => nav({ to: "/help", search: { q } });

  const photo = heroPhotoFor(nycIsoDate());

  return (
    <section className="mx-auto max-w-5xl px-3 pt-3 lg:px-4 lg:pt-6">
      {/* A real Bronx photo, a different one each day, with a dark fade so the
          white text stays readable (docs/design-system.md, "Photos"). */}
      <div className="relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-masthead text-white lg:min-h-[26rem]">
        <img
          src={`/images/bronx/${photo.slug}-800.webp`}
          srcSet={`/images/bronx/${photo.slug}-800.webp 800w, /images/bronx/${photo.slug}-1280.webp 1280w`}
          sizes="(min-width: 1024px) 1024px, 100vw"
          alt={photo.alt}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          style={{ objectPosition: photo.focus }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/15 via-black/30 to-black/80"
        />
        <a
          href={photo.source}
          target="_blank"
          rel="noopener noreferrer"
          className="no-min-h absolute top-3 end-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/90 hover:text-white"
        >
          Photo: {photo.credit} · {photo.license}
        </a>
        <div className="absolute top-3 start-3">
          <SpeakButton text={`${t("appName")}. ${t("interface.homeHero")}`} label={t("listen")} />
        </div>

        <div className="p-4 lg:p-8">
          <div className="flex flex-wrap items-center gap-x-2 text-white/85">
            <Dateline />
            <span aria-hidden="true">·</span>
            <label className="relative inline-flex min-w-0 items-center">
              <span className="sr-only">{t("interface.neighborhood")}</span>
              <select
                value={neighborhood}
                onChange={(e) => onNeighborhoodChange(e.target.value)}
                className="label-caps no-min-h h-11 max-w-[12rem] min-w-0 appearance-none truncate bg-transparent pe-5 text-white hover:underline [&>option]:text-foreground"
              >
                <option value="">{t("interface.allBronx")}</option>
                {BRONX_NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute end-0 h-3.5 w-3.5 text-white/80"
                aria-hidden="true"
              />
            </label>
          </div>

          <h1 className="text-[2.6rem] leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            {t("home.todayLead")} <span className="text-bronx-orange">{t("home.todayAccent")}</span>
          </h1>

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
              className="flex h-14 items-center gap-2 rounded-2xl bg-card ps-4 pe-1.5 text-foreground shadow-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white"
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
                className="rounded-xl bg-bronx-orange text-bronx-orange-foreground hover:bg-bronx-orange/90"
                onResult={(text) => {
                  setQuery(text);
                  search(text);
                }}
              />
            </div>
          </form>
        </div>
      </div>

      {/* One tap to a need; asking in your own words comes first. */}
      <ul
        aria-label={t("interface.browseCategory")}
        className="-mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
      >
        <li className="shrink-0">
          <Link to="/ask" className={cn(CHIP, "border-primary bg-primary text-primary-foreground")}>
            {t("home.askQuestion")}
          </Link>
        </li>
        {needs.map((c) => (
          <li key={c.id} className="shrink-0">
            <Link
              {...(c.id === "government"
                ? { to: "/civic" as const }
                : { to: "/category/$cat" as const, params: { cat: c.id } })}
              className={cn(CHIP, "border-border bg-card text-foreground hover:bg-secondary")}
            >
              {t(c.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const CHIP =
  "no-min-h simplified-exempt inline-flex h-11 items-center rounded-full border px-4 text-sm font-bold";

/** "Wednesday, October 28", in New York time. */
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
    <p className="label-caps py-1">
      <span className="sm:hidden">{format("short")}</span>
      <span className="hidden sm:inline">{format("long")}</span>
    </p>
  );
}
