import { describe, expect, it } from "vitest";
import { countMatches, detectIntent, searchTerms } from "./search-intent";

describe("detectIntent", () => {
  it("picks a category from whole words only", () => {
    expect(detectIntent("food pantry near me").category).toBe("food");
    expect(detectIntent("legal aid").category).toBe("legal");
    // "eat" inside "heating", "aid" inside "medicaid", "kid" inside "kidney"
    expect(detectIntent("help with heating bill").category).toBeUndefined();
    expect(detectIntent("medicaid").category).toBeUndefined();
    expect(detectIntent("kidney doctor").category).toBe("health");
  });

  it("reads dietary and accessibility filters", () => {
    expect(detectIntent("halal food")).toMatchObject({ dietary: ["halal"], category: "food" });
    expect(detectIntent("wheelchair accessible").accessibility).toEqual(["wheelchair"]);
  });
});

describe("searchTerms", () => {
  it("drops what the filters already cover and filler words", () => {
    expect(searchTerms("food pantry near me")).toEqual([]);
    expect(searchTerms("halal food")).toEqual([]);
    expect(searchTerms("Guinean restaurant")).toEqual([]);
    expect(searchTerms("wheelchair accessible")).toEqual([]);
  });

  it("keeps the words that describe what someone wants", () => {
    expect(searchTerms("Help paying my heating bill!")).toEqual(["paying", "heating", "bill"]);
    expect(searchTerms("medicaid")).toEqual(["medicaid"]);
    expect(searchTerms("free tax help")).toEqual(["tax"]);
  });
});

describe("countMatches", () => {
  it("counts terms found in the text, including simple plurals", () => {
    const text = "Free food pantry with fresh produce. Medicaid enrollment help.";
    expect(countMatches(text, ["medicaid", "produce"])).toBe(2);
    expect(countMatches(text, ["pantries"])).toBe(1);
    expect(countMatches(text, ["lawyers"])).toBe(0);
    // Only at the start of a word: "rent" must not match "parent".
    expect(countMatches("Help for every parent", ["rent"])).toBe(0);
    expect(countMatches("Emergency rental assistance", ["rent"])).toBe(1);
  });
});
