import { describe, expect, it } from "vitest";
import type { Resource } from "@/lib/data";
import type { EventSummary } from "@/features/events";
import type { PolicyAlert } from "@/lib/policy-alerts";
import {
  activeDeadlines,
  eventsIn,
  greetingKey,
  nycIsoDate,
  openTonight,
  pickedFor,
} from "./today";

const listing = (id: string, hours: string, extra: Partial<Resource> = {}) =>
  ({
    id,
    category: "food",
    hours: { en: hours },
    distance: 1,
    neighborhood: "Mott Haven",
    ...extra,
  }) as unknown as Resource;

const event = (id: string, start: string, end: string | null = null) =>
  ({
    id,
    title: id,
    event_date: start,
    event_end_date: end,
    is_free: true,
    verification_status: "needs_verification",
  }) as EventSummary;

describe("greetingKey", () => {
  it("follows the time of day", () => {
    expect(greetingKey(8 * 60)).toBe("greetingMorning");
    expect(greetingKey(13 * 60)).toBe("greetingAfternoon");
    expect(greetingKey(19 * 60)).toBe("greetingEvening");
    expect(greetingKey(2 * 60)).toBe("greetingEvening");
  });
});

describe("openTonight", () => {
  const monNoon = { day: 1, minutes: 12 * 60, month: 10 };

  it("keeps only places open after 6 PM, open ones first, then nearest", () => {
    const list = openTonight(
      [
        listing("closes-at-6", "M-F 9am-6pm"),
        listing("evening-only", "M-F 6pm-9pm", { distance: 0.2 }),
        listing("open-now-far", "M-F 8am-8pm", { distance: 3 }),
        listing("open-now-near", "M-F 8am-8pm", { distance: 0.5 }),
        listing("unknown", "By appointment"),
      ],
      monNoon,
      null,
    );
    expect(list.map((l) => l.resource.id)).toEqual([
      "open-now-near",
      "open-now-far",
      "evening-only",
    ]);
  });

  it("prefers the chosen neighborhood when it has at least three", () => {
    const far = (id: string) => listing(id, "24/7", { neighborhood: "Riverdale", distance: 0.1 });
    const near = (id: string) => listing(id, "24/7", { distance: 2 });
    const mixed = [far("a"), far("b"), near("c"), near("d"), near("e")];
    expect(openTonight(mixed, monNoon, "Mott Haven").map((l) => l.resource.id)).toEqual([
      "c",
      "d",
      "e",
    ]);
    expect(openTonight(mixed.slice(0, 4), monNoon, "Mott Haven")[0].resource.id).toBe("a");
  });
});

describe("eventsIn", () => {
  // Wednesday 28 October 2026, local time.
  const wed = new Date(2026, 9, 28, 12);

  it("finds today's events, including multi-day ones that started earlier", () => {
    const list = eventsIn(
      [
        event("today", "2026-10-28"),
        event("tomorrow", "2026-10-29"),
        event("running", "2026-10-26", "2026-10-30"),
      ],
      "today",
      wed,
    );
    expect(list.map((e) => e.id)).toEqual(["today", "running"]);
  });

  it("finds this weekend's events (Friday to Sunday)", () => {
    const list = eventsIn(
      [
        event("thu", "2026-10-29"),
        event("fri", "2026-10-30"),
        event("sun", "2026-11-01"),
        event("mon", "2026-11-02"),
      ],
      "weekend",
      wed,
    );
    expect(list.map((e) => e.id)).toEqual(["fri", "sun"]);
  });

  it("finds the next 7 days of events, today included", () => {
    const list = eventsIn(
      [
        event("today", "2026-10-28"),
        event("tue", "2026-11-03"),
        event("wed-next", "2026-11-04"),
        event("ended", "2026-10-20", "2026-10-27"),
      ],
      "week",
      wed,
    );
    expect(list.map((e) => e.id)).toEqual(["today", "tue"]);
  });
});

describe("pickedFor", () => {
  it("never personalises from legal, health or housing browsing", () => {
    const all = [
      listing("food", "24/7"),
      listing("clinic", "24/7", { category: "health" }),
      listing("lawyer", "24/7", { category: "legal" }),
    ];
    expect(pickedFor(all, ["health", "legal"], null)).toEqual([]);
    expect(pickedFor(all, ["legal", "food"], null).map((r) => r.id)).toEqual(["food"]);
  });

  it("skips interests with no listings, and puts open places first", () => {
    const monNoon = { day: 1, minutes: 12 * 60, month: 10 };
    const all = [
      listing("closed", "M-F 6pm-9pm", { distance: 0.1 }),
      listing("open", "M-F 9am-5pm", { distance: 2 }),
      listing("park", "24/7", { category: "nature" }),
    ];
    const ids = pickedFor(all, ["community_events", "food"], monNoon).map((r) => r.id);
    expect(ids).toEqual(["open", "closed"]);
  });
});

describe("activeDeadlines", () => {
  const alert = (id: string, kind: "policy" | "deadline", deadline: string | null) =>
    ({ id, kind, deadline_date: deadline }) as PolicyAlert;

  it("keeps upcoming deadlines only, soonest first", () => {
    const list = activeDeadlines(
      [
        alert("later", "deadline", "2026-11-15"),
        alert("passed", "deadline", "2026-10-27"),
        alert("policy", "policy", "2026-10-30"),
        alert("today", "deadline", "2026-10-28"),
        alert("undated", "deadline", null),
      ],
      "2026-10-28",
    );
    expect(list.map((a) => a.id)).toEqual(["today", "later"]);
  });

  it("uses New York's date, not the device's", () => {
    expect(nycIsoDate(new Date("2026-10-29T02:00:00Z"))).toBe("2026-10-28");
  });
});
