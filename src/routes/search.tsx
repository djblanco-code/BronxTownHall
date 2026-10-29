import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ResourceCard } from "@/features/resources";
import { useI18n } from "@/lib/i18n-context";
import { RESOURCES } from "@/lib/data";
import { countMatches, detectIntent, hasAnyFilter, searchTerms } from "@/lib/search-intent";
import { matchesFilters } from "@/components/FilterPanel";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { suggestCorrection } from "@/lib/fuzzy";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListenButton } from "@/components/ListenButton";
import { EmptyState } from "@/components/ui/empty-state";
import { buildResourceScript } from "@/lib/tts-context";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { MapView, MapResource } from "@/components/MapView";
import { SpreadsheetView, SheetRow } from "@/components/SpreadsheetView";
import {
  trackSearchPerformed,
  trackSearchClicked,
  trackSearchAiUsed,
  trackAiHelpful,
} from "@/lib/track-search";
import { trackResourceFound } from "@/lib/track-journey";
import { useLiveDistances } from "@/lib/live-location";
import { LocationSourceCard } from "@/components/LocationSourceCard";
import { isNonSpecificAddress } from "@/lib/address";
import { useResourceMeta } from "@/lib/resource-meta";

type SearchSchema = { q?: string };

export const Route = createFileRoute("/search")({
  staticData: { sitemap: false },
  component: SearchPage,
  validateSearch: (s: Record<string, unknown>): SearchSchema => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
});

