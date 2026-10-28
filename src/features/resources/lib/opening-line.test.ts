import { describe, expect, it } from "vitest";
import { openingLine } from "./opening-line";

const monAt = (hh: number) => ({ day: 1, minutes: hh * 60, month: 10 });

describe("openingLine", () => {
  it("says when an open place closes", () => {
    expect(openingLine("M-F 9am-8pm", monAt(12))).toEqual({
      key: "openUntil",
      open: true,
      time: 20 * 60,
    });
    expect(openingLine("M-F 6pm-2am", monAt(19))?.key).toBe("openUntilMidnight");
    expect(openingLine("24/7", monAt(3))?.key).toBe("open24h");
    expect(openingLine("Dawn–dusk", monAt(12))?.key).toBe("openUntilDusk");
  });

  it("says when a closed place opens later today, and nothing otherwise", () => {
    expect(openingLine("M-F 3pm-6pm", monAt(12))).toEqual({
      key: "opensAt",
      open: false,
      time: 15 * 60,
    });
    expect(openingLine("M-F 9am-5pm", monAt(18))).toBeNull();
    expect(openingLine("By appointment", monAt(12))).toBeNull();
  });
});
