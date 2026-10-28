// Shared SMS shortcode config + keyword reply logic (browser-safe).
import { RESOURCES, type Category } from "./data";

/** Public SMS number. Empty string = Twilio not yet provisioned (shows "Coming soon"). */
export const SMS_NUMBER: string = (import.meta.env?.VITE_SMS_NUMBER as string) || "";

export const SMS_CONFIGURED = SMS_NUMBER.trim().length > 0;

export function formatSmsNumber(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^1/, "");
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : raw;
}

export const SMS_KEYWORDS: { keyword: string; category: Category; blurb: string }[] = [
  { keyword: "FOOD", category: "food", blurb: "Open food pantries near you" },
  { keyword: "HOUSING", category: "housing", blurb: "Shelter and housing help" },
  { keyword: "HEALTH", category: "health", blurb: "Clinics and health services" },
  { keyword: "LEGAL", category: "legal", blurb: "Free legal aid" },
  { keyword: "JOBS", category: "jobs", blurb: "Job centers and training" },
  { keyword: "KIDS", category: "childcare", blurb: "Childcare and family support" },
];

/** Keywords that aren't resource categories, shown alongside SMS_KEYWORDS on /sms. */
export const SMS_SPECIAL_KEYWORDS: { keyword: string; blurb: string }[] = [
  { keyword: "EVENTS", blurb: "Upcoming free community events" },
  { keyword: "HELP", blurb: "Emergency and crisis hotlines" },
];

export const ALL_SMS_KEYWORDS = [
  ...SMS_KEYWORDS.map((k) => k.keyword),
  ...SMS_SPECIAL_KEYWORDS.map((k) => k.keyword),
];

/** Emergency hotlines returned for the HELP keyword. */
export const SMS_HOTLINES = [
  "911 - Police / fire / medical emergency",
  "988 - Suicide & crisis lifeline (call or text)",
  "311 - NYC city services & shelter intake",
  "1-800-621-4673 - NYC domestic violence hotline",
  "1-888-692-9355 - NYC Well mental health support",
];

/** Fallback events reply used when live events can't be loaded. */
export function buildEventsReply(
  events: {
    title: string;
    event_date: string;
    event_time?: string | null;
    location?: string | null;
  }[],
): string {
  if (!events.length) {
    return "No events listed for the next 2 weeks. See thebronxapp.org/events for the latest.";
  }
  const list = events
    .slice(0, 3)
    .map((e, i) => {
      const d = new Date(`${e.event_date}T12:00:00`);
      const when = isNaN(d.getTime())
        ? e.event_date
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${i + 1}. ${e.title}\n${when}${e.event_time ? ` ${e.event_time}` : ""}${e.location ? `\n${e.location}` : ""}`;
    })
    .join("\n\n");
  return `Upcoming Bronx events:\n\n${list}\n\nMore: thebronxapp.org/events`;
}

/** Build the plain-text SMS reply for an inbound keyword. Max ~3 listings. */
export function buildSmsReply(body: string): string {
  const word = body.trim().toUpperCase().split(/\s+/)[0] ?? "";
  if (word === "STOP") {
    return "You are unsubscribed from The Bronx App. Text START to rejoin.";
  }
  if (word === "HELP" || word === "911" || word === "CRISIS") {
    return `Emergency & crisis hotlines:\n\n${SMS_HOTLINES.join("\n")}\n\nOther keywords: ${SMS_KEYWORDS.map((k) => k.keyword).join(", ")}, EVENTS. Msg&data rates may apply.`;
  }
  if (word === "EVENTS") {
    return buildEventsReply([]);
  }
  const match = SMS_KEYWORDS.find((k) => k.keyword === word);
  if (!match) {
    return `Sorry, we didn't recognize that. Text one of: ${ALL_SMS_KEYWORDS.join(", ")}.`;
  }
  const list = RESOURCES.filter((r) => r.category === match.category)
    .sort((a, b) => Number(b.openNow) - Number(a.openNow) || a.distance - b.distance)
    .slice(0, 3)
    .map(
      (r, i) =>
        `${i + 1}. ${r.name.en}${r.openNow ? " (OPEN NOW)" : ""}\n${r.address}\n${r.phone}\n${r.hours.en}`,
    )
    .join("\n\n");
  return list
    ? `${match.blurb}:\n\n${list}\n\nMore: thebronxapp.org. Text HELP for hotlines.`
    : `No ${match.keyword.toLowerCase()} listings right now. Call 311 for help.`;
}
