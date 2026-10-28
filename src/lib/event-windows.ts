/** Shared date windows so the home page and /events filter identically. */
export type EventWindow = "today" | "week" | "weekend" | "next_week" | "all";

export const EVENT_WINDOWS: { id: EventWindow; label: string }[] = [
  { id: "weekend", label: "This weekend" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "next_week", label: "Next week" },
  { id: "all", label: "All upcoming" },
];

const DAY = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Inclusive [from, to] date range (local) for a window, as YYYY-MM-DD strings. */
export function windowRange(
  win: EventWindow,
  now = new Date(),
): { from: string; to: string } | null {
  const today = startOfDay(now);
  const iso = (d: Date) => {
    const off = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - off).toISOString().slice(0, 10);
  };

  if (win === "all") return null;
  if (win === "today") return { from: iso(today), to: iso(today) };
  if (win === "week") return { from: iso(today), to: iso(new Date(today.getTime() + 6 * DAY)) };

  // Weekend = the coming Fri–Sun (today included when today is Fri/Sat/Sun).
  const dow = today.getDay(); // 0 Sun … 6 Sat
  if (win === "weekend") {
    if (dow === 0) return { from: iso(today), to: iso(today) };
    if (dow === 5 || dow === 6) {
      const sunday = new Date(today.getTime() + (7 - dow) * DAY);
      return { from: iso(today), to: iso(sunday) };
    }
    const friday = new Date(today.getTime() + (5 - dow) * DAY);
    const sunday = new Date(friday.getTime() + 2 * DAY);
    return { from: iso(friday), to: iso(sunday) };
  }

  // Next week = the following Mon–Sun.
  const daysToNextMonday = (8 - dow) % 7 || 7;
  const mon = new Date(today.getTime() + daysToNextMonday * DAY);
  return { from: iso(mon), to: iso(new Date(mon.getTime() + 6 * DAY)) };
}

export function inWindow(dateStr: string, win: EventWindow, now = new Date()): boolean {
  const r = windowRange(win, now);
  if (!r) return true;
  return dateStr >= r.from && dateStr <= r.to;
}

export function formatEventDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
