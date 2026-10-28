import { describe, expect, it } from "vitest";
import { formatClock, isOpenNow, nycTime, openingStatus, parseHours } from "./opening-hours";

const SUN = 0, MON = 1, TUE = 2, WED = 3, THU = 4, SAT = 6; // prettier-ignore
const at = (day: number, hh: number, mm = 0, month = 10) => ({ day, minutes: hh * 60 + mm, month });

describe("parseHours", () => {
  it("reads weekday ranges with and without minutes", () => {
    expect(parseHours("M-F 9am-5pm")).toEqual({
      kind: "weekly",
      days: [[], ...Array(5).fill([{ open: 540, close: 1020 }]), []],
    });
    expect(parseHours("M-F 7:30am-5:30pm")).toMatchObject({ kind: "weekly" });
  });

  it("reads several segments and day lists", () => {
    const s = parseHours("M-F 8am-8pm, Sat 8am-4pm");
    expect(s?.kind === "weekly" && s.days[SAT]).toEqual([{ open: 480, close: 960 }]);
    const list = parseHours("Mon, Wed, Fri 9am–1pm");
    expect(list?.kind === "weekly" && list.days.map((d) => d.length)).toEqual([
      0, 1, 0, 1, 0, 1, 0,
    ]);
    const short = parseHours("W-Th 4-6pm, F 10am-12pm");
    expect(short?.kind === "weekly" && short.days[THU]).toEqual([{ open: 960, close: 1080 }]);
  });

  it("borrows am/pm from the end of a range", () => {
    expect(parseHours("Saturday 9-11am")).toMatchObject({ kind: "weekly" });
    const s = parseHours("Mon-Fri 1-5pm");
    expect(s?.kind === "weekly" && s.days[MON]).toEqual([{ open: 780, close: 1020 }]);
    const noon = parseHours("Saturday 11am-12:30pm");
    expect(noon?.kind === "weekly" && noon.days[SAT]).toEqual([{ open: 660, close: 750 }]);
  });

  it("wraps day ranges across the weekend", () => {
    const s = parseHours("Wed–Sun 11am–6pm");
    expect(s?.kind === "weekly" && s.days.map((d) => d.length)).toEqual([1, 0, 0, 1, 1, 1, 1]);
  });

  it("reads common database spellings", () => {
    const s = parseHours("Monday - Friday: 9:00 A.M. to 5:00 P.M., Sun closed");
    expect(s?.kind === "weekly" && s.days[TUE]).toEqual([{ open: 540, close: 1020 }]);
    expect(parseHours("Saturdays 4pm–9pm")).toMatchObject({ kind: "weekly" });
  });

  it("knows always-open and park hours", () => {
    expect(parseHours("24/7")).toEqual({ kind: "always" });
    expect(parseHours("24/7 for emergencies")).toEqual({ kind: "always" });
    expect(parseHours("Daily dawn–dusk")).toEqual({ kind: "daylight" });
  });

  it("returns null when it can't be sure", () => {
    for (const text of [
      "By appointment",
      "By phone",
      "Wednesdays",
      "Wed 9:30-11:30am (2nd & 4th)",
      "First Tuesday of every month, 6:30pm",
      "Monthly May-Oct, 4-10pm",
      "Summer weekends",
      "Event-based",
      "Sat 10am (summer)",
      "",
      null,
      undefined,
    ]) {
      expect(parseHours(text), String(text)).toBeNull();
    }
  });
});

describe("openingStatus", () => {
  it("is open inside the hours and closed at closing time", () => {
    expect(isOpenNow("M-F 9am-5pm", at(MON, 10))).toBe(true);
    expect(isOpenNow("M-F 9am-5pm", at(MON, 17))).toBe(false);
    expect(isOpenNow("M-F 9am-5pm", at(SAT, 12))).toBe(false);
    expect(isOpenNow("By appointment", at(MON, 10))).toBeNull();
  });

  it("reports when it closes, or opens later today", () => {
    expect(openingStatus("M-F 8am-8pm", at(MON, 12)).closesAt).toBe(20 * 60);
    expect(openingStatus("W 9-11am, Th 3-6pm", at(THU, 10)).opensAt).toBe(15 * 60);
    expect(openingStatus("M-F 9am-5pm", at(MON, 18)).opensAt).toBeNull();
  });

  it("counts as open tonight only past 5 PM and before closing", () => {
    expect(openingStatus("M-F 8am-8pm", at(MON, 12)).tonight).toBe(true);
    expect(openingStatus("M-F 8am-8pm", at(MON, 20)).tonight).toBe(false);
    expect(openingStatus("M-F 9am-5pm", at(MON, 12)).tonight).toBe(false);
    expect(openingStatus("24/7", at(SUN, 23)).tonight).toBe(true);
    expect(openingStatus("Monthly", at(MON, 12)).tonight).toBeNull();
  });

  it("follows the season for dawn-to-dusk parks", () => {
    expect(isOpenNow("Dawn–dusk", at(WED, 20, 0, 6))).toBe(true);
    expect(isOpenNow("Dawn–dusk", at(WED, 17, 0, 12))).toBe(false);
  });
});

describe("nycTime", () => {
  it("converts to New York local time, including daylight saving", () => {
    expect(nycTime(new Date("2026-07-01T16:30:00Z"))).toEqual({ day: WED, minutes: 750, month: 7 });
    expect(nycTime(new Date("2026-01-05T03:00:00Z"))).toEqual({
      day: SUN,
      minutes: 1320,
      month: 1,
    });
  });
});

describe("formatClock", () => {
  it("formats minutes as a clock time", () => {
    expect(formatClock(21 * 60, "en-US")).toBe("9 PM");
    expect(formatClock(17 * 60 + 30, "en-US")).toBe("5:30 PM");
  });
});
