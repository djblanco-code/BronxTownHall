/**
 * Single source of truth for the languages a listing is available in.
 *
 * The summary pill on a detail page and the individual 🗣️ tags below it are
 * generated from THIS helper, so they can never disagree (a past bug: the
 * summary silently dropped English while the tags kept it).
 */

const CANON: Record<string, string> = {
  english: "English",
  spanish: "Spanish",
  espanol: "Spanish",
  español: "Spanish",
  french: "French",
  francais: "French",
  français: "French",
  bengali: "Bengali",
  bangla: "Bengali",
  arabic: "Arabic",
  albanian: "Albanian",
  creole: "Haitian Creole",
  "haitian creole": "Haitian Creole",
  mandarin: "Mandarin",
  chinese: "Chinese",
  russian: "Russian",
  yoruba: "Yoruba",
  wolof: "Wolof",
  fulani: "Fulani",
  twi: "Twi",
  urdu: "Urdu",
  hindi: "Hindi",
  punjabi: "Punjabi",
};

function cap(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Normalized, de-duplicated, display-ready language list for one listing. */
export function listingLanguages(languages?: string[] | null): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of languages ?? []) {
    const key = String(raw).trim().toLowerCase();
    if (!key) continue;
    const label = CANON[key] ?? cap(key);
    const dedupe = label.toLowerCase();
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    out.push(label);
  }
  return out;
}

/** "Spanish", "Spanish & Arabic", "English, Spanish & Arabic" — same list as the tags. */
export function languageSummary(languages?: string[] | null): string | null {
  const l = listingLanguages(languages);
  if (l.length === 0) return null;
  if (l.length === 1) return l[0];
  return `${l.slice(0, -1).join(", ")} & ${l[l.length - 1]}`;
}
