/// <reference types="google.maps" />
// Loads the Google Maps JS API exactly once with the libraries we need.

let loadingPromise: Promise<typeof google> | null = null;

const BROWSER_KEY = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY as string | undefined;

declare global {
  interface Window {
    __bronxGmapsInit?: () => void;
  }
}

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }
  if (window.google?.maps) return Promise.resolve(window.google);
  if (loadingPromise) return loadingPromise;
  if (!BROWSER_KEY) {
    return Promise.reject(new Error("Google Maps browser key not configured"));
  }

  loadingPromise = new Promise<typeof google>((resolve, reject) => {
    window.__bronxGmapsInit = () => {
      if (window.google?.maps) resolve(window.google);
      else reject(new Error("Google Maps loaded but window.google is missing"));
    };
    const s = document.createElement("script");
    const params = new URLSearchParams({
      key: BROWSER_KEY,
      loading: "async",
      callback: "__bronxGmapsInit",
      libraries: "marker,visualization",
      v: "weekly",
    });
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(s);
  });
  return loadingPromise;
}
