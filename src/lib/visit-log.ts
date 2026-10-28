// Anonymous visit logging for the admin analytics dashboard.
// Stores only a random device-local visitor code — no names, emails or IPs.
import { supabase } from "@/integrations/supabase/client";
import { deviceType } from "./analytics";
import { getProfile } from "./onboarding";
import { analyticsOptedOut } from "./privacy";

const VISITOR_KEY = "bronx.visitorId";
const SESSION_KEY = "bronx.sessionLogged";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
      localStorage.setItem(VISITOR_KEY + ".new", "1");
    }
    return id;
  } catch {
    return "";
  }
}

/** Records one row per browser session. Safe to call on every app load. */
export async function logVisit() {
  if (typeof window === "undefined" || analyticsOptedOut()) return;
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private mode — still log once */
  }

  const visitor_id = getVisitorId();
  if (!visitor_id) return;

  let isFirst = false;
  try {
    isFirst = localStorage.getItem(VISITOR_KEY + ".new") === "1";
    if (isFirst) localStorage.removeItem(VISITOR_KEY + ".new");
  } catch {
    /* ignore */
  }

  try {
    await supabase.from("analytics_sessions").insert({
      visitor_id,
      is_first_visit: isFirst,
      device: deviceType(),
      language: (navigator.language || "unknown").slice(0, 12),
      zip_code: getProfile().userZipCode || null,
      path: window.location.pathname.slice(0, 120),
    });
  } catch {
    /* analytics must never break the app */
  }
}
