// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        filename: "sw.js",
        devOptions: { enabled: false },
        manifest: {
          name: "The Bronx App",
          short_name: "Bronx App",
          description: "Community resources, events, and 24/7 emergency help for the Bronx.",
          theme_color: "#1d4ed8",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          scope: "/",
          orientation: "portrait",
          lang: "en",
          categories: ["utilities", "social", "government"],
          icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
            { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
          ],
          shortcuts: [
            { name: "Urgent help", url: "/urgent" },
            { name: "This Week in the Bronx", url: "/digest" },
            { name: "Search resources", url: "/search" },
          ],
        },
        workbox: {
          navigateFallback: null,
          globPatterns: ["**/*.{js,css,woff2}"],
          navigationPreload: true,
          runtimeCaching: [
            {
              // Emergency page + hotline sub-pages: always available offline.
              urlPattern: ({ url }: { url: URL }) =>
                url.origin === self.location.origin && url.pathname.startsWith("/emergency"),
              handler: "NetworkFirst",
              options: {
                cacheName: "emergency-offline",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 180 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // HTML navigations — network first, cached copy used when offline.

              urlPattern: ({ request }: { request: Request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-navigations",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: ({ url, request }: { url: URL; request: Request }) =>
                url.origin === self.location.origin &&
                ["style", "script", "font", "image"].includes(request.destination),
              handler: "CacheFirst",
              options: {
                cacheName: "static-assets",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  },
});
