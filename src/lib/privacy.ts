// Privacy controls: analytics opt-out and full data erasure.
// Design principle: this app serves immigrant and mixed-status households.
// We keep the minimum data needed to work, and every person can wipe it.
import { supabase } from "@/integrations/supabase/client";
import { deleteMyServerData } from "./privacy.functions";
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

/**
 * Wipes every app key stored in this browser, except the analytics opt-out:
 * someone deleting their data has not asked to be counted again.
 */
export function eraseLocalData() {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        k !== OPT_OUT_KEY &&
        (k.startsWith("bronx") || k.startsWith("bx-") || k.startsWith("bx_"))
      )
        keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
}

/**
 * Full erase: this device's usage rows and the signed-in account's data on
 * the server, then everything on this device. Throws if the server couldn't
 * delete everything; the device is only wiped once the server succeeded.
 */
export async function deleteAllMyData() {
  const visitorId = getVisitorId() || null;
  const { signedIn } = await deleteMyServerData({ data: { visitorId } });
  if (signedIn) await supabase.auth.signOut();
  eraseLocalData();
}
