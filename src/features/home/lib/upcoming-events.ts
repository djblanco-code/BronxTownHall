import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadDirectory } from "@/lib/bronx-resources";

export type UpcomingEvent = {
  id: string;
  title: string;
  category: string | null;
  event_date: string;
  event_end_date: string | null;
  event_time: string | null;
  location: string | null;
  neighborhood: string | null;
  is_free: boolean;
  source: string | null;
  verification_status: string | null;
  last_verified: string | null;
};

const TIMEOUT_MS = 10_000;

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

  const submitted = (data ?? []).map((event) => ({ ...event, event_end_date: null }));
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
  return [...submitted, ...imported].sort((a, b) => a.event_date.localeCompare(b.event_date));
}

/**
 * `events` is null while loading. A failed or stalled request ends in
 * `failed` instead of an endless spinner.
 */
export function useUpcomingEvents(): { events: UpcomingEvent[] | null; failed: boolean } {
  const [events, setEvents] = useState<UpcomingEvent[] | null>(null);
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
        setFailed(true);
        setEvents([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { events, failed };
}
