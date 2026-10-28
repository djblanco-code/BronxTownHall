import type { Resource } from "./data";

// Parse an hours string like "Mon-Fri 9am-7pm", "Mon, Wed 9am–1pm", "24/7", "By appointment"
// and decide whether the resource is open at or after 5pm on at least one weekday (Mon-Fri).
// Heuristic: find any closing time token (e.g. "7pm", "19:00", "8 pm") with hour >= 17.
const TIME_RE = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi;

function maxClosingHour(s: string): number {
  // Look for "-" or "–" separator and inspect the right-hand side time.
  const ranges = s.split(/[,;]/);
  let max = 0;
  for (const r of ranges) {
    const parts = r.split(/[-–—]/);
    const right = parts[parts.length - 1] || "";
    const matches = [...right.matchAll(TIME_RE)];
    for (const m of matches) {
      let h = parseInt(m[1], 10);
      const ampm = (m[3] || "").toLowerCase();
      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      if (h > max) max = h;
    }
  }
  return max;
}

export function hasEveningHours(r: Pick<Resource, "hours" | "keywords" | "category">): boolean {
  const s = (r.hours?.en || "").toLowerCase();
  if (!s) return false;
  if (s.includes("24/7") || s.includes("24 hour") || s.includes("24-hour")) return true;
  if (s.includes("evening") || s.includes("late") || s.includes("after work")) return true;
  if ((r.keywords || []).some((k) => /evening|after\s*5|late/i.test(k))) return true;
  return maxClosingHour(s) >= 17;
}

export function countAfter5<T extends Pick<Resource, "hours" | "keywords" | "category">>(
  list: T[],
): number {
  return list.reduce((n, r) => n + (hasEveningHours(r) ? 1 : 0), 0);
}
