import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * "Delete all my data" on the server: this device's anonymous usage rows
 * and, when signed in, the account itself and everything tied to it. Runs
 * with the service role because visitors can't (and mustn't) read or delete
 * analytics rows themselves; the device code and the sign-in token decide
 * what is deleted. Deleting the auth user last also removes everything that
 * references it with ON DELETE CASCADE (profile, roles, organization
 * accounts, their contacts and posts). Throws if anything couldn't be
 * deleted, so the app never claims success it didn't have.
 */
export const deleteMyServerData = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ visitorId: z.string().uuid().nullable() }).parse(d))
  .handler(async ({ data }): Promise<{ signedIn: boolean }> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");

    const failed: string[] = [];
    const run = async (table: string, query: PromiseLike<{ error: unknown }>) => {
      const { error } = await query;
      if (error) failed.push(table);
    };

    if (data.visitorId) {
      const id = data.visitorId;
      await run("analytics_events", db.from("analytics_events").delete().eq("visitor_id", id));
      await run("analytics_sessions", db.from("analytics_sessions").delete().eq("visitor_id", id));
    }

    const header = getRequest()?.headers.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
    const user = token ? (await db.auth.getUser(token)).data.user : null;
    const userId = user?.id;
    const email = user?.email?.toLowerCase();

    if (userId) {
      // Tables that point at the user without a cascade, or by email only.
      await run(
        "business_hiring_posts",
        db.from("business_hiring_posts").delete().eq("user_id", userId),
      );
      await run(
        "events",
        db
          .from("events")
          .update({ submitted_email: null, submitted_by: null, submitted_user_id: null })
          .eq("submitted_user_id", userId),
      );
      if (email) {
        await run(
          "alert_subscriptions",
          db.from("alert_subscriptions").delete().eq("email", email),
        );
        await run(
          "newsletter_subscriptions (email)",
          db.from("newsletter_subscriptions").delete().eq("email", email),
        );
      }
      await run("saved_resources", db.from("saved_resources").delete().eq("user_id", userId));
      await run("resource_notes", db.from("resource_notes").delete().eq("user_id", userId));
      await run("lists", db.from("lists").delete().eq("user_id", userId));
      await run("reviews", db.from("reviews").delete().eq("user_id", userId));
      await run("referrals", db.from("referrals").delete().eq("pro_user_id", userId));
      await run("pro_profiles", db.from("pro_profiles").delete().eq("user_id", userId));
      await run(
        "newsletter_subscriptions",
        db.from("newsletter_subscriptions").delete().eq("user_id", userId),
      );
      await run("resource_requests", db.from("resource_requests").delete().eq("user_id", userId));
      await run(
        "legal_consultation_requests",
        db.from("legal_consultation_requests").delete().eq("user_id", userId),
      );
      await run(
        "community_alert_submissions",
        db.from("community_alert_submissions").delete().eq("user_id", userId),
      );
    }

    if (failed.length) throw new Error(`Could not delete from: ${failed.join(", ")}`);
    // Only once everything else is gone: the account itself.
    if (userId) {
      const { error } = await db.auth.admin.deleteUser(userId);
      if (error) throw new Error("Could not delete the account");
    }
    return { signedIn: !!userId };
  });
