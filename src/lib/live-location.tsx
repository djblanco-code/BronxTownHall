import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useProfile } from "@/lib/onboarding";
import { distanceFromCoords, haversineMiles, ZIP_LATLNG } from "@/lib/zip-distance";
import { trackEvent } from "@/lib/analytics";
import { useResourceLocations } from "@/lib/use-resource-locations";

/**
 * Live location — strictly opt-in, strictly for this visit.
 *
 * Design rules this module enforces on purpose:
 *  - `navigator.geolocation` is never touched until the resident taps the
 *    button, so no browser permission prompt appears on page load.
 *  - Coordinates live in React state only. Nothing is written to
 *    localStorage, sessionStorage, a cookie, or the database, so closing the
 *    tab erases them and there is no location history to leak.
 *  - `watchPosition` runs only while the app is open and only while live mode
 *    is on. Turning it off clears the watch immediately. There is no
 *    background or persistent tracking anywhere in the app.
 *  - Any failure (denied, unavailable, timeout) falls back silently to the
 *    saved ZIP centroid; the page never blocks on location.
 */

export type LocationMode = "zip" | "live";
export type LiveStatus = "idle" | "requesting" | "active" | "denied" | "unavailable" | "error";

type Coords = [number, number];

type LocationContextValue = {
  /** Which origin distances are currently measured from. */
  mode: LocationMode;
  status: LiveStatus;
  /** Live coordinates, only while live mode is active. */
  coords: Coords | null;
  accuracyMeters: number | null;
  /** True when the browser can even offer geolocation. */
  supported: boolean;
  /** Saved ZIP, if any — the fallback origin. */
  zip: string | null;
  /** Number of times the live position was refreshed this visit. */
  updates: number;
  enableLive: () => void;
  useZipOnly: () => void;
  /**
   * Distance in miles for a listing. Uses live coordinates when active,
   * otherwise the ZIP centroid, otherwise the listing's existing value.
   */
  distanceFor: (address: string, fallback: number, coords?: Coords | null) => number;
};

const LocationCtx = createContext<LocationContextValue | null>(null);

/** Refresh nearby listings once the resident has actually moved this far. */
const MOVE_THRESHOLD_MILES = 0.15;

export function LiveLocationProvider({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const zip = profile.userZipCode || null;

  const [mode, setMode] = useState<LocationMode>("zip");
  const [status, setStatus] = useState<LiveStatus>("idle");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [accuracyMeters, setAccuracy] = useState<number | null>(null);
  const [updates, setUpdates] = useState(0);
  const watchRef = useRef<number | null>(null);

  // Resolved after hydration: during server render there is no navigator, and
  // a plain render-time check would leave the button permanently disabled.
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "geolocation" in navigator);
  }, []);

  const clearWatch = useCallback(() => {
    if (watchRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchRef.current);
    }
    watchRef.current = null;
  }, []);

  // The watch never outlives the mounted app.
  useEffect(() => clearWatch, [clearWatch]);

  const useZipOnly = useCallback(() => {
    clearWatch();
    setMode("zip");
    setStatus("idle");
    setCoords(null);
    setAccuracy(null);
    setUpdates(0);
    trackEvent("location_mode_zip", {});
  }, [clearWatch]);

  const enableLive = useCallback(() => {
    if (!supported) {
      setStatus("unavailable");
      return;
    }
    setStatus("requesting");
    trackEvent("location_live_requested", {});
    clearWatch();
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next: Coords = [pos.coords.latitude, pos.coords.longitude];
        setAccuracy(Math.round(pos.coords.accuracy));
        setStatus("active");
        setMode("live");
        setCoords((prev) => {
          // Only re-sort the page once the position has meaningfully changed —
          // small GPS jitter should not reshuffle a list under someone's thumb.
          if (prev && haversineMiles(prev, next) < MOVE_THRESHOLD_MILES) return prev;
          if (prev) setUpdates((n) => n + 1);
          return next;
        });
      },
      (err) => {
        clearWatch();
        setMode("zip");
        setCoords(null);
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : err.code === err.TIMEOUT ? "error" : "unavailable");
        trackEvent("location_live_failed", { reason: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" });
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }, [clearWatch, supported]);

  const distanceFor = useCallback(
    (address: string, fallback: number, target?: Coords | null) => {
      if (mode === "live" && coords) {
        const live = distanceFromCoords(coords, address, target ?? null);
        if (live != null) return live;
        return fallback;
      }
      if (zip) {
        const origin = ZIP_LATLNG[zip];
        if (origin) {
          const byZip = distanceFromCoords(origin, address, target ?? null);
          if (byZip != null) return byZip;
        }
      }
      return fallback;
    },
    [mode, coords, zip],
  );

  const value = useMemo<LocationContextValue>(
    () => ({ mode, status, coords, accuracyMeters, supported, zip, updates, enableLive, useZipOnly, distanceFor }),
    [mode, status, coords, accuracyMeters, supported, zip, updates, enableLive, useZipOnly, distanceFor],
  );

  return <LocationCtx.Provider value={value}>{children}</LocationCtx.Provider>;
}

/**
 * Safe outside the provider (e.g. isolated tests): falls back to ZIP-only
 * behaviour rather than throwing, so no surface can break over location.
 */
export function useLiveLocation(): LocationContextValue {
  const ctx = useContext(LocationCtx);
  if (ctx) return ctx;
  return {
    mode: "zip",
    status: "idle",
    coords: null,
    accuracyMeters: null,
    supported: false,
    zip: null,
    updates: 0,
    enableLive: () => {},
    useZipOnly: () => {},
    distanceFor: (_address, fallback) => fallback,
  };
}

/**
 * Precise live distances for a set of listings.
 *
 * Zip centroids are only accurate to a neighbourhood, so once live mode is on
 * we geocode the visible addresses (through the existing cached geocoder) and
 * measure to the real building. Nothing is geocoded while in zip mode, so this
 * costs nothing for residents who never opt in.
 */
export function useLiveDistances(addresses: string[]) {
  const { mode, coords, distanceFor } = useLiveLocation();
  const live = mode === "live" && coords;
  const { get } = useResourceLocations(live ? addresses : []);

  return useCallback(
    (address: string, fallback: number) => {
      const loc = live ? get(address) : null;
      const target: Coords | null = loc ? [loc.latitude, loc.longitude] : null;
      return distanceFor(address, fallback, target);
    },
    // `get` reads from a state object that changes as geocoding resolves.
    [live, get, distanceFor], // eslint-disable-line react-hooks/exhaustive-deps
  );
}
