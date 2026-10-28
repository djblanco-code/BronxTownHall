import { CATEGORIES, RESOURCES, type Category } from "@/lib/data";

/** Retail and general services remain valid listing types, but are not public browse categories. */
export const BROWSABLE_CATEGORIES = CATEGORIES.filter(
  (category) => category.id !== "retail" && category.id !== "services",
);

/** Two full rows of four on a phone. */
export const FEATURED_COUNT = 8;

/** Fallback order when we know nothing about the visitor yet. */
const DEFAULT_FEATURED: Category[] = [
  "food",
  "events",
  "health",
  "jobs",
  "housing",
  "youth",
  "education",
  "money",
];

/**
 * Sensitive categories never influence the featured tiles. Someone browsing
 * legal or health help should not have that surfaced back at them on a shared
 * or borrowed phone.
 */
const SENSITIVE_CATEGORIES: Category[] = ["legal", "health"];

/**
 * Featured tiles: favorited first, then behavioural signals, then stated
 * needs, then defaults. Always FEATURED_COUNT, all browsable.
 */
export function featuredCategoryIds(signals: {
  favoriteIds: string[];
  topCategories: Category[];
  needCategories: Category[];
}): Category[] {
  const favoriteCategories = signals.favoriteIds
    .map((id) => RESOURCES.find((r) => r.id === id)?.category)
    .filter((c): c is Category => !!c);
  const personal = [
    ...favoriteCategories,
    ...signals.topCategories,
    ...signals.needCategories,
  ].filter((c) => !SENSITIVE_CATEGORIES.includes(c));

  const out: Category[] = [];
  for (const c of [...personal, ...DEFAULT_FEATURED]) {
    if (!out.includes(c) && BROWSABLE_CATEGORIES.some((x) => x.id === c)) out.push(c);
    if (out.length === FEATURED_COUNT) break;
  }
  return out;
}
