import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { CATEGORY_ICONS, ResourceCard } from "@/features/resources";
import { Chip, chipVariants } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
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
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Bronx Resource Map
          </h1>
          <ViewToggle value={view} onChange={setView} />
        </div>

        <LocationSourceCard className="mb-4" />

        <div className="mb-4 space-y-3 border-t-[3px] border-b border-t-foreground border-b-border pt-2 pb-4">
          <p className="label-caps text-muted-foreground">Categories</p>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => {
              const meta = CATEGORY_PIN[c.id];
              const active = activeCats.has(c.id);
              const Icon = CATEGORY_ICONS[c.id];
              return (
                // The chips double as the map legend: a shown category keeps its
                // pin-colored icon; a hidden one fades to grey.
                <button
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  aria-pressed={active}
                  className={cn(
                    chipVariants(),
                    active
                      ? "border-foreground"
                      : "border-dashed text-muted-foreground line-through",
                  )}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={active ? { color: meta?.color } : undefined}
                    aria-hidden="true"
                  />
                  {meta?.label ?? c.id}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold inline-flex items-center gap-2">
              Within
              <select
                value={maxDist}
                onChange={(e) => setMaxDist(Number(e.target.value))}
                className="h-9 rounded-md border border-border bg-card px-2 text-sm"
              >
                <option value={1}>1 mi</option>
                <option value={3}>3 mi</option>
                <option value={5}>5 mi</option>
                <option value={50}>Any</option>
              </select>
            </label>
            <Chip selected={heatmap} icon={Flame} onClick={() => setHeatmap((h) => !h)}>
              Heatmap
            </Chip>
            <Link
              to="/search"
              className="no-min-h ms-auto text-sm font-bold text-primary underline underline-offset-4 hover:decoration-2"
            >
              Search resources →
            </Link>
          </div>
        </div>

        {view === "map" && <MapView resources={mapResources} height={560} showHeatmap={heatmap} />}
        {view === "sheet" && <SpreadsheetView rows={sheetRows} />}
        {view === "list" && (
          <ul className="grid grid-cols-1 border-t-[3px] border-foreground sm:grid-cols-2 sm:gap-x-8">
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
