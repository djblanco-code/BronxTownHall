import type { Category, Resource } from "@/lib/data";
import { openingStatus, type LocalTime, type OpeningStatus } from "@/lib/opening-hours";
import { windowRange } from "@/lib/event-windows";
import type { EventSummary } from "@/features/events";
import type { PolicyAlert } from "@/lib/policy-alerts";

/** Which greeting to show: before noon, before 5 PM, or after. */
export function greetingKey(
  minutes: number,
): "greetingMorning" | "greetingAfternoon" | "greetingEvening" {
  if (minutes >= 5 * 60 && minutes < 12 * 60) return "greetingMorning";
  if (minutes >= 12 * 60 && minutes < 17 * 60) return "greetingAfternoon";
  return "greetingEvening";
}

export type OpenListing = { resource: Resource; status: OpeningStatus };

/**
 * Listings we can confirm are open at some point tonight: open now first,
 * then by distance. Prefers the chosen neighborhood when it has enough.
 */
export function openTonight(
  resources: Resource[],
  now: LocalTime,
  neighborhood: string | null,
  limit = 8,
): OpenListing[] {
  const open = resources
    .map((resource) => ({ resource, status: openingStatus(resource.hours.en, now) }))
    .filter((r) => r.status.tonight === true)
    .sort(
      (a, b) =>
        Number(b.status.open) - Number(a.status.open) || a.resource.distance - b.resource.distance,
    );
  if (neighborhood) {
    const local = open.filter((r) => r.resource.neighborhood === neighborhood);
    if (local.length >= 3) return local.slice(0, limit);
  }
  return open.slice(0, limit);
}

/** Events that overlap "today" or "this weekend" (multi-day events count on every day they run). */
export function eventsIn(
  events: EventSummary[],
  win: "today" | "weekend",
  now: Date = new Date(),
): EventSummary[] {
  const range = windowRange(win, now);
  if (!range) return events;
  return events.filter(
    (e) => e.event_date <= range.to && (e.event_end_date ?? e.event_date) >= range.from,
  );
}

/**
 * Categories never used to personalise picks: someone looking for legal,
 * health or housing help should not have that surfaced back on a shared phone.
 */
const SENSITIVE: Category[] = ["legal", "health", "housing"];

/** Listings from the categories this phone has browsed most, open ones first. */
export function pickedFor(
  resources: Resource[],
  interests: string[],
  now: LocalTime | null,
  limit = 8,
): Resource[] {
  const present = new Set<string>(resources.map((r) => r.category));
  const cats = interests
    .filter((c) => present.has(c) && !SENSITIVE.includes(c as Category))
    .slice(0, 3);
  if (cats.length === 0) return [];
  const rank = (r: Resource) => cats.indexOf(r.category);
  return resources
    .filter((r) => cats.includes(r.category))
    .map((r) => ({ r, open: now ? openingStatus(r.hours.en, now).open === true : false }))
    .sort(
      (a, b) =>
        Number(b.open) - Number(a.open) || rank(a.r) - rank(b.r) || a.r.distance - b.r.distance,
    )
    .slice(0, limit)
    .map((x) => x.r);
}

const NYC_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" });

/** Today's date in New York as YYYY-MM-DD. */
export function nycIsoDate(date: Date = new Date()): string {
  return NYC_DATE.format(date);
}

/** Published deadline alerts that haven't passed yet, soonest first. */
export function activeDeadlines(alerts: PolicyAlert[], today: string, limit = 2): PolicyAlert[] {
  return alerts
    .filter((a) => a.kind === "deadline" && a.deadline_date && a.deadline_date >= today)
    .sort((a, b) => a.deadline_date!.localeCompare(b.deadline_date!))
    .slice(0, limit);
}
