// Community-event interaction analytics.
import { trackEvent } from "./analytics";

type Base = { eventId: string; category?: string | null };

export function trackEventViewed({ eventId, category, date }: Base & { date?: string | null }) {
  trackEvent("event_viewed", {
    event_id: eventId,
    category: category || "unknown",
    date: date || "unknown",
  });
}

export type ShareMethod = "native" | "copy" | "sms" | "whatsapp";

export function trackEventShared({ eventId, method }: { eventId: string; method: ShareMethod }) {
  trackEvent("event_shared", { event_id: eventId, share_method: method });
}

export function trackEventSaved({ eventId, eventDate }: { eventId: string; eventDate?: string | null }) {
  trackEvent("event_saved", { event_id: eventId, event_date: eventDate || "unknown" });
}

export function trackEventRsvp({ eventId, organization }: { eventId: string; organization?: string | null }) {
  trackEvent("event_rsvp", { event_id: eventId, organization: organization || "unknown" });
}
