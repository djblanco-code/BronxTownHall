// Search-behavior analytics.
// Queries are trimmed, lowercased and length-capped so they stay useful
// as a Plausible breakdown without carrying stray personal text.
import { trackEvent } from "./analytics";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorId } from "./visit-log";
import { analyticsOptedOut } from "./privacy";
import type { Json } from "@/integrations/supabase/types";
import { classifyIntent, queryShape } from "./search-privacy";

/** Persist a search event so the admin dashboard can rank queries. */
function persistSearch(eventType: string, metadata: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || analyticsOptedOut()) return;
  try {
    void supabase.from("analytics_events").insert({
      visitor_id: getVisitorId(),
      event_type: eventType,
      resource_id: null,
      category: null,
      metadata: metadata as Json,
    });
  } catch {
    /* analytics must never break the app */
  }
}

/**
 * Raw text never leaves the device. Everything downstream — Plausible props and
 * the analytics_events row — sees only a coarse intent bucket plus a length
 * shape. This is what lets us say, honestly, that we do not store searches.
 */
export function normalizeQuery(q: string): string {
  const trimmed = q.trim();
  if (!trimmed) return "";
  return classifyIntent(trimmed);
}

export function trackSearchPerformed({
  query,
  resultCount,
  responseTimeMs,
  mode = "fuzzy",
}: {
  query: string;
  resultCount: number;
  responseTimeMs?: number;
  mode?: "ai" | "fuzzy";
}) {
  const search_query = normalizeQuery(query);
  if (!search_query) return;
  trackEvent("search_performed", {
    search_query,
    result_count: resultCount,
    ...(typeof responseTimeMs === "number" ? { response_time_ms: Math.round(responseTimeMs) } : {}),
  });
  persistSearch("search_performed", {
    query: search_query,
    shape: queryShape(query),
    result_count: resultCount,
    mode,
  });
  if (resultCount === 0) {
    trackEvent("search_zero_results", { search_query });
  }
}

export function trackSearchClicked({
  query,
  resourceId,
  position,
}: {
  query: string;
  resourceId: string;
  position: number;
}) {
  trackEvent("search_clicked", {
    search_query: normalizeQuery(query) || "(empty)",
    resource_id: resourceId,
    position,
  });
}

/** Smart/AI-assisted interpretation of a query (intent detection). */
export function trackSearchAiUsed({
  query,
  responseTimeMs,
}: {
  query: string;
  responseTimeMs: number;
}) {
  const search_query = normalizeQuery(query);
  if (!search_query) return;
  trackEvent("search_ai_used", { search_query, response_time_ms: Math.round(responseTimeMs) });
  persistSearch("search_ai_used", { query: search_query });
}

export function trackAiHelpful({
  query,
  resourceCount,
  helpful,
}: {
  query: string;
  resourceCount: number;
  helpful: boolean;
}) {
  trackEvent("ai_helpful", {
    search_query: normalizeQuery(query) || "(empty)",
    resource_count: resourceCount,
    helpful,
  });
}
