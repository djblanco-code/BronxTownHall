import { timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Who may call the scheduled-job endpoints: the database scheduler (it sends
 * the shared secret kept in `internal_settings`) or a signed-in admin.
 */

/** True when the request carries the scheduler's shared secret in `x-cron-secret`. */
export async function hasCronSecret(request: Request, admin: SupabaseClient<Database>) {
  const { data } = await admin
    .from("internal_settings")
    .select("value")
    .eq("key", "event_scrape_cron_secret")
    .maybeSingle();
  const secret = data?.value ?? "";
  const got = request.headers.get("x-cron-secret") ?? "";
  return (
    !!secret &&
    got.length === secret.length &&
    timingSafeEqual(Buffer.from(got), Buffer.from(secret))
  );
}

/** True when the request carries a signed-in admin's access token. */
export async function isAdminRequest(request: Request, admin: SupabaseClient<Database>) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const { data } = await admin.auth.getUser(header.slice("Bearer ".length).trim());
  if (!data.user) return false;
  const { data: role } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return !!role;
}
