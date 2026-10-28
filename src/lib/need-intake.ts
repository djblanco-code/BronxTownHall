// Natural-language intake: "I need help with X" → structured need + resource pack.
import { RESOURCES, CATEGORIES, type Category, type Resource } from "./data";
import type { Lang } from "./i18n";
import { isOpenNow, nycTime } from "./opening-hours";

export type NeedParse = {
  primaryNeed: Category;
  relatedNeeds: Category[];
  signals: string[]; // e.g. "has children", "lost job", "urgent"
  urgent: boolean;
  summary: string; // one-line empathetic restatement (English)
  source: "keywords" | "ai";
};

type Rule = { cat: Category; re: RegExp; signal?: string };

const RULES: Rule[] = [
  {
    cat: "jobs",
    re: /\b(laid off|lost my job|fired|unemploy|need (a )?job|work|hiring|resume|career|income)\b/,
    signal: "lost job / needs work",
  },
  {
    cat: "food",
    re: /\b(food|hungry|eat|meal|pantry|grocer|formula|wic|snap|ebt|feed)\b/,
    signal: "needs food",
  },
  {
    cat: "housing",
    re: /\b(evict|rent|homeless|shelter|landlord|apartment|housing|heat|no hot water|mold)\b/,
    signal: "housing risk",
  },
  {
    cat: "childcare",
    re: /\b(child ?care|daycare|day care|babysit|pre-?k|toddler|infant|kids?|children|son|daughter|baby)\b/,
    signal: "has children",
  },
  {
    cat: "health",
    re: /\b(sick|doctor|clinic|health|medicaid|insurance|medicine|prescription|dentist|pregnan|mental health|depress|anxious|therapy)\b/,
    signal: "health need",
  },
  {
    cat: "legal",
    re: /\b(legal|lawyer|attorney|immigration|ice |deport|asylum|court|ticket|discriminat|custody|divorce)\b/,
    signal: "legal need",
  },
  {
    cat: "money",
    re: /\b(cash|benefit|bill|utility|con ?ed|debt|money|financial|tax|budget)\b/,
    signal: "money strain",
  },
  {
    cat: "education",
    re: /\b(school|ged|esl|english class|college|class|training|certificat|learn)\b/,
    signal: "education",
  },
  {
    cat: "youth",
    re: /\b(teen|youth|after ?school|mentor|internship|summer job)\b/,
    signal: "youth",
  },
  {
    cat: "government",
    re: /\b(family|senior|elder|domestic violence|abuse|parent)\b/,
    signal: "family support",
  },
  {
    cat: "nature",
    re: /\b(gym|sport|exercise|swim|recreation|fitness|park|garden|outdoor|trail|nature)\b/,
  },
  { cat: "art", re: /\b(art|music|dance|museum|theater|paint)\b/ },
  {
    cat: "government",
    re: /\b(id card|idnyc|benefits office|community board|council member|311)\b/,
  },
];

const URGENT_RE =
  /\b(tonight|today|right now|emergency|urgent|no food|nowhere to (go|sleep)|evicted|suicid|unsafe|abuse|hurt)\b/;

/** Phase 1: fast, offline keyword parse. Always works, no network. */
export function parseNeedKeywords(input: string): NeedParse {
  const t = ` ${input.toLowerCase()} `;
  const hits: { cat: Category; idx: number; signal?: string }[] = [];
  for (const rule of RULES) {
    const m = rule.re.exec(t);
    if (m) hits.push({ cat: rule.cat, idx: m.index, signal: rule.signal });
  }
  hits.sort((a, b) => a.idx - b.idx);

  const cats: Category[] = [];
  for (const h of hits) if (!cats.includes(h.cat)) cats.push(h.cat);

  const primaryNeed = cats[0] ?? "food";
  const relatedNeeds = cats.slice(1, 5);
  const signals = Array.from(new Set(hits.map((h) => h.signal).filter(Boolean) as string[]));
  const urgent = URGENT_RE.test(t);

  return {
    primaryNeed,
    relatedNeeds,
    signals,
    urgent,
    summary: buildSummary(primaryNeed, relatedNeeds, signals, urgent),
    source: "keywords",
  };
}

export function buildSummary(
  primary: Category,
  related: Category[],
  signals: string[],
  urgent: boolean,
): string {
  const label = (c: Category) => CATEGORIES.find((x) => x.id === c)?.labelKey ?? c;
  const names = [primary, ...related].map((c) => String(label(c)));
  const lead = urgent ? "This sounds urgent." : "Here's what I found for you.";
  const sig = signals.length ? ` Based on: ${signals.join(", ")}.` : "";
  return `${lead} Starting with ${names[0]}${names.length > 1 ? `, plus ${names.slice(1).join(", ")}` : ""}.${sig}`;
}

