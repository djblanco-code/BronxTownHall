/**
 * Organization accounts: businesses, nonprofits / community organizations and
 * government offices submit and manage their own listings.
 *
 * Everything an organization types about itself is SELF-REPORTED. It goes live
 * immediately at Tier 1 ("Not yet verified") and only becomes Tier 2
 * ("Verified") after a Bronx Town Hall admin confirms it by hand. Paying for Premium
 * never grants the badge.
 */

import { supabase } from "@/integrations/supabase/client";

export type AccountType = "business" | "nonprofit" | "government";
export type OrgStatus = "pending_review" | "verified" | "needs_changes" | "rejected";
export type TierInterest = "free" | "premium_interest" | "exploring";

export const ACCOUNT_TYPES: { id: AccountType; label: string; blurb: string; emoji: string }[] = [
  {
    id: "business",
    label: "Business",
    emoji: "🏪",
    blurb: "A for-profit business serving Bronx residents.",
  },
  {
    id: "nonprofit",
    label: "Nonprofit / Community Organization",
    emoji: "🤝",
    blurb:
      "A nonprofit, faith or grassroots community group — formal 501(c)(3) status is not required.",
  },
  {
    id: "government",
    label: "Government Worker",
    emoji: "🏛️",
    blurb:
      "An elected official's office, city agency or community board. Requires a .gov or .nyc.gov email.",
  },
];

export const ORG_CATEGORIES = [
  "food",
  "health",
  "legal",
  "jobs",
  "housing",
  "youth",
  "education",
  "money",
  "childcare",
  "nature",
  "art",
  "government",
  "events",
  "other",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  health: "Health",
  legal: "Legal",
  jobs: "Jobs",
  housing: "Housing",
  youth: "Youth",
  education: "Education",
  money: "Money",
  family: "Family",
  childcare: "Childcare",
  nature: "Nature & Recreation",
  art: "Art",
  government: "Government",
  events: "Events",
  other: "Other / General Business",
};

