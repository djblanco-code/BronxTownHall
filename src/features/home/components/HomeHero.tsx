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
import { useI18n } from "@/lib/i18n-context";
import { BRONX_NEIGHBORHOODS } from "@/lib/neighborhoods";
import { useResourceMeta } from "@/lib/resource-meta";
import { SpeakButton } from "@/components/SpeakButton";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";

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
 * Search-first top of Home: where (neighborhood), what (one search field
 * with voice inside it), and two quiet trust lines. Nothing else competes.
 */
export function HomeHero({
  neighborhood,
  onNeighborhoodChange,
}: {
  neighborhood: string;
  onNeighborhoodChange: (value: string) => void;
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
    <section className="bg-gradient-to-b from-primary/10 to-background">
      <div className="mx-auto max-w-5xl px-4 pt-4 pb-2 lg:pt-10">
        <div className="flex items-center justify-between gap-3">
          <label className="relative inline-flex min-w-0 items-center">
            <span className="sr-only">{t("interface.neighborhood")}</span>
            <MapPin
              className="pointer-events-none absolute start-2.5 h-4 w-4 text-primary"
              aria-hidden="true"
            />
            <select
              value={neighborhood}
              onChange={(e) => onNeighborhoodChange(e.target.value)}
              className="no-min-h h-10 min-w-0 max-w-[16rem] appearance-none truncate rounded-full bg-transparent ps-8 pe-8 text-sm font-semibold text-foreground hover:bg-card/70"
            >
              <option value="">{t("interface.allBronx")}</option>
              {BRONX_NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-2.5 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </label>
          <SpeakButton text={`${t("appName")}. ${t("interface.homeHero")}`} label={t("listen")} />
        </div>

        <h1 className="mt-3 text-2xl tracking-tight text-foreground sm:text-4xl">
          {t("home.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t("interface.homeHero")}</p>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
          className="mt-4"
        >
          <div
            id="search-bar"
            className="flex h-14 items-center gap-2 rounded-full border-2 border-border bg-card ps-4 pe-1.5 shadow-sm transition focus-within:border-primary"
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

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/ask"
            className="no-min-h inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            <MessageCircleQuestion className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("home.askQuestion")}
          </Link>
          <Link
            to="/search"
            search={{ q: "" }}
            className="no-min-h inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            <Search className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("interface.keywordSearch")}
          </Link>
        </div>

        <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-1.5">
            <Lock className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              {t("interface.privacySearch")}{" "}
              <Link to="/privacy" className="font-semibold text-primary hover:underline">
                {t("interface.privacyLink")}
              </Link>
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
            <span>
              {t("listing.trustLine")}{" "}
              <Link to="/data-quality" className="font-semibold text-primary hover:underline">
                {verifiedThisWeek > 0
                  ? t("interface.verifiedWeek", { count: verifiedThisWeek })
                  : t("interface.howVerifyListings")}
              </Link>
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