/** Build a 5-resource "pack": best match per need, filling with nearby open options. */
export function buildResourcePack(parse: NeedParse, size = 5): Resource[] {
  const order: Category[] = [parse.primaryNeed, ...parse.relatedNeeds];
  const now = nycTime();
  const score = (r: Resource) =>
    (isOpenNow(r.hours.en, now) ? -100 : 0) + (r.free ? -10 : 0) + r.distance;
  const pack: Resource[] = [];

  // one per need first, so the pack spans categories
  for (const cat of order) {
    const best = RESOURCES.filter((r) => r.category === cat && !pack.includes(r)).sort(
      (a, b) => score(a) - score(b),
    )[0];
    if (best) pack.push(best);
    if (pack.length >= size) return pack;
  }
  // fill with more from the needs, then anything nearby
  const pool = [...RESOURCES.filter((r) => order.includes(r.category)), ...RESOURCES];
  for (const r of pool.sort((a, b) => score(a) - score(b))) {
    if (pack.length >= size) break;
    if (!pack.includes(r)) pack.push(r);
  }
  return pack.slice(0, size);
}

const SPOKEN_LEAD: Record<Lang, (n: number) => string> = {
  en: (n) => `I hear you. Here are ${n} places that can help, closest first.`,
  es: (n) => `Te escucho. Aquí hay ${n} lugares que pueden ayudarte, los más cercanos primero.`,
  fr: (n) =>
    `Je vous entends. Voici ${n} endroits qui peuvent vous aider, les plus proches d'abord.`,
  bn: (n) =>
    `আমি বুঝতে পারছি। এখানে ${n}টি জায়গা আছে যারা সাহায্য করতে পারে, সবচেয়ে কাছেরটি প্রথমে।`,
  ar: (n) => `أنا أسمعك. إليك ${n} أماكن يمكنها المساعدة، الأقرب أولاً.`,
};

const SPOKEN_CLOSE: Record<Lang, string> = {
  en: "You can call any of these today. If this is an emergency, call 911, or 988 for crisis support.",
  es: "Puedes llamar a cualquiera de estos hoy. Si es una emergencia, llama al 911, o al 988 para apoyo en crisis.",
  fr: "Vous pouvez appeler l'un de ces numéros aujourd'hui. En cas d'urgence, appelez le 911, ou le 988 pour une aide de crise.",
  bn: "আপনি আজই এদের যে কাউকে ফোন করতে পারেন। জরুরি হলে ৯১১, অথবা সংকট সহায়তার জন্য ৯৮৮ কল করুন।",
  ar: "يمكنك الاتصال بأي منها اليوم. في حالة الطوارئ، اتصل بـ 911، أو 988 للدعم في الأزمات.",
};

function speakPhone(p: string) {
  return p.replace(/\D/g, "").replace(/^1/, "").split("").join(" ");
}

/** Warm, spoken script for the whole pack, in the user's language. */
export function buildPackScript(pack: Resource[], lang: Lang, summary?: string): string {
  const lead = SPOKEN_LEAD[lang](pack.length);
  const body = pack
    .map(
      (r, i) =>
        `${i + 1}. ${r.name[lang]}. ${r.description[lang]} ${r.address}. ${r.hours[lang]}. Phone, ${speakPhone(r.phone)}.`,
    )
    .join(" ");
  return [lang === "en" && summary ? summary : "", lead, body, SPOKEN_CLOSE[lang]]
    .filter(Boolean)
    .join(" ");
}

/** Plain-text pack for SMS / share sheets. */
export function buildPackSms(pack: Resource[], lang: Lang, request: string): string {
  const head = request.trim()
    ? `Help for: "${request.trim().slice(0, 80)}"`
    : "Your Bronx help pack";
  const body = pack
    .map(
      (r, i) =>
        `${i + 1}. ${r.name[lang]}${isOpenNow(r.hours.en) ? " (OPEN NOW)" : ""}\n${r.address}\n${r.phone}`,
    )
    .join("\n\n");
  return `${head}\n\n${body}\n\nMore: thebronxapp.org`;
}

export const EXAMPLE_PROMPTS = [
  "I got laid off and I have two kids",
  "My landlord is trying to evict me",
  "I need food today and I don't have ID",
  "I'm pregnant and have no insurance",
  "My teenager needs a summer job",
];
