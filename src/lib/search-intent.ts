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

  if (/\bwheelchair|accessible\b/.test(t)) {
    out.accessibility.push("wheelchair");
    notes.push("wheelchair-accessible places");
  }

  for (const w of HERITAGE_WORDS) {
    if (t.includes(w)) {
      out.heritage.push(w);
      notes.push(`${w.replace(/\b\w/g, (c) => c.toUpperCase())}-owned businesses`);
    }
  }

  if (/\bfood|eat|restaurant|pantry|meal|grocery\b/.test(t)) out.category = "food";
  else if (/\bclinic|doctor|health|hospital|pharmacy\b/.test(t)) out.category = "health";
  else if (/\blegal|lawyer|attorney|aid\b/.test(t)) out.category = "legal";
  else if (/\bjob|work|employment|hiring\b/.test(t)) out.category = "jobs";
  else if (/\bchildcare|daycare|pre[- ]?k\b/.test(t)) out.category = "childcare";
  else if (/\byouth|teen|kid|after[- ]?school\b/.test(t)) out.category = "youth";

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
