import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ResourceCard } from "@/features/resources";
import { useResourceMeta } from "@/lib/resource-meta";
import { MapView, MapResource } from "@/components/MapView";
import { SpreadsheetView, SheetRow } from "@/components/SpreadsheetView";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { CATEGORIES, RESOURCES, Category } from "@/lib/data";
import { CATEGORY_PIN } from "@/lib/map-pins";
import { ArrowLeft, Flame } from "lucide-react";
import { useMemo, useState } from "react";
import { isNonSpecificAddress } from "@/lib/address";
import { useLiveDistances } from "@/lib/live-location";
import { LocationSourceCard } from "@/components/LocationSourceCard";

export const Route = createFileRoute("/map")({
  staticData: { sitemap: true },
  component: GlobalMapPage,
});

function GlobalMapPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("map");
  const [activeCats, setActiveCats] = useState<Set<Category>>(new Set(CATEGORIES.map((c) => c.id)));
  const [heatmap, setHeatmap] = useState(false);
  const [maxDist, setMaxDist] = useState<number>(5);
  const distanceFor = useLiveDistances(useMemo(() => RESOURCES.map((r) => r.address), []));
  const resMeta = useResourceMeta();

  // Mobile / multi-site programs have no single point to pin or measure from,
  // so they are left off the map rather than given a made-up location.
  const filtered = useMemo(
    () =>
      RESOURCES.filter((r) => activeCats.has(r.category) && !isNonSpecificAddress(r.address))
        .map((r) => ({ ...r, distance: distanceFor(r.address, r.distance) }))
        .filter((r) => r.distance <= maxDist),
    [activeCats, maxDist, distanceFor],
  );

  const mapResources: MapResource[] = useMemo(
    () =>
      filtered.map((r) => ({
        id: r.id,
        name: r.name.en,
        category: r.category,
        address: r.address,
        phone: r.phone,
        distance: r.distance,
      })),
    [filtered],
  );
  const sheetRows: SheetRow[] = mapResources;

  const toggleCat = (c: Category) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Bronx Resource Map</h1>
          <ViewToggle value={view} onChange={setView} />
        </div>

        <LocationSourceCard className="mb-4" />

        <div className="rounded-2xl border border-border bg-card p-4 mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground me-1">
              Categories
            </span>
            {CATEGORIES.map((c) => {
              const meta = CATEGORY_PIN[c.id];
              const active = activeCats.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  aria-pressed={active}
                  className={`no-min-h inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${active ? "text-white" : "bg-card text-muted-foreground border-border"}`}
                  style={
                    active ? { backgroundColor: meta?.color, borderColor: meta?.color } : undefined
                  }
                >
                  <span>{meta?.emoji ?? "📍"}</span> {meta?.label ?? c.id}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-medium inline-flex items-center gap-2">
              Within
              <select
                value={maxDist}
                onChange={(e) => setMaxDist(Number(e.target.value))}
                className="px-2 py-1 rounded border border-border bg-card text-xs"
              >
                <option value={1}>1 mi</option>
                <option value={3}>3 mi</option>
                <option value={5}>5 mi</option>
                <option value={50}>Any</option>
              </select>
            </label>
            <button
              onClick={() => setHeatmap((h) => !h)}
              aria-pressed={heatmap}
              className={`no-min-h inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${heatmap ? "bg-orange-500 text-white border-orange-500" : "bg-card border-border"}`}
            >
              <Flame className="h-3 w-3" /> Heatmap
            </button>
            <Link
              to="/search"
              className="no-min-h ms-auto text-xs font-semibold text-primary hover:underline"
            >
              Search resources →
            </Link>
          </div>
        </div>

        {view === "map" && <MapView resources={mapResources} height={560} showHeatmap={heatmap} />}
        {view === "sheet" && <SpreadsheetView rows={sheetRows} />}
        {view === "list" && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((r) => (
              <li key={r.id}>
                <ResourceCard resource={r} meta={resMeta[r.id]} showCategory />
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
