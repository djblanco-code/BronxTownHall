/**
 * Verification model for resources and events.
 *
 * IMPORTANT: nothing here invents a date. A listing is only ever described as
 * verified when a real `last_verified` timestamp exists in the database.
 * Everything else reads "Not yet verified".
 */

export type VerificationStatus =
  | "verified_by_org"
  | "verified_by_bronx_app"
  | "verified_public_source"
  | "community_submitted"
  | "needs_verification";

export const VERIFICATION_STATUSES: VerificationStatus[] = [
  "verified_by_org",
  "verified_by_bronx_app",
  "verified_public_source",
  "community_submitted",
  "needs_verification",
];

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified_by_org: "Confirmed by the organization",
  verified_by_bronx_app: "Verified by The Bronx App",
  verified_public_source: "Verified from a public source",
  community_submitted: "Submitted by a community member",
  needs_verification: "Not yet verified",
};

/** Short label used inside the pill. */
export const VERIFICATION_SHORT: Record<VerificationStatus, string> = {
  verified_by_org: "Confirmed by org",
  verified_by_bronx_app: "Verified",
  verified_public_source: "Public source",
  community_submitted: "Community",
  needs_verification: "Not yet verified",
};

export function isVerified(status: VerificationStatus): boolean {
  return (
    status === "verified_by_org" ||
    status === "verified_by_bronx_app" ||
    status === "verified_public_source"
  );
}

/** Default re-check cadence by category. Overridable per record and in the DB. */
export const DEFAULT_VERIFY_DAYS: Record<string, number> = {
  food: 90,
  health: 365,
  legal: 180,
  jobs: 120,
  events: 30,
  government: 365,
  childcare: 180,
  youth: 120,
  housing: 180,
  education: 180,
  money: 180,
  family: 180,
  nature: 365,
  art: 180,
  recreation: 180,
};

export function verifyEveryDaysFor(category: string): number {
  return DEFAULT_VERIFY_DAYS[category] ?? 180;
}

export type Freshness = "fresh" | "due_soon" | "overdue" | "never";

/**
 * Freshness is relative to the record's own cadence, not a global 30/90 rule:
 * a pantry goes stale in 90 days, a hospital in a year.
 */
export function freshnessOf(
  lastVerified: Date | string | null | undefined,
  verifyEveryDays: number,
): Freshness {
  if (!lastVerified) return "never";
  const d = lastVerified instanceof Date ? lastVerified : new Date(lastVerified);
  if (Number.isNaN(d.getTime())) return "never";
  const days = (Date.now() - d.getTime()) / 86_400_000;
  if (days >= verifyEveryDays) return "overdue";
  if (days >= verifyEveryDays * 0.75) return "due_soon";
  return "fresh";
}

export function daysAgo(date: Date | string): number {
  const d = date instanceof Date ? date : new Date(date);
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}

/** Human phrasing for how long ago something was verified. */
export function verifiedAgoLabel(date: Date | string): string {
  const n = daysAgo(date);
  if (n === 0) return "today";
  if (n === 1) return "yesterday";
  if (n < 7) return `${n} days ago`;
  const plural = (v: number, unit: string) => `${v} ${unit}${v === 1 ? "" : "s"} ago`;
  if (n < 30) return plural(Math.floor(n / 7), "week");
  if (n < 365) return plural(Math.floor(n / 30), "month");
  return plural(Math.floor(n / 365), "year");
}
