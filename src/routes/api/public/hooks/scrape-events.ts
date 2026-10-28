import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

// Called weekly by the database scheduler. The shared secret lives in a
// service-role-only settings table, never in the browser.
export const Route = createFileRoute("/api/public/hooks/scrape-events")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin.from("internal_settings").select("value").eq("key", "event_scrape_cron_secret").maybeSingle();
        const secret = data?.value ?? "";
        const got = request.headers.get("x-cron-secret") ?? "";
        if (!secret || got.length !== secret.length || !timingSafeEqual(Buffer.from(got), Buffer.from(secret))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { runEventScrape } = await import("@/lib/event-scrape.server");
        const results = await runEventScrape(supabaseAdmin);
        return Response.json({ ok: true, results });
      },
    },
  },
});
