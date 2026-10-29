/// <reference types="google.maps" />
import { useEffect, useMemo, useRef, useState } from "react";
type MarkerClustererType = { clearMarkers: () => void };
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import { CATEGORY_PIN } from "@/lib/map-pins";
import { getDirectionsUrl } from "@/lib/maps";
import type { ResourceLocation } from "@/lib/location.functions";
import { useResourceLocations } from "@/lib/use-resource-locations";
import { Loader2, LocateFixed } from "lucide-react";

export type MapResource = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  distance: number;
  isBiz?: boolean;
};

// Bronx center
const BRONX_CENTER = { lat: 40.8448, lng: -73.8648 };
const BRONX_DEFAULT_ZOOM = 13;
// Never zoom out past the five boroughs, even if data is sparse or malformed.
const MIN_ZOOM = 11;
const NYC_BOUNDS = { minLat: 40.45, maxLat: 41.0, minLng: -74.3, maxLng: -73.65 };
function inNyc(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= NYC_BOUNDS.minLat &&
    lat <= NYC_BOUNDS.maxLat &&
    lng >= NYC_BOUNDS.minLng &&
    lng <= NYC_BOUNDS.maxLng
  );
}

/** A plain pin in the category's color: no emoji (docs/design-system.md). */
function pinSvg(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="18" cy="17" r="7" fill="#fff"/>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function MapView({
  resources,
  height = 480,
  showHeatmap = false,
}: {
  resources: MapResource[];
  height?: number;
  showHeatmap?: boolean;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clusterRef = useRef<MarkerClustererType | null>(null);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const heatRef = useRef<{ setMap: (m: google.maps.Map | null) => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<google.maps.LatLngLiteral | null>(null);

  const addresses = useMemo(() => resources.map((r) => r.address), [resources]);
  const { get: getLoc, isLoading } = useResourceLocations(addresses);

  // Init map
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((g) => {
        if (cancelled || !elRef.current) return;
        mapRef.current = new g.maps.Map(elRef.current, {
          center: BRONX_CENTER,
          zoom: BRONX_DEFAULT_ZOOM,
          minZoom: MIN_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        infoRef.current = new g.maps.InfoWindow();
        setReady(true);
      })
      .catch((e) => setErr(e.message ?? "Map failed to load"));
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtered/locatable resources
  const visible = useMemo(() => {
    return resources
      .map((r) => ({ r, loc: getLoc(r.address) }))
      .filter((x): x is { r: MapResource; loc: ResourceLocation } => x.loc !== null)
      .filter((x) => inNyc(x.loc.latitude, x.loc.longitude));
  }, [resources, getLoc]);

  // Render markers + clusters
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;
    const g = window.google!;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    clusterRef.current?.clearMarkers();

    const markers = visible.map(({ r, loc }) => {
      const cat = CATEGORY_PIN[r.category] ?? CATEGORY_PIN.government;
      const marker = new g.maps.Marker({
        position: { lat: loc.latitude, lng: loc.longitude },
        title: r.name,
        icon: {
          url: pinSvg(cat.color),
          scaledSize: new g.maps.Size(36, 46),
          anchor: new g.maps.Point(18, 46),
        },
      });
      marker.addListener("click", () => {
        if (!infoRef.current || !mapRef.current) return;
        infoRef.current.setContent(renderInfoHtml(r, loc));
        infoRef.current.open({ map: mapRef.current, anchor: marker });
      });
      return marker;
    });
    markersRef.current = markers;
    // Dynamic import keeps the CJS package out of the SSR module graph.
    import("@googlemaps/markerclusterer").then((mod) => {
      if (cancelled || !mapRef.current) return;
      type Ctor = new (opts: {
        map: google.maps.Map;
        markers: google.maps.Marker[];
      }) => MarkerClustererType;
      const C =
        (mod as { MarkerClusterer?: Ctor }).MarkerClusterer ??
        (mod as { default?: { MarkerClusterer: Ctor } }).default?.MarkerClusterer;
      if (!C) return;
      clusterRef.current = new C({ map: mapRef.current, markers });
    });

    // Fit bounds — never wider than the five boroughs
    if (markers.length) {
      const map = mapRef.current;
      const bounds = new g.maps.LatLngBounds();
      markers.forEach((m) => {
        const p = m.getPosition();
        if (p) bounds.extend(p);
      });
      map.fitBounds(bounds, 64);
      if (markers.length === 1) map.setZoom(15);
      g.maps.event.addListenerOnce(map, "idle", () => {
        const z = map.getZoom() ?? BRONX_DEFAULT_ZOOM;
        if (z < MIN_ZOOM) {
          map.setCenter(BRONX_CENTER);
          map.setZoom(BRONX_DEFAULT_ZOOM);
        }
      });
    } else {
      mapRef.current.setCenter(BRONX_CENTER);
      mapRef.current.setZoom(BRONX_DEFAULT_ZOOM);
    }
    return () => {
      cancelled = true;
    };
  }, [ready, visible]);

  // Heatmap
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const g = window.google!;
    const viz = (
      g.maps as unknown as {
        visualization?: {
          HeatmapLayer: new (opts: unknown) => { setMap: (m: google.maps.Map | null) => void };
        };
      }
    ).visualization;
    if (!viz) return;
    heatRef.current?.setMap(null);
    heatRef.current = null;
    if (!showHeatmap) return;
    const layer = new viz.HeatmapLayer({
      data: visible.map(({ loc }) => new g.maps.LatLng(loc.latitude, loc.longitude)),
      radius: 36,
      opacity: 0.65,
    });
    layer.setMap(mapRef.current);
    heatRef.current = layer;
  }, [ready, showHeatmap, visible]);

  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        setUserPos(pos);
        mapRef.current!.panTo(pos);
        mapRef.current!.setZoom(14);
        new window.google!.maps.Marker({
          map: mapRef.current!,
          position: pos,
          title: "You are here",
          icon: {
            path: window.google!.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 3,
          },
        });
      },
      () => {},
      { timeout: 8000 },
    );
  };

  if (err) {
    return (
      <div className="rounded-md border border-border p-6 text-sm text-muted-foreground">
        Map unavailable: {err}
      </div>
    );
  }

  return (
    <div
      className="relative rounded-md overflow-hidden border border-border bg-secondary"
      style={{ height }}
    >
      <div ref={elRef} className="absolute inset-0" aria-label="Resource map" role="application" />
      <div className="absolute bottom-3 end-3 flex flex-col gap-2">
        <button
          onClick={locateMe}
          aria-label="Center map on my location"
          className="no-min-h h-11 w-11 rounded-md bg-card border border-border grid place-items-center hover:bg-secondary"
        >
          <LocateFixed className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {(!ready || isLoading) && (
        <div className="absolute top-3 start-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border text-xs font-semibold">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />{" "}
          {ready ? "Locating resources…" : "Loading map…"}
        </div>
      )}
      <p className="absolute bottom-3 start-3 px-2.5 py-1 rounded-md bg-card border border-border text-xs font-semibold text-foreground">
        {visible.length} on map
      </p>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

function renderInfoHtml(r: MapResource, loc: ResourceLocation): string {
  const cat = CATEGORY_PIN[r.category] ?? CATEGORY_PIN.government;
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const apple =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    (/Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg/i.test(ua));
  const directionsHref =
    getDirectionsUrl(
      { address: r.address, latitude: loc.latitude, longitude: loc.longitude },
      apple,
    ) ?? "#";
  const detailHref = r.isBiz
    ? ""
    : `<a href="/resource/${encodeURIComponent(r.id)}" style="display:inline-block;margin-top:8px;color:#fff;background:#2563eb;padding:6px 10px;border-radius:6px;font-weight:600;font-size:12px;text-decoration:none;">View details</a>`;
  return `
    <div style="min-width:240px;max-width:280px;font-family:system-ui,sans-serif;">
      <div style="display:flex;align-items:center;gap:6px;font-weight:700;font-size:14px;">
        <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${cat.color};"></span>
        ${escapeHtml(r.name)}
      </div>
      <div style="font-size:12px;color:#444;margin-top:2px;">${escapeHtml(cat.label)} · ${r.distance} mi</div>
      <div style="font-size:12px;margin-top:4px;">${escapeHtml(r.address)}</div>
      <div style="font-size:12px;margin-top:2px;"><a href="tel:${escapeHtml(r.phone)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(r.phone)}</a></div>
      <div style="margin-top:6px;display:flex;gap:6px;">
        <a href="${escapeHtml(directionsHref)}" target="_blank" rel="noreferrer" style="flex:1;text-align:center;background:#10b981;color:#fff;padding:6px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">Get Directions</a>
        ${detailHref}
      </div>
    </div>`;
}
