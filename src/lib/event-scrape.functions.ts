import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

/** Admin "Check sources now" button. */
export const runEventScrapeNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { runEventScrape } = await import("./event-scrape.server");
    return { results: await runEventScrape(supabaseAdmin) };
  });

const approveInput = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(200),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  event_time: z.string().max(60).nullish(),
  location: z.string().max(200).nullish(),
  description: z.string().max(1000).nullish(),
});

/** Publishes a reviewed candidate as a normal, Not-yet-verified event listing. */
export const approveScrapedEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => approveInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("scraped_events").select("*").eq("id", data.id).single();
    if (!row || row.status !== "pending") throw new Error("This event is no longer pending.");
    const { data: inserted, error } = await supabaseAdmin
      .from("bronx_resources")
      .insert({
        organization_name: data.title,
        resource_name: data.title,
        resource_category: "community_events",
        listing_type: "service",
        event_date: data.event_date,
        event_time: data.event_time || null,
        address: data.location || null,
        description: data.description || null,
        website: row.event_url,
        source: "event_pipeline",
        source_url: row.event_url,
        verification_status: "needs_verification",
        active: true,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("scraped_events")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), published_resource_id: inserted.id, title: data.title, event_date: data.event_date, event_time: data.event_time ?? null, location: data.location ?? null, description: data.description ?? null })
      .eq("id", data.id);
    return { ok: true };
  });
