import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ResourceCard } from "@/features/resources";
import { useI18n } from "@/lib/i18n-context";
import { RESOURCES } from "@/lib/data";
import { detectIntent } from "@/lib/search-intent";
import { matchesFilters } from "@/components/FilterPanel";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { suggestCorrection } from "@/lib/fuzzy";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListenButton } from "@/components/ListenButton";
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
    const term = q.trim().toLowerCase();
    const matched = RESOURCES.filter((r) => {
      if (intent.category && r.category !== intent.category) return false;
      if (
        !matchesFilters(r, {
          ownership: intent.ownership,
          heritage: intent.heritage.join(","),
          dietary: intent.dietary,
          languages: intent.languages,
          accessibility: intent.accessibility,
          neighborhood: "",
        })
      )
        return false;
      if (!term) return true;
      const kw = (r.keywords ?? []).join(" ");
      const sub = r.subcategory ?? "";
      const hay =
        `${r.name.en} ${r.description.en} ${r.address} ${r.category} ${sub} ${kw} ${r.neighborhood ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
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
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => nav({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-3">Search Bronx resources</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <label htmlFor="search-input" className="sr-only">
              Search resources
            </label>
            <Search
              aria-hidden="true"
              className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
            />
            <input
              id="search-input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try: halal food, Guinean restaurant, wheelchair accessible…"
              className="w-full ps-12 pe-4 py-4 rounded-2xl border-2 border-border bg-card text-base focus:outline-none focus:border-primary shadow-sm min-h-[56px]"
              autoFocus
            />
          </div>
          <VoiceSearchButton onResult={(text) => setQ(text)} />
        </div>
        <Link
          to="/help"
          search={{ q: q.trim() || undefined }}
          className="no-min-h mt-3 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm hover:border-primary transition"
        >
          <Sparkles className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <span>
            <span className="font-semibold">Not sure what to search?</span> Describe your situation
            instead — “I got laid off and I have two kids”.
          </span>
        </Link>
        <LocationSourceCard className="mt-3" />
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
            <p className="text-sm font-medium text-primary">✨ {intent.message}</p>
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
                  className="no-min-h px-2.5 py-1 rounded-full border border-border font-semibold hover:bg-secondary"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    trackAiHelpful({ query: q, resourceCount: results.length, helpful: false });
                    setHelpfulRated("no");
                  }}
                  className="no-min-h px-2.5 py-1 rounded-full border border-border font-semibold hover:bg-secondary"
                >
                  No
                </button>
              </span>
            )}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm text-muted-foreground">
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
          <ul className="mt-4 space-y-3">
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
              <li className="text-center text-muted-foreground py-10">
                No matches. Try a different keyword.
              </li>
            )}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
