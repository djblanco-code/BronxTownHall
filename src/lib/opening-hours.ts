import { useSyncExternalStore } from "react";

/**
 * Turns a listing's free-text hours ("M-F 8am-8pm, Sat 8am-4pm") into a
 * weekly schedule and answers "open now?" and "open tonight?" in New York
 * time. Anything it can't read with confidence ("By appointment",
 * "Wed 9:30-11:30am (2nd & 4th)", "Summer weekends") is unknown (`null`):
 * the app never claims a place is open when it can't tell.
 */

/** Minutes after midnight; `close` is exclusive and may be 1440 (midnight). */
export type Interval = { open: number; close: number };

export type Schedule =
  | { kind: "always" }
  /** Parks: open from roughly sunrise to sunset. */
  | { kind: "daylight" }
  /** `days[0]` is Sunday. */
  | { kind: "weekly"; days: Interval[][] };

/** A moment in New York: day of week (0 = Sunday), minutes after midnight, month (1-12). */
export type LocalTime = { day: number; minutes: number; month: number };

const DAYS: Record<string, number> = {
  su: 0, sun: 0, sunday: 0,
  m: 1, mo: 1, mon: 1, monday: 1,
  tu: 2, tue: 2, tues: 2, tuesday: 2,
  w: 3, we: 3, wed: 3, wednesday: 3,
  th: 4, thu: 4, thur: 4, thurs: 4, thursday: 4,
  f: 5, fr: 5, fri: 5, friday: 5,
  sa: 6, sat: 6, saturday: 6,
}; // prettier-ignore

/** Words that mean the hours only apply some weeks or seasons, or aren't fixed at all. */
const UNCERTAIN =
  /\(|monthly|weekly|quarterly|annual|season|summer|winter|spring|autumn|fall\b|first|second|third|fourth|last|\b\d(st|nd|rd|th)\b|appointment|phone|event|remote|after-school|weekend|year-round|holiday|varies/;

const TIME_RANGE = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/g;

const cache = new Map<string, Schedule | null>();

export function parseHours(text?: string | null): Schedule | null {
  if (!text) return null;
  const cached = cache.get(text);
  if (cached !== undefined) return cached;
  const schedule = parse(text);
  cache.set(text, schedule);
  return schedule;
}

function parse(raw: string): Schedule | null {
  const text = raw
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\b([ap])\.m\.?/g, "$1m")
    .replace(/\s+(?:to|thru|through)\s+/g, "-")
    .replace(/,?\s*[a-z]+(?:\s*-\s*[a-z]+)?:?\s+closed\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/^24\/7\b/.test(text) || /^open 24 hours/.test(text)) return { kind: "always" };
  if (/^(daily )?dawn ?- ?dusk$/.test(text)) return { kind: "daylight" };
  if (UNCERTAIN.test(text)) return null;

  const days: Interval[][] = [[], [], [], [], [], [], []];
  let cursor = 0;
  let found = false;
  for (const m of text.matchAll(TIME_RANGE)) {
    const daySpec = text
      .slice(cursor, m.index)
      .replace(/^[\s,;:]+|[\s,;:]+$/g, "")
      .replace(/\s*-\s*/g, "-");
    cursor = m.index! + m[0].length;
    const which = parseDays(daySpec);
    const interval = parseRange(m);
    if (!which || !interval) return null;
    for (const d of which) days[d].push(interval);
    found = true;
  }
  // Anything left after the last time range ("…, Sun by request") is unread.
  if (!found || text.slice(cursor).replace(/[\s,;.]+/g, "") !== "") return null;
  return { kind: "weekly", days };
}

/** "m-f", "mon, wed, fri", "w-th", "daily", "saturdays" → day numbers. */
function parseDays(spec: string): number[] | null {
  if (spec === "daily" || spec === "every day" || spec === "7 days") return [0, 1, 2, 3, 4, 5, 6];
  if (!spec) return null;
  const out = new Set<number>();
  for (const token of spec.split(/\s*(?:,|&|\band\b|\s)\s*/).filter(Boolean)) {
    const [a, b] = token.split("-");
    const from = dayNumber(a);
    if (from == null) return null;
    if (b === undefined) {
      out.add(from);
      continue;
    }
    const to = dayNumber(b);
    if (to == null) return null;
    for (let d = from; ; d = (d + 1) % 7) {
      out.add(d);
      if (d === to) break;
    }
  }
  return out.size ? [...out] : null;
}

function dayNumber(token: string | undefined): number | null {
  if (!token) return null;
  const t = token.replace(/\.$/, "");
  return DAYS[t] ?? DAYS[t.replace(/s$/, "")] ?? null;
}

