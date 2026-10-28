// Privacy controls: analytics opt-out and full data erasure.
// Design principle: this app serves immigrant and mixed-status households.
// We keep the minimum data needed to work, and every person can wipe it.
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "./visit-log";

const OPT_OUT_KEY = "bronx.analyticsOptOut";

export function analyticsOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAnalyticsOptOut(optOut: boolean) {
  try {
    if (optOut) localStorage.setItem(OPT_OUT_KEY, "1");
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    /* ignore */
  }
}

/** Everything this app keeps on the device, in plain language. */
export const LOCAL_DATA_ITEMS = [
  "ZIP code and language preference",
  "Saved favorites, lists and notes",
  "Onboarding answers and view settings",
  "A random device code used for anonymous usage counts",
];

/** Deletes the anonymous usage rows tied to this device's random code. */
export async function deleteAnalyticsForThisDevice(): Promise<void> {
  const visitorId = getVisitorId();
  if (!visitorId) return;
  await Promise.allSettled([
    supabase.from("analytics_events").delete().eq("visitor_id", visitorId),
    supabase.from("analytics_sessions").delete().eq("visitor_id", visitorId),
  ]);
}

/** Deletes signed-in account data this user owns (no-op when signed out). */
export async function deleteAccountData(): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return;
  await Promise.allSettled([
    supabase.from("saved_resources").delete().eq("user_id", userId),
    supabase.from("resource_notes").delete().eq("user_id", userId),
    supabase.from("lists").delete().eq("user_id", userId),
    supabase.from("reviews").delete().eq("user_id", userId),
    supabase.from("referrals").delete().eq("pro_user_id", userId),
    supabase.from("newsletter_subscriptions").delete().eq("user_id", userId),
    supabase.from("pro_profiles").delete().eq("user_id", userId),
  ]);
  await supabase.auth.signOut();
}

/** Wipes every app key stored in this browser. */
export function eraseLocalData() {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("bronx") || k.startsWith("bx-") || k.startsWith("bx_"))) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
}

/** Full erase: cloud analytics + account rows + everything on this device. */
export async function deleteAllMyData() {
  await deleteAnalyticsForThisDevice();
  await deleteAccountData();
  eraseLocalData();
}
