// Resource interaction analytics.
// Thin wrappers over trackEvent so every resource event has a consistent
// name + property shape. Nothing here ever sends personal data:
// phone numbers are redacted to their area code, websites to their domain.
// Events are also persisted to Supabase so the admin dashboard can rank
// the most-viewed resources.

import { trackEvent } from "./analytics";
import { recordCategoryView } from "./interest-history";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "./visit-log";
import { analyticsOptedOut } from "./privacy";
import type { Json } from "@/integrations/supabase/types";

const ZIP_KEY = "bronx_voice_zip";

/** Best-effort ZIP for the current user (set on /civic or by geolocation). */
export function currentZip(): string {
  if (typeof window === "undefined") return "unknown";
  try {
    return localStorage.getItem(ZIP_KEY) || "unknown";
  } catch {
    return "unknown";
  }
}

/** 718-555-1234 -> 718-***-**** (never store a full number). */
export function redactPhone(phone?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 4) return "unknown";
  const local = digits.length === 11 ? digits.slice(1) : digits;
  return `${local.slice(0, 3)}-***-****`;
}

export function domainOf(url?: string): string {
  if (!url) return "unknown";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

type Base = { resourceId: string; category?: string };

function persistEvent(
  eventType: string,
  { resourceId, category }: Base,
  metadata: Record<string, string | number | boolean | null> = {},
) {
  if (typeof window === "undefined" || analyticsOptedOut()) return;
  try {
    void supabase.from("analytics_events").insert({
      visitor_id: getVisitorId(),
      event_type: eventType,
      resource_id: resourceId,
      category: category || "unknown",
      metadata: metadata as Json,
    });
  } catch {
    /* analytics must never break the app */
  }
}

export function trackResourceViewed({ resourceId, category }: Base) {
  trackEvent("resource_viewed", {
    resource_id: resourceId,
    category: category || "unknown",
    zip_code: currentZip(),
  });
  persistEvent("resource_viewed", { resourceId, category });
  recordCategoryView(category);
}

export function trackCallClicked({ resourceId, category, phone }: Base & { phone?: string }) {
  trackEvent("call_clicked", {
    resource_id: resourceId,
    category: category || "unknown",
    phone_number: redactPhone(phone),
    zip_code: currentZip(),
  });
  persistEvent("call_clicked", { resourceId, category }, { phone_prefix: redactPhone(phone) });
}

export function trackDirectionsClicked({ resourceId, category, distanceMiles }: Base & { distanceMiles?: number }) {
  trackEvent("directions_clicked", {
    resource_id: resourceId,
    category: category || "unknown",
    distance_miles: typeof distanceMiles === "number" ? Math.round(distanceMiles * 10) / 10 : -1,
    zip_code: currentZip(),
  });
  persistEvent("directions_clicked", { resourceId, category }, { distance_miles: distanceMiles ?? -1 });
}

export function trackWebsiteClicked({ resourceId, category, url }: Base & { url?: string }) {
  trackEvent("website_clicked", {
    resource_id: resourceId,
    category: category || "unknown",
    domain: domainOf(url),
  });
  persistEvent("website_clicked", { resourceId, category }, { domain: domainOf(url) });
}

export function trackResourceSaved({ resourceId, category, saved }: Base & { saved: boolean }) {
  trackEvent("resource_saved", {
    resource_id: resourceId,
    category: category || "unknown",
    action: saved ? "saved" : "unsaved",
  });
  persistEvent("resource_saved", { resourceId, category }, { action: saved ? "saved" : "unsaved" });
}

export type ShareMethod = "sms" | "whatsapp" | "native" | "print" | "copy" | "email";

export function trackResourceShared({ resourceId, category, method }: Base & { method: ShareMethod }) {
  trackEvent("resource_shared", {
    resource_id: resourceId,
    category: category || "unknown",
    share_method: method,
  });
  persistEvent("resource_shared", { resourceId, category }, { share_method: method });
}

export function trackResourceReported({ resourceId, category, issueType }: Base & { issueType: string }) {
  trackEvent("resource_reported", {
    resource_id: resourceId,
    category: category || "unknown",
    issue_type: issueType,
  });
  persistEvent("resource_reported", { resourceId, category }, { issue_type: issueType });
}
