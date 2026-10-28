import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

/** Generated so the sitemap line always points at the domain the site is served from. */
export const Route = createFileRoute("/robots.txt")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: () =>
        new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, {
          headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600" },
        }),
    },
  },
});
