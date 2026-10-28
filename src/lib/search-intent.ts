// Lightweight keyword → filter detection for the search bar.
import { Category } from "./data";

export type DetectedFilters = {
  dietary: string[];
  ownership: string[];
  heritage: string[];
  accessibility: string[];
  languages: string[];
  category?: Category;
  message?: string;
};

const HERITAGE_WORDS = [
  "guinean",
  "senegalese",
  "nigerian",
  "ghanaian",
  "ivorian",
  "malian",
  "dominican",
  "puerto rican",
  "mexican",
  "ecuadorian",
  "honduran",
  "colombian",
  "bengali",
  "bangladeshi",
  "indian",
  "pakistani",
  "yemeni",
  "moroccan",
  "egyptian",
  "lebanese",
  "syrian",
  "haitian",
  "jamaican",
  "trinidadian",
  "chinese",
  "vietnamese",
  "korean",
  "filipino",
];

/**
 * Words that pick a category. Whole words only: "eat" must not match inside
 * "heating", nor "aid" inside "medicaid".
 */
const CATEGORY_WORDS: [RegExp, Category][] = [
  [/\b(?:food|eat|restaurants?|pantry|pantries|meals?|grocery|groceries)\b/, "food"],
  [/\b(?:clinics?|doctors?|health|hospitals?|pharmacy|pharmacies)\b/, "health"],
  [/\b(?:legal|lawyers?|attorneys?|legal aid)\b/, "legal"],
  [/\b(?:jobs?|work|employment|hiring)\b/, "jobs"],
  [/\b(?:childcare|daycare|pre[- ]?k)\b/, "childcare"],
  [/\b(?:youth|teens?|kids?|after[- ]?school)\b/, "youth"],
];

/** Phrases the filters above already handle, so they aren't searched as text too. */
const FILTER_PHRASES: RegExp[] = [
  ...CATEGORY_WORDS.map(([re]) => re),
  /\b(?:halal|kosher|vegan|vegetarian|gluten[- ]?free)\b/,
  /\b(?:women|minority|immigrant|veteran)[- ]?owned\b/,
  /\b(?:wheelchair|accessible)\b/,
  ...HERITAGE_WORDS.map((w) => new RegExp(`\\b${w}\\b`)),
];

/**
 * Filler that says nothing about which listing someone wants ("free" too:
 * nearly every listing is free, so it would match them all).
 */
const STOP_WORDS = new Set(
  (
    "a an and any are at be bronx by can do for from get go have help how i in is it me my " +
    "near need nearby nyc of on or place places please some the there to want where with " +
    "open now today find looking free"
  ).split(" "),
);

/** What's left of a query to match against listing text, once filters and filler are removed. */
export function searchTerms(q: string): string[] {
  let t = q.toLowerCase();
  for (const re of FILTER_PHRASES) t = t.replace(new RegExp(re.source, "g"), " ");
  return t
    .split(/[^\p{L}\p{N}'-]+/u)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * How many of the terms start a word in the text ("rent" finds "rental" but
 * not "parent"), allowing simple plurals ("pantries" finds "pantry").
 */
export function countMatches(text: string, terms: string[]): number {
  const hay = text.toLowerCase();
  const startsWord = (w: string) =>
    new RegExp(`(?:^|[^\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u").test(hay);
  return terms.filter((w) => {
    if (startsWord(w)) return true;
    if (w.endsWith("ies") && startsWord(w.slice(0, -3) + "y")) return true;
    return w.length > 3 && w.endsWith("s") && startsWord(w.slice(0, -1));
  }).length;
}

export function detectIntent(q: string): DetectedFilters {
  const t = q.toLowerCase();
  const out: DetectedFilters = {
    dietary: [],
    ownership: [],
    heritage: [],
    accessibility: [],
    languages: [],
  };
  const notes: string[] = [];

  if (/\bhalal\b/.test(t)) {
    out.dietary.push("halal");
    notes.push("halal options");
  }
  if (/\bkosher\b/.test(t)) {
    out.dietary.push("kosher");
    notes.push("kosher options");
  }
  if (/\bvegan\b/.test(t)) {
    out.dietary.push("vegan");
    notes.push("vegan options");
  }
  if (/\bvegetarian\b/.test(t)) {
    out.dietary.push("vegetarian");
    notes.push("vegetarian options");
  }
  if (/\bgluten[- ]?free\b/.test(t)) {
    out.dietary.push("gluten-free");
    notes.push("gluten-free options");
  }

  if (/\bwomen[- ]?owned\b/.test(t)) {
    out.ownership.push("women");
    notes.push("women-owned businesses");
  }
  if (/\bminority[- ]?owned\b/.test(t)) {
    out.ownership.push("minority");
    notes.push("minority-owned businesses");
  }
  if (/\bimmigrant[- ]?owned\b/.test(t)) {
    out.ownership.push("immigrant");
    notes.push("immigrant-owned businesses");
  }
  if (/\bveteran[- ]?owned\b/.test(t)) {
    out.ownership.push("veteran");
    notes.push("veteran-owned businesses");
  }

  if (/\b(?:wheelchair|accessible)\b/.test(t)) {
    out.accessibility.push("wheelchair");
    notes.push("wheelchair-accessible places");
  }

  for (const w of HERITAGE_WORDS) {
    if (t.includes(w)) {
      out.heritage.push(w);
      notes.push(`${w.replace(/\b\w/g, (c) => c.toUpperCase())}-owned businesses`);
    }
  }

  const category = CATEGORY_WORDS.find(([re]) => re.test(t));
  if (category) out.category = category[1];

  if (notes.length) out.message = `Showing ${notes.join(" + ")}`;
  return out;
}

export function hasAnyFilter(f: DetectedFilters) {
  return (
    f.dietary.length +
      f.ownership.length +
      f.heritage.length +
      f.accessibility.length +
      f.languages.length >
    0
  );
}
