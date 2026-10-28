import { createFileRoute } from "@tanstack/react-router";

// Called weekly by the database scheduler. The shared secret lives in a
// service-role-only settings table, never in the browser.
export const Route = createFileRoute("/api/public/hooks/scrape-events")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { hasCronSecret } = await import("@/lib/request-auth.server");
        if (!(await hasCronSecret(request, supabaseAdmin))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { runEventScrape } = await import("@/lib/event-scrape.server");
        const results = await runEventScrape(supabaseAdmin);
        return Response.json({ ok: true, results });
      },
    },
  },
});
