import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadDirectory } from "@/lib/bronx-resources";
import type { VerificationStatus } from "@/lib/verification";
import type { EventSummary } from "@/features/events";
import { upcomingCommunityEvents, POST_SOURCE } from "@/features/community-posts";

export type UpcomingEvent = EventSummary;

const TIMEOUT_MS = 10_000;

/** The hard-coded District 12 posts, as upcoming events. */
function communityUpcoming(): UpcomingEvent[] {
  const today = new Date().toISOString().slice(0, 10);
  return upcomingCommunityEvents(today).map<UpcomingEvent>((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    event_date: e.event_date,
    event_end_date: e.event_end_date,
    event_time: e.event_time,
    location: e.location,
    neighborhood: e.neighborhood,
    is_free: e.is_free,
    source: POST_SOURCE,
    verification_status: "needs_verification",
    last_verified: null,
  }));
}

/** Approved events plus imported community events, soonest first. */
async function loadUpcomingEvents(): Promise<UpcomingEvent[]> {
  const today = new Date().toISOString().slice(0, 10);
  const [{ data, error }, directory] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id,title,category,event_date,event_time,location,neighborhood,is_free,source,verification_status,last_verified",
      )
      .eq("approval_status", "approved")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(60),
    loadDirectory(),
  ]);
  if (error) throw error;

  const submitted = (data ?? []).map<UpcomingEvent>((event) => ({
    ...event,
    event_end_date: null,
    verification_status:
      (event.verification_status as VerificationStatus | null) ?? "needs_verification",
  }));
  const imported = directory
    .filter(
      (r) =>
        r.resource_category === "community_events" &&
        r.event_date &&
        (r.event_end_date ?? r.event_date) >= today,
    )
    .map<UpcomingEvent>((r) => ({
      id: `bx-${r.id}`,
      title: r.resource_name || r.organization_name,
      category: r.resource_subcategory,
      event_date: r.event_date as string,
      event_end_date: r.event_end_date ?? null,
      event_time: r.event_time ?? null,
      location: r.address,
      neighborhood: r.neighborhood,
      is_free: true,
      source: null,
      verification_status: "needs_verification",
      last_verified: null,
    }));
  // Hard-coded District 12 posts sit alongside live events for now.
  const community = communityUpcoming();
  return [...submitted, ...imported, ...community].sort((a, b) =>
    a.event_date.localeCompare(b.event_date),
  );
}

/**
 * `events` starts with the hard-coded community posts and becomes live
 * events plus those posts once loaded. A failed or stalled request ends in
 * `failed` (only when there is nothing at all to show).
 */
export function useUpcomingEvents(): { events: UpcomingEvent[] | null; failed: boolean } {
  // The community posts show at once; live events replace the list when loaded.
  const [events, setEvents] = useState<UpcomingEvent[] | null>(() => communityUpcoming());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timed out")), TIMEOUT_MS),
    );
    Promise.race([loadUpcomingEvents(), timeout])
      .then((rows) => {
        if (alive) setEvents(rows);
      })
      .catch(() => {
        if (!alive) return;
        // Live events failed; the hard-coded community posts still show.
        const community = communityUpcoming();
        setFailed(community.length === 0);
        setEvents(community);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { events, failed };
}
