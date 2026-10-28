import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  // Canonical address for links and the sitemap: VITE_SITE_URL, else Vercel's production domain.
  const siteUrl =
    env.VITE_SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  // The Supabase URL and publishable key are public values. Also accept the
  // names Supabase's Vercel integration creates, and bake them in for the browser.
  const pick = (...names: string[]) => names.map((n) => env[n]).find(Boolean) ?? "";
  const supabaseUrl = pick("VITE_SUPABASE_URL", "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = pick(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );

  return {
    define: {
      "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl),
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey),
    },
    server: { host: "::", port: 8080 },
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
      ],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // src/server.ts wraps TanStack Start's server entry with our branded SSR error page.
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      // Nitro packages the server for the host it builds on: Vercel's format on
      // Vercel, a plain Node server elsewhere (override with NITRO_PRESET).
      command === "build" && nitro(),
      viteReact(),
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
            {
              src: "/icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
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
  };
});
