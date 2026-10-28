// Local-only record of which categories someone actually browses.
// Nothing leaves the device: counts per category id, capped and decayed by age.
const KEY = "bronx.categoryHistory";
const MAX_ENTRIES = 40;

export type CategoryHistory = Record<string, { count: number; last: number }>;

export function readCategoryHistory(): CategoryHistory {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CategoryHistory) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Called whenever a category page or a listing in a category is viewed. */
export function recordCategoryView(category: string | null | undefined) {
  if (typeof window === "undefined") return;
  const id = (category ?? "").trim();
  if (!id) return;
  try {
    const hist = readCategoryHistory();
    const prev = hist[id];
    hist[id] = { count: (prev?.count ?? 0) + 1, last: Date.now() };
    const trimmed = Object.entries(hist)
      .sort((a, b) => b[1].last - a[1].last)
      .slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    /* ignore */
  }
}

/** Interests chosen during onboarding, when the visitor went through it. */
export function readProfileInterests(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("bronx.profile");
    const p = raw ? (JSON.parse(raw) as { interests?: unknown }) : null;
    const list = Array.isArray(p?.interests) ? (p?.interests as unknown[]) : [];
    return list.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
}

const DAY = 86_400_000;

/**
 * Category ids ranked by apparent interest, strongest first.
 * Browsing history outranks onboarding interests; recent views outrank old ones.
 */
export function rankedInterests(): string[] {
  const hist = readCategoryHistory();
  const now = Date.now();
  const scored = Object.entries(hist).map(([id, v]) => {
    const ageDays = Math.max(0, (now - v.last) / DAY);
    const recency = 1 / (1 + ageDays / 21); // halves after ~3 weeks
    return { id, score: v.count * (0.4 + 0.6 * recency) };
  });
  for (const id of readProfileInterests()) {
    const found = scored.find((s) => s.id === id);
    if (found) found.score += 1.5;
    else scored.push({ id, score: 1.5 });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.id);
}

export function hasInterestSignal(): boolean {
  return rankedInterests().length > 0;
}

/**
 * Splits a list into roughly 70% items matching known interests and ~30%
 * deliberately outside them, so discovery never gets squeezed out.
 * With no interest signal, returns a plain spread across categories.
 */
export function blendForDiscovery<T>(
  items: T[],
  categoryOf: (item: T) => string | null | undefined,
  limit: number,
): { picked: T[]; discoveryIds: Set<T> } {
  const interests = rankedInterests();
  const discovery = new Set<T>();

  if (items.length === 0) return { picked: [], discoveryIds: discovery };

  if (interests.length === 0) {
    // No signal yet: one item per category first, so the mix stays broad.
    const seen = new Set<string>();
    const spread: T[] = [];
    const rest: T[] = [];
    for (const item of items) {
      const c = (categoryOf(item) ?? "").trim();
      if (c && !seen.has(c)) {
        seen.add(c);
        spread.push(item);
      } else rest.push(item);
    }
    return { picked: [...spread, ...rest].slice(0, limit), discoveryIds: discovery };
  }

  const known = new Set(interests);
  const matching = items.filter((i) => known.has((categoryOf(i) ?? "").trim()));
  const outside = items.filter((i) => !known.has((categoryOf(i) ?? "").trim()));

  const outsideTarget = Math.max(1, Math.round(limit * 0.3));
  const matchTarget = limit - outsideTarget;

  const picked: T[] = [];
  picked.push(...matching.slice(0, matchTarget));
  const outsidePicks = outside.slice(0, limit - picked.length);
  for (const o of outsidePicks) discovery.add(o);
  picked.push(...outsidePicks);

  // Backfill if one side was short, so the section is never half-empty.
  if (picked.length < limit) {
    for (const item of items) {
      if (picked.length >= limit) break;
      if (!picked.includes(item)) picked.push(item);
    }
  }
  return { picked: picked.slice(0, limit), discoveryIds: discovery };
}
