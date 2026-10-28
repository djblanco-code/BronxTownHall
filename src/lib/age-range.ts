/**
 * Age eligibility formatting. A listing's stated age range is the single
 * source of truth: the same listing shows the same tag on every category page.
 */

/** "Ages 14-24", "Ages 18+", "Ages up to 17", or null when nothing is stated. */
export function formatAgeRange(min?: number, max?: number): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `Ages ${min}-${max}`;
  if (min != null) return `Ages ${min}+`;
  return `Ages up to ${max}`;
}

/** Does the stated range include anyone under 18? */
export function includesMinors(min?: number, max?: number): boolean | null {
  if (min == null && max == null) return null;
  return (min ?? 0) < 18;
}

/** Does the stated range include anyone 18 or older? */
export function includesAdults(min?: number, max?: number): boolean | null {
  if (min == null && max == null) return null;
  return max == null || max >= 18;
}