export const LANGUAGE_OPTIONS = ["English", "Spanish", "French", "Bengali", "Arabic", "Other"];
export const ACCESSIBILITY_OPTIONS = [
  "ADA Compliant",
  "Wheelchair Accessible",
  "Accessible Restroom",
];
export const OWNERSHIP_OPTIONS = [
  "Minority-Owned",
  "Women-Owned",
  "Family-Owned",
  "Veteran-Owned",
  "Immigrant-Owned",
  "Fair Chance Employer",
];
export const DIETARY_OPTIONS = ["Halal", "Kosher", "Vegetarian", "Vegan"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const COMMUNITY_BOARDS = Array.from(
  { length: 12 },
  (_, i) => `Bronx Community Board ${i + 1}`,
);

/** Fields an admin can confirm on their own vs. fields needing a call or a visit. */
export const DESK_FIELDS = [
  "category",
  "accessibility",
  "languages",
  "services",
  "website",
] as const;
export const CALL_FIELDS = ["address", "hours", "public_phone", "requirements"] as const;
export const VERIFIABLE_FIELDS = [...DESK_FIELDS, ...CALL_FIELDS] as const;

export const FIELD_LABELS: Record<string, string> = {
  category: "Category",
  accessibility: "Accessibility tags",
  languages: "Languages",
  services: "Services offered",
  website: "Website",
  address: "Address",
  hours: "Hours",
  public_phone: "Public phone",
  requirements: "Requirements",
};

/** How often a category's details should be re-checked (days). */
export const VOLATILITY_DAYS: Record<string, number> = {
  food: 30,
  events: 30,
  jobs: 60,
  housing: 90,
  childcare: 90,
  family: 90,
  money: 90,
  legal: 120,
  youth: 120,
  education: 120,
  art: 120,
  nature: 180,
  health: 180,
  government: 180,
};

export type OrgAccount = {
  id: string;
  user_id: string;
  account_type: AccountType;
  org_name: string;
  has_physical_location: boolean;
  address: string | null;
  zip_code: string | null;
  neighborhood: string | null;
  public_phone: string | null;
  website: string | null;
  hours: Record<string, string>;
  hours_mode: "schedule" | "call" | "appointment";
  category: string | null;
  languages: string[];
  languages_other: string | null;
  services: string | null;
  requirements: string | null;
  accessibility: string[];
  ownership_tags: string[];
  ownership_other: string | null;
  dietary_tags: string[];
  photo_url: string | null;
  socials: Record<string, string>;
  business_industry: string | null;
  has_google_listing: boolean | null;
  tier_interest: TierInterest | null;
  premium: boolean;
  nonprofit_status: "yes" | "pending" | "no" | null;
  mission: string | null;
  ein: string | null;
  population_served: string | null;
  office_name: string | null;
  role_title: string | null;
  district: string | null;
  status: OrgStatus;
  published: boolean;
  priority_review: boolean;
  verified_at: string | null;
  verified_fields: Record<string, string>;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrgContact = {
  org_id: string;
  user_id: string;
  contact_name: string;
  contact_role: string | null;
  contact_email: string;
  contact_phone: string | null;
};

export type OfficialUpdate = {
  id: string;
  org_id: string;
  user_id: string;
  body: string;
  status: "published" | "hidden";
  created_at: string;
};

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function isGovernmentEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return domain.endsWith(".gov") || domain.endsWith(".nyc.gov");
}

export const GOV_EMAIL_MESSAGE =
  "Government accounts control official contact information shown to residents, so sign-up needs an official address ending in .gov or .nyc.gov. If your office uses a different address, use the Nonprofit option or contact us and we'll set the account up by hand.";

/* ------------------------------------------------------------------ */
/* Verification display                                                */
/* ------------------------------------------------------------------ */

export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export type VerificationBadge = { label: string; tone: "neutral" | "green" | "amber" };

export function badgeFor(
  o: Pick<OrgAccount, "status" | "verified_at" | "verified_fields">,
): VerificationBadge {
  if (o.status === "verified" && o.verified_at) {
    const d = new Date(o.verified_at);
    return {
      label: `Verified ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
      tone: "green",
    };
  }
  const confirmed = Object.keys(o.verified_fields ?? {}).length;
  if (confirmed > 0)
    return {
      label: `Partly verified · ${confirmed} of ${VERIFIABLE_FIELDS.length} details confirmed`,
      tone: "amber",
    };
  return { label: "Not yet verified", tone: "neutral" };
}

/** True when a verified listing is older than its category's re-check window. */
export function needsRecheck(o: Pick<OrgAccount, "status" | "verified_at" | "category">): boolean {
  if (o.status !== "verified") return false;
  const d = daysSince(o.verified_at);
  if (d === null) return true;
  return d > (VOLATILITY_DAYS[o.category ?? ""] ?? 120);
}

/* ------------------------------------------------------------------ */
/* Data access                                                         */
/* ------------------------------------------------------------------ */

const cast = (r: unknown) => r as OrgAccount;

/**
 * Internal columns (ein, admin_notes, verified_fields, priority_review) are not
 * readable through the table for any API role — owners and admins reach their
 * own full rows through these security-definer functions instead.
 */
export async function loadMyOrgs(userId: string): Promise<OrgAccount[]> {
  const { data, error } = await supabase.rpc("my_org_accounts" as never);
  if (error) throw error;
  return ((data ?? []) as unknown[]).map(cast).filter((o) => o.user_id === userId);
}

export async function loadAllOrgs(): Promise<OrgAccount[]> {
  const { data, error } = await supabase.rpc("all_org_accounts_admin" as never);
  if (error) throw error;
  return ((data ?? []) as unknown[]).map(cast);
}

export async function loadContacts(orgIds: string[]): Promise<Record<string, OrgContact>> {
  if (orgIds.length === 0) return {};
  const { data } = await supabase.from("org_account_contacts").select("*").in("org_id", orgIds);
  const out: Record<string, OrgContact> = {};
  for (const c of (data ?? []) as OrgContact[]) out[c.org_id] = c;
  return out;
}

export type NewOrgInput = Partial<OrgAccount> & {
  account_type: AccountType;
  org_name: string;
  contact: {
    contact_name: string;
    contact_role?: string;
    contact_email: string;
    contact_phone?: string;
  };
};

export async function createOrg(userId: string, input: NewOrgInput): Promise<OrgAccount> {
  const { contact, ...listing } = input;
  const payload = {
    ...listing,
    user_id: userId,
    status: "pending_review" as const,
    premium: false,
    verified_at: null,
    // A .gov address is a baseline trust signal, so those go to the front of
    // the review queue — but they still need the same phone/hours call.
    priority_review: input.account_type === "government",
  };
  const { data, error } = await supabase
    .from("org_accounts")
    .insert(payload as never)
    .select(
      "id, user_id, account_type, org_name, status, published, premium, verified_at, created_at, updated_at",
    )
    .single();
  if (error) throw error;
  const org = cast(data);
  const { error: cErr } = await supabase.from("org_account_contacts").insert({
    org_id: org.id,
    user_id: userId,
    contact_name: contact.contact_name,
    contact_role: contact.contact_role ?? null,
    contact_email: contact.contact_email,
    contact_phone: contact.contact_phone ?? null,
  });
  if (cErr) throw cErr;
  return org;
}

/** Owners editing their listing re-open it for review; verified details reset. */
export async function updateOwnOrg(id: string, patch: Partial<OrgAccount>): Promise<void> {
  const { error } = await supabase
    .from("org_accounts")
    .update(patch as never)
    .eq("id", id);
  if (error) throw error;
}

export async function saveContact(c: OrgContact): Promise<void> {
  const { error } = await supabase
    .from("org_account_contacts")
    .upsert(c as never, { onConflict: "org_id" });
  if (error) throw error;
}

/* --- Admin ------------------------------------------------------- */

export async function setOrgStatus(id: string, status: OrgStatus, adminId: string): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (status === "verified") {
    patch.verified_at = new Date().toISOString();
    patch.verified_by = adminId;
  }
  if (status !== "verified") {
    patch.verified_at = null;
    patch.verified_by = null;
  }
  const { error } = await supabase
    .from("org_accounts")
    .update(patch as never)
    .eq("id", id);
  if (error) throw error;
}

export async function confirmFields(
  org: OrgAccount,
  fields: readonly string[],
  adminId: string,
): Promise<Record<string, string>> {
  const now = new Date().toISOString();
  const next = { ...(org.verified_fields ?? {}) };
  for (const f of fields) next[f] = now;
  const patch: Record<string, unknown> = { verified_fields: next, verified_by: adminId };
  // Whole listing confirmed = Tier 2.
  if (VERIFIABLE_FIELDS.every((f) => next[f])) {
    patch.status = "verified";
    patch.verified_at = now;
  }
  const { error } = await supabase
    .from("org_accounts")
    .update(patch as never)
    .eq("id", org.id);
  if (error) throw error;
  return next;
}

export async function setPremium(id: string, premium: boolean): Promise<void> {
  const { error } = await supabase
    .from("org_accounts")
    .update({ premium } as never)
    .eq("id", id);
  if (error) throw error;
}

/* --- Official updates -------------------------------------------- */

export async function loadOfficialUpdates(limit = 20): Promise<
  (OfficialUpdate & {
    org?: {
      org_name: string;
      office_name: string | null;
      status: OrgStatus;
      verified_at: string | null;
    };
  })[]
> {
  const { data, error } = await supabase
    .from("official_updates")
    .select("*, org:org_accounts(org_name, office_name, status, verified_at)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as never;
}

export async function postOfficialUpdate(
  orgId: string,
  userId: string,
  body: string,
): Promise<void> {
  const { error } = await supabase
    .from("official_updates")
    .insert({ org_id: orgId, user_id: userId, body: body.slice(0, 280) });
  if (error) throw error;
}

/* --- Photos (private bucket, signed URLs) ------------------------- */

export async function uploadOrgPhoto(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("org-logos").upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function orgPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from("org-logos").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

/* --- Free-tier event allowance ------------------------------------ */

export const FREE_TIER_EVENTS_PER_MONTH = 3;

export async function eventsThisMonth(userId: string): Promise<number> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("submitted_user_id", userId)
    .gte("created_at", start.toISOString());
  return count ?? 0;
}