function SearchPage() {
  const { q: initialQ } = useSearch({ from: "/search" });
  const nav = useNavigate();
  const { lang, t } = useI18n();
  const [q, setQ] = useState(initialQ ?? "");
  const [view, setView] = useState<ViewMode>("list");

  const searchStart = useRef<number>(0);
  const intent = useMemo(() => {
    searchStart.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    return detectIntent(q);
  }, [q]);
  const [helpfulRated, setHelpfulRated] = useState<string | null>(null);

  const distanceFor = useLiveDistances(useMemo(() => RESOURCES.map((r) => r.address), []));

  const results = useMemo(() => {
    const filtered = RESOURCES.filter((r) => {
      if (intent.category && r.category !== intent.category) return false;
      return matchesFilters(r, {
        ownership: intent.ownership,
        heritage: intent.heritage.join(","),
        dietary: intent.dietary,
        languages: intent.languages,
        accessibility: intent.accessibility,
        neighborhood: "",
      });
    });
    // Words left after the filters: a listing matches if it mentions any of
    // them, best matches first. A whole sentence ("help paying my heating
    // bill") still finds the listings that mention "heating".
    const terms = searchTerms(q);
    let matched = filtered;
    if (terms.length) {
      const scored = filtered
        .map((r) => {
          const text = `${r.name.en} ${r.description.en} ${r.address} ${r.category} ${r.subcategory ?? ""} ${(r.keywords ?? []).join(" ")} ${r.neighborhood ?? ""}`;
          return { r, score: countMatches(text, terms) };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);
      // A category or filter was recognised but no listing mentions the other
      // words: show the category rather than "no matches".
      const hasFilter = !!intent.category || hasAnyFilter(intent);
      matched = scored.length || !hasFilter ? scored.map((x) => x.r) : filtered;
    }
    // Measure from live coordinates when the resident opted in, else their zip.
    return matched.map((r) =>
      isNonSpecificAddress(r.address) ? r : { ...r, distance: distanceFor(r.address, r.distance) },
    );
  }, [q, intent, distanceFor]);

  const resMeta = useResourceMeta();

  // Debounce so we log settled queries, not every keystroke.
  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const id = setTimeout(() => {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const elapsed = Math.max(0, now - searchStart.current);
      trackSearchPerformed({ query: term, resultCount: results.length, responseTimeMs: elapsed });
      // Intent detection is our smart/AI-assisted interpretation layer.
      if (intent.message) trackSearchAiUsed({ query: term, responseTimeMs: elapsed });
    }, 700);
    return () => clearTimeout(id);
  }, [q, results.length, intent.message]);

  useEffect(() => {
    setHelpfulRated(null);
  }, [q]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => nav({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>
        <h1 className="text-3xl text-foreground mb-3 sm:text-4xl">Search Bronx resources</h1>
        <div className="flex h-14 items-center gap-2 rounded-md border border-border bg-card ps-4 pe-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
          <label htmlFor="search-input" className="sr-only">
            Search resources
          </label>
          <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-foreground" />
          <input
            id="search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try: halal food, Guinean restaurant, wheelchair accessible…"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            autoFocus
          />
          <VoiceSearchButton
            className="rounded-md bg-bronx-orange text-bronx-orange-foreground hover:bg-bronx-orange/90"
            onResult={(text) => setQ(text)}
          />
        </div>
        <Link
          to="/help"
          search={{ q: q.trim() || undefined }}
          className="no-min-h group mt-3 flex items-start gap-3 border-b border-border py-3 text-sm"
        >
          <Sparkles className="mt-0.5 h-4 w-4 text-primary shrink-0" aria-hidden />
          <span>
            <span className="font-bold text-primary group-hover:underline">
              Not sure what to search?
            </span>{" "}
            Describe your situation instead — “I got laid off and I have two kids”.
          </span>
        </Link>
        <LocationSourceCard />
        {(() => {
          const suggestion = q.trim() && results.length < 3 ? suggestCorrection(q) : null;
          return suggestion ? (
            <p className="mt-3 text-sm">
              Did you mean{" "}
              <button
                onClick={() => setQ(suggestion)}
                className="no-min-h font-semibold text-primary underline hover:no-underline"
              >
                {suggestion}
              </button>
              ?
            </p>
          ) : null;
        })()}
        {intent.message && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="inline-flex items-start gap-1.5 text-sm font-medium text-primary">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {intent.message}
            </p>
            {helpfulRated ? (
              <span className="text-xs text-muted-foreground">Thanks for the feedback!</span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                Helpful?
                <button
                  onClick={() => {
                    trackAiHelpful({ query: q, resourceCount: results.length, helpful: true });
                    setHelpfulRated("yes");
                  }}
                  className="no-min-h h-9 rounded-md border border-border px-3 font-semibold hover:border-foreground"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    trackAiHelpful({ query: q, resourceCount: results.length, helpful: false });
                    setHelpfulRated("no");
                  }}
                  className="no-min-h h-9 rounded-md border border-border px-3 font-semibold hover:border-foreground"
                >
                  No
                </button>
              </span>
            )}
          </div>
        )}
        <div className="mt-6 flex items-center justify-between gap-2 flex-wrap pt-2">
          <p className="text-sm font-bold text-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {results.length > 0 &&
              (() => {
                const top = results.slice(0, 10);
                const lead = `Found ${results.length} resource${results.length === 1 ? "" : "s"}${q.trim() ? ` for "${q.trim()}"` : ""}. Here ${top.length === 1 ? "is the top match" : `are the top ${top.length}`}.`;
                const body = top
                  .map((r) =>
                    buildResourceScript({
                      name: r.name[lang],
                      address: r.address,
                      phone: r.phone,
                      hours: r.hours[lang],
                      distance: r.distance,
                    }),
                  )
                  .join(" Next. ");
                return (
                  <ListenButton
                    text={`${lead} ${body}`}
                    title={`Search results${q.trim() ? `: ${q.trim()}` : ""}`}
                    style="calm"
                    variant="chip"
                    label="Listen to results"
                  />
                );
              })()}
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {view === "map" && (
          <div className="mt-4">
            <MapView
              resources={results.map((r): MapResource => ({
                id: r.id,
                name: r.name.en,
                category: r.category,
                address: r.address,
                phone: r.phone,
                distance: r.distance,
              }))}
              height={500}
            />
          </div>
        )}
        {view === "sheet" && (
          <div className="mt-4">
            <SpreadsheetView
              rows={results.map((r): SheetRow => ({
                id: r.id,
                name: r.name.en,
                category: r.category,
                address: r.address,
                phone: r.phone,
                distance: r.distance,
              }))}
            />
          </div>
        )}
        {view === "list" && (
          <ul className="mt-2 border-t border-border">
            {results.map((r, i) => (
              <li key={r.id}>
                <ResourceCard
                  resource={r}
                  meta={resMeta[r.id]}
                  showCategory
                  onOpen={() => {
                    trackSearchClicked({ query: q, resourceId: r.id, position: i + 1 });
                    trackResourceFound({ query: q, resourceId: r.id, category: r.category });
                  }}
                />
              </li>
            ))}
            {results.length === 0 && (
              <li>
                <EmptyState
                  icon={Search}
                  title="No matches. Try a different keyword."
                  className="border-t-0"
                />
              </li>
            )}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