function parseRange(m: RegExpMatchArray): Interval | null {
  const [, h1, m1, mer1, h2, m2, mer2] = m;
  const close = toMinutes(+h2, +(m2 ?? 0), mer2);
  // "9-11am": the start borrows the end's am/pm unless that puts it after the end ("11-1pm").
  let open = toMinutes(+h1, +(m1 ?? 0), mer1 ?? mer2);
  if (!mer1 && open >= close) open = toMinutes(+h1, +(m1 ?? 0), mer2 === "pm" ? "am" : "pm");
  if (open == null || close == null) return null;
  // Past midnight ("8pm-2am") counts until midnight on the listed day.
  return { open, close: close <= open ? 1440 : close };
}

function toMinutes(h: number, m: number, meridiem: string): number {
  const hour = (h % 12) + (meridiem === "pm" ? 12 : 0);
  return hour * 60 + m;
}

/** Approximate New York sunrise and sunset by month, local clock time, in minutes. */
const DAYLIGHT: [number, number][] = [
  [7 * 60 + 15, 17 * 60], [6 * 60 + 50, 17 * 60 + 35], [7 * 60, 19 * 60 + 5],
  [6 * 60 + 25, 19 * 60 + 35], [5 * 60 + 45, 20 * 60 + 5], [5 * 60 + 25, 20 * 60 + 30],
  [5 * 60 + 40, 20 * 60 + 25], [6 * 60 + 10, 19 * 60 + 55], [6 * 60 + 40, 19 * 60 + 10],
  [7 * 60 + 10, 18 * 60 + 20], [6 * 60 + 45, 16 * 60 + 45], [7 * 60 + 10, 16 * 60 + 30],
]; // prettier-ignore

function intervalsOn(schedule: Schedule, at: LocalTime): Interval[] {
  if (schedule.kind === "always") return [{ open: 0, close: 1440 }];
  if (schedule.kind === "daylight") {
    const [open, close] = DAYLIGHT[at.month - 1];
    return [{ open, close }];
  }
  return schedule.days[at.day];
}

/** "Open tonight" means still open after 6 PM. */
export const EVENING = 18 * 60;

export type OpeningStatus = {
  /** Open right now; null when the hours can't be read. */
  open: boolean | null;
  /** Open at some point between now (or 6 PM, if later) and midnight. */
  tonight: boolean | null;
  /** When the current opening ends (minutes), if open. */
  closesAt: number | null;
  /** When it next opens later today (minutes), if closed now. */
  opensAt: number | null;
};

const UNKNOWN: OpeningStatus = { open: null, tonight: null, closesAt: null, opensAt: null };

export function openingStatus(hours: string | null | undefined, at: LocalTime): OpeningStatus {
  const schedule = parseHours(hours);
  if (!schedule) return UNKNOWN;
  const today = intervalsOn(schedule, at);
  const current = today.find((i) => i.open <= at.minutes && at.minutes < i.close);
  const eveningFrom = Math.max(at.minutes, EVENING);
  const later = today.filter((i) => i.open > at.minutes).sort((a, b) => a.open - b.open)[0];
  return {
    open: !!current,
    tonight: today.some((i) => i.close > eveningFrom),
    closesAt: current ? current.close : null,
    opensAt: current ? null : (later?.open ?? null),
  };
}

export function isOpenNow(hours: string | null | undefined, at: LocalTime = nycTime()) {
  return openingStatus(hours, at).open;
}

const NYC_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The current (or given) moment as a New York local time, wherever the code runs. */
export function nycTime(date: Date = new Date()): LocalTime {
  const parts = Object.fromEntries(NYC_PARTS.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    day: WEEKDAYS.indexOf(parts.weekday),
    minutes: (+parts.hour % 24) * 60 + +parts.minute,
    month: +parts.month,
  };
}

/** 1260 → "9 PM" in English, "21:00" in Spanish: minutes are dropped only on 12-hour clocks. */
export function formatClock(minutes: number, locale?: string): string {
  const d = new Date(2000, 0, 1, Math.floor(minutes / 60) % 24, minutes % 60);
  const { hourCycle } = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions();
  const twelveHour = hourCycle === "h11" || hourCycle === "h12";
  return d.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: minutes % 60 || !twelveHour ? "2-digit" : undefined,
  });
}

// One shared minute timer, however many components ask for the time.
let clock: LocalTime | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function subscribeClock(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    clock = nycTime();
    timer = setInterval(() => {
      clock = nycTime();
      listeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/**
 * New York time that updates every minute — `null` during server rendering
 * and hydration, so open/closed labels never cause a hydration mismatch.
 */
export function useNycTime(): LocalTime | null {
  return useSyncExternalStore(
    subscribeClock,
    () => clock,
    () => null,
  );
}
