/**
 * Privacy-by-design search logging.
 *
 * We never persist what a resident actually typed. A search for "immigration
 * lawyer bronx my husband was detained" is exactly the kind of sentence that
 * must not sit in a database. Instead we map the query to a coarse intent
 * bucket, and that bucket is the only thing analytics ever sees.
 */

export type SearchIntent =
  | "food"
  | "housing"
  | "health"
  | "mental_health"
  | "legal"
  | "immigration"
  | "jobs"
  | "childcare"
  | "youth"
  | "education"
  | "benefits"
  | "seniors"
  | "events"
  | "recreation"
  | "transit"
  | "civic"
  | "business"
  | "emergency"
  | "other";

const RULES: { intent: SearchIntent; terms: string[] }[] = [
  { intent: "emergency", terms: ["emergency", "911", "crisis", "suicide", "overdose", "shelter tonight", "domestic violence", "abuse", "988"] },
  { intent: "food", terms: ["food", "pantry", "meal", "eat", "hungry", "grocery", "snap", "wic", "halal", "kosher", "soup kitchen"] },
  { intent: "housing", terms: ["housing", "rent", "apartment", "evict", "landlord", "hpd", "shelter", "homeless", "section 8", "nycha", "heat", "mold"] },
  { intent: "mental_health", terms: ["mental", "therapy", "therapist", "counsel", "depress", "anxiety", "addiction", "rehab", "substance"] },
  { intent: "health", terms: ["health", "clinic", "doctor", "dentist", "dental", "medicaid", "insurance", "hospital", "pharmacy", "vaccine", "urgent care", "eye", "prenatal"] },
  { intent: "immigration", terms: ["immigra", "asylum", "visa", "green card", "daca", "citizenship", "ice", "undocumented", "deport"] },
  { intent: "legal", terms: ["legal", "lawyer", "attorney", "court", "rights", "expunge", "record"] },
  { intent: "jobs", terms: ["job", "work", "employ", "hiring", "resume", "career", "training", "apprentice", "union"] },
  { intent: "childcare", terms: ["childcare", "child care", "daycare", "day care", "babysit", "head start", "pre-k", "preschool"] },
  { intent: "youth", terms: ["youth", "teen", "after school", "afterschool", "summer youth", "syep", "mentor"] },
  { intent: "education", terms: ["school", "ged", "esl", "english class", "college", "tutor", "library", "adult education"] },
  { intent: "benefits", terms: ["benefit", "cash assist", "medicaid apply", "unemployment", "idnyc", "tax", "vita", "utility", "con ed"] },
  { intent: "seniors", terms: ["senior", "elder", "older adult", "nursing"] },
  { intent: "events", terms: ["event", "happening", "this weekend", "festival", "block party", "concert", "free thing", "today"] },
  { intent: "recreation", terms: ["park", "pool", "gym", "rec center", "kayak", "hike", "sport", "basketball", "garden", "nature", "art", "museum"] },
  { intent: "transit", terms: ["train", "subway", "bus", "metrocard", "omny", "transit", "fair fares"] },
  { intent: "civic", terms: ["community board", "council", "precinct", "vote", "voting", "elected", "senator", "assembly", "311", "borough president"] },
  { intent: "business", terms: ["business", "llc", "permit", "license", "grant", "loan", "vendor", "entrepreneur", "storefront"] },
];

/** Map a free-text query to a coarse intent bucket. Never returns the input. */
export function classifyIntent(raw: string): SearchIntent {
  const q = raw.toLowerCase();
  for (const rule of RULES) {
    if (rule.terms.some((t) => q.includes(t))) return rule.intent;
  }
  return "other";
}

/**
 * Shape signal for unmatched queries: how long/complex the ask was. Useful for
 * spotting content gaps without keeping the words.
 */
export function queryShape(raw: string): "short" | "phrase" | "sentence" {
  const words = raw.trim().split(/\s+/).filter(Boolean).length;
  if (words <= 2) return "short";
  if (words <= 5) return "phrase";
  return "sentence";
}
