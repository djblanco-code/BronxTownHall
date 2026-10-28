const SW_URL = "/sw.js";

function isBlockedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  if (window.top !== window.self) return true;
  if (
    new URLSearchParams(window.location.search).has("sw") &&
    new URLSearchParams(window.location.search).get("sw") === "off"
  )
    return true;
  return false;
}

async function unregisterOurWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active?.scriptURL ?? r.installing?.scriptURL ?? "").endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

/** Registers the offline service worker outside dev/preview contexts. */
export function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (isBlockedContext()) {
    void unregisterOurWorkers();
    return;
  }
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register(SW_URL)
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        // Pre-warm the emergency page + hotline pages so they work with no signal.
        const EMERGENCY_URLS = [
          "/emergency",
          "/emergency/911",
          "/emergency/311",
          "/emergency/988",
          "/emergency/domestic-violence",
          "/emergency/poison-control",
        ];
        return Promise.allSettled(EMERGENCY_URLS.map((u) => fetch(u, { cache: "reload" })));
      })
      .catch(() => {
        /* ignore */
      });
  });
}
