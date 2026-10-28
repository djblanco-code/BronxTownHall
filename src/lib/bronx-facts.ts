export type FactCategory =
  | "History" | "Culture" | "Geography" | "People" | "Landmarks" | "Food" | "Sports" | "Music";

export type BronxFact = {
  id: number;
  fact: string;
  category: FactCategory;
  source?: string;
};

export const BRONX_FACTS: BronxFact[] = [
  { id: 1, fact: "The Bronx is the only NYC borough located on the mainland. Every other borough is on an island.", category: "Geography" },
  { id: 2, fact: "The Bronx is the only NYC borough with 'THE' in its name — named after the Bronx River, which was named after Jonas Bronck.", category: "History" },
  { id: 3, fact: "Before Jonas Bronck arrived, the land was known as Rananchqua by the Siwanoy Native Americans of the Lenape Tribe.", category: "History" },
  { id: 4, fact: "Van Cortlandt House is the Bronx's oldest surviving building (1748). George Washington stayed here!", category: "Landmarks" },
  { id: 5, fact: "A young JFK lived in Riverdale, Bronx, before becoming our 35th President.", category: "People" },
  { id: 6, fact: "The Bronx is the birthplace of Hip Hop — DJ Kool Herc hosted the first party on Sedgwick Avenue on August 13, 1973.", category: "Music" },
  { id: 7, fact: "The Bronx is also the birthplace of breakdancing!", category: "Culture" },
  { id: 8, fact: "Arthur Avenue in Belmont is NYC's REAL 'Little Italy' — not Manhattan's.", category: "Food" },
  { id: 9, fact: "The Piccirilli brothers sculpted the Lincoln Memorial and the NYPL lion statues — right here in the Bronx!", category: "Culture" },
  { id: 10, fact: "The Bronx's High Bridge is the oldest bridge in all of NYC!", category: "Landmarks" },
  { id: 11, fact: "The Bronx Zoo is the largest zoo in the U.S. with 265 acres!", category: "Landmarks" },
  { id: 12, fact: "Pelham Bay Park is the largest park in NYC — 3x the size of Central Park!", category: "Geography" },
  { id: 13, fact: "The Bronx is the greenest borough — 25% of its land is dedicated to parks.", category: "Geography" },
  { id: 14, fact: "Van Cortlandt Park Golf Course is the nation's oldest public golf course (1895).", category: "Sports" },
  { id: 15, fact: "Hart Island near the Bronx is the largest mass graveyard in the U.S., with about 1 million unclaimed bodies buried since the 1860s.", category: "History" },
  { id: 16, fact: "Woodlawn Cemetery may have more famous people buried there than any other cemetery — from Duke Ellington to Miles Davis!", category: "Music" },
  { id: 17, fact: "Edgar Allan Poe wrote 'Annabel Lee' in his final home in the Bronx — now a museum!", category: "People" },
  { id: 18, fact: "Stan Lee grew up in the Bronx and co-created Spider-Man, the Hulk, and Thor!", category: "People" },
  { id: 19, fact: "The Bronx has its own beach — Orchard Beach on the Long Island Sound!", category: "Landmarks" },
  { id: 20, fact: "The Grand Concourse has the largest collection of Art Deco buildings in America — surpassing Miami Beach!", category: "Landmarks" },
];

// Deterministic "fact of the day" — same fact for all users on the same calendar day (UTC).
export function factOfTheDay(date: Date = new Date()): BronxFact {
  const epoch = Date.UTC(2024, 0, 1);
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - epoch) / 86400000);
  const idx = ((day % BRONX_FACTS.length) + BRONX_FACTS.length) % BRONX_FACTS.length;
  return BRONX_FACTS[idx];
}

export function dateForFact(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

const LIKES_KEY = "bronx_fact_likes";
export function getLikedFacts(): number[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LIKES_KEY) || "[]"); } catch { return []; }
}
export function toggleLikedFact(id: number): number[] {
  const cur = getLikedFacts();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(LIKES_KEY, JSON.stringify(next));
  return next;
}
