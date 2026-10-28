/**
 * Lightweight, contextual sponsorship.
 *
 * Deliberately simple: a placement is chosen by *where the visitor already is*
 * (homepage, or a category page) and nothing else. No ZIP code, no search
 * history, no saved favourites, no device profile is ever read here. That keeps
 * the product consistent with the public commitment: no surveillance ads.
 */
import { supabase } from "@/integrations/supabase/client";

export type AdPlacement = "homepage_banner" | "category_card";
export type AdInterest = "homepage_banner" | "sponsored_card" | "not_sure";

export type SponsoredPlacement = {
  id: string;
  placement: AdPlacement;
  category: string | null;
  sponsor_name: string;
  headline: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  priority: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type AdInquiry = {
  id: string;
  org_name: string;
  contact_name: string;
  contact_email: string;
  interest: AdInterest;
  budget_range: string | null;
  message: string | null;
  status: "new" | "contacted" | "closed";
  admin_notes: string | null;
  created_at: string;
};

export const INTEREST_OPTIONS: { id: AdInterest; label: string; desc: string }[] = [
  { id: "homepage_banner", label: "Homepage banner", desc: "One modest banner on the home screen." },
  { id: "sponsored_card", label: "Sponsored listing card", desc: "A clearly-labeled card inside a relevant category." },
  { id: "not_sure", label: "Not sure yet", desc: "Tell us what you're trying to reach and we'll suggest a fit." },
];

export function interestLabel(i: string): string {
  return INTEREST_OPTIONS.find((o) => o.id === i)?.label ?? "Not sure yet";
}

function withinWindow(p: SponsoredPlacement): boolean {
  const now = Date.now();
  if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
  if (p.ends_at && new Date(p.ends_at).getTime() < now) return false;
  return true;
}

/**
 * Fetch at most ONE active placement for a context.
 * `category` is only used for `category_card`; the homepage banner is global.
 */
export async function loadPlacement(
  placement: AdPlacement,
  category?: string | null,
): Promise<SponsoredPlacement | null> {
  let q = supabase
    .from("sponsored_placements")
    .select("*")
    .eq("placement", placement)
    .eq("active", true)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(5);

  if (placement === "category_card") {
    if (!category) return null;
    q = q.eq("category", category);
  }

  const { data, error } = await q;
  if (error || !data) return null;
  const rows = (data as unknown as SponsoredPlacement[]).filter(withinWindow);
  return rows[0] ?? null;
}

export async function loadAllPlacements(): Promise<SponsoredPlacement[]> {
  const { data, error } = await supabase
    .from("sponsored_placements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as SponsoredPlacement[];
}

export async function setPlacementActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from("sponsored_placements").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePlacement(id: string): Promise<void> {
  const { error } = await supabase.from("sponsored_placements").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createPlacement(input: {
  placement: AdPlacement;
  category: string | null;
  sponsor_name: string;
  headline: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
}): Promise<void> {
  const { error } = await supabase.from("sponsored_placements").insert(input as never);
  if (error) throw new Error(error.message);
}

export async function submitAdInquiry(input: {
  org_name: string;
  contact_name: string;
  contact_email: string;
  interest: AdInterest;
  budget_range?: string | null;
  message?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("ad_inquiries").insert({
    org_name: input.org_name,
    contact_name: input.contact_name,
    contact_email: input.contact_email.toLowerCase(),
    interest: input.interest,
    budget_range: input.budget_range || null,
    message: input.message || null,
  } as never);
  if (error) throw new Error(error.message);
}

export async function loadAdInquiries(): Promise<AdInquiry[]> {
  const { data, error } = await supabase
    .from("ad_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as AdInquiry[];
}

export async function setInquiryStatus(id: string, status: AdInquiry["status"]): Promise<void> {
  const { error } = await supabase.from("ad_inquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}
