import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { getRouterInstance } from "@tanstack/react-start";
import { sitemapStaticPaths, sitemapXML, sitemapPathForLocation, isSitemapRouteIncluded, type SitemapEntry } from "@/lib/sitemap";
import { CATEGORIES, RESOURCES } from "@/lib/data";
import "@/lib/resources-extra";

const BASE_URL = SITE_URL;

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        const catRouteId = "/category/$cat";
        if (isSitemapRouteIncluded(router.routesById[catRouteId])) {
          for (const cat of CATEGORIES) {
            const location = router.buildLocation({
              to: "/category/$cat", params: { cat: cat.id }, search: () => ({}), hash: "",
            });
            const path = sitemapPathForLocation(router, location, catRouteId);
            if (path) entries.push({ path });
          }
        }

        const resRouteId = "/resource/$id";
        if (isSitemapRouteIncluded(router.routesById[resRouteId])) {
          for (const r of RESOURCES) {
            const location = router.buildLocation({
              to: "/resource/$id", params: { id: r.id }, search: () => ({}), hash: "",
            });
            const path = sitemapPathForLocation(router, location, resRouteId);
            if (path) entries.push({ path });
          }
        }

        if (entries.length === 0) {
          return new Response(
            'No pages are included in this sitemap. Check route decisions and ancestor exclusions.',
            { status: 404, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
