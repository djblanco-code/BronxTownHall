/**
 * Shared .ics (iCalendar) helpers. A single .ics download works with Google
 * Calendar, Apple Calendar, and Outlook — no per-provider integration needed.
 */

/** Escape a text value for an .ics field (commas, semicolons, newlines). */
function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// Build an .ics file. Times are "floating" local times (no timezone suffix),
// so the event shows at the intended local time in any calendar app.
export function buildIcs(opts: {
  title: string;
  description: string;
  location: string;
  date: Date;
  durationMinutes?: number;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const end = new Date(opts.date.getTime() + (opts.durationMinutes ?? 90) * 60000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bronx Town Hall//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@the-bronx-app`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.date)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    `LOCATION:${esc(opts.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(filename: string, content: string) {
  const safe =
    filename
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .slice(0, 60) || "event";
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safe.endsWith(".ics") ? safe : `${safe}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Parse loose start-time text ("6:30 PM", "18:00", "6pm") → "HH:MM:SS" or null. */
export function parseEventTime(t: string | null | undefined): string | null {
  if (!t) return null;
  const m = t.trim().match(/^(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ?? "00";
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 23) return null;
  return `${String(h).padStart(2, "0")}:${min}:00`;
}

/**
 * Combine a date ("YYYY-MM-DD") and optional time text into a local Date.
 * Returns null when the date isn't a real, specific calendar date — callers
 * must not offer "Add to Calendar" in that case.
 */
export function eventStartDate(
  dateStr: string | null | undefined,
  timeStr?: string | null,
): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return null;
  const time = parseEventTime(timeStr) ?? "12:00:00";
  const d = new Date(`${dateStr.trim()}T${time}`);
  return isNaN(d.getTime()) ? null : d;
}
