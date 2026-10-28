import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const submitEventInput = z.object({
  title: z.string().trim().min(3).max(120),
  event_type: z.string().min(1).max(60),
  event_date: z.string().min(1).max(30),
  event_time: z.string().max(30).nullish(),
  location: z.string().max(200).nullish(),
  address: z.string().max(200).nullish(),
  description: z.string().max(2000).nullish(),
  is_free: z.boolean(),
  cost: z.string().max(60).nullish(),
  website: z.string().max(300).nullish(),
  submitted_by: z.string().max(120).nullish(),
  submitted_email: z.string().email().max(200).nullish(),
});

/**
 * Community event submission.
 *
 * Identity is derived server-side from the request's bearer token only. Any
 * user id sent by the client is ignored, so a caller can never submit under
 * another user's identity.
 */
export const submitCommunityEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitEventInput.parse(data))
  .handler(async ({ data }) => {
    const SUPABASE_URL = process.env["SUPABASE_URL"];
    const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("Backend is not configured.");
    }

    const authHeader = getRequest()?.headers?.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    let submittedUserId: string | null = null;
    const headers: Record<string, string> = {};

    if (token) {
      const probe = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });
      const { data: claimsData, error } = await probe.auth.getClaims(token);
      if (error || !claimsData?.claims?.sub) {
        throw new Error("Unauthorized: invalid session token");
      }
      submittedUserId = claimsData.claims.sub as string;
      headers["Authorization"] = `Bearer ${token}`;
    }

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from("events").insert({
      title: data.title,
      description: data.description || null,
      event_type: data.event_type,
      event_date: data.event_date,
      event_time: data.event_time || null,
      location: data.location || null,
      address: data.address || null,
      is_free: data.is_free,
      cost: data.cost || null,
      website: data.website || null,
      submitted_by: data.submitted_by || null,
      submitted_email: data.submitted_email || null,
      submitted_user_id: submittedUserId,
      is_community_submitted: true,
      approval_status: "pending",
    });

    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
