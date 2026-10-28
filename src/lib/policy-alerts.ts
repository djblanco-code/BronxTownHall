import { supabase } from "@/integrations/supabase/client";

export type AlertKind = "policy" | "deadline";

export type PolicyAlert = {
  id: string;
  category: string;
  kind: AlertKind;
  headline: string;
  detail: string | null;
  source_url: string | null;
  source_label: string | null;
  deadline_date: string | null;
  published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
};

const SELECT =
  "id,category,kind,headline,detail,source_url,source_label,deadline_date,published,published_at,expires_at,created_at";

/** Published, unexpired alerts for one category (public read). */
export async function loadCategoryAlerts(category: string, limit = 5): Promise<PolicyAlert[]> {
  const { data, error } = await supabase
    .from("policy_alerts")
    .select(SELECT)
    .eq("category", category)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  const now = Date.now();
  return (data ?? []).filter(
    (a) => !a.expires_at || new Date(a.expires_at).getTime() > now,
  ) as PolicyAlert[];
}

/** Every alert, published or not — admin only (RLS enforced). */
export async function loadAllAlerts(): Promise<PolicyAlert[]> {
  const { data, error } = await supabase
    .from("policy_alerts")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as PolicyAlert[];
}

export type NewAlert = {
  category: string;
  kind: AlertKind;
  headline: string;
  detail?: string | null;
  source_url?: string | null;
  source_label?: string | null;
  deadline_date?: string | null;
  expires_at?: string | null;
};

export async function createAlert(input: NewAlert): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("policy_alerts").insert({
    ...input,
    detail: input.detail || null,
    source_url: input.source_url || null,
    source_label: input.source_label || null,
    deadline_date: input.deadline_date || null,
    expires_at: input.expires_at || null,
    created_by: auth.user?.id ?? null,
    published: false,
  });
  if (error) throw error;
}

export async function setAlertPublished(id: string, published: boolean): Promise<void> {
  const { error } = await supabase
    .from("policy_alerts")
    .update({ published, published_at: published ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from("policy_alerts").delete().eq("id", id);
  if (error) throw error;
}

/** One sentence, hard capped — enforced client-side and by a DB check constraint. */
export function headlineIssue(headline: string): string | null {
  const h = headline.trim();
  if (h.length < 3) return "Write a headline.";
  if (h.length > 160) return "Keep the headline under 160 characters.";
  if ((h.match(/[.!?](\s|$)/g) ?? []).length > 1)
    return "Keep it to one sentence — put detail in Read more.";
  return null;
}

export function formatDeadline(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ------------------------------ subscriptions ------------------------------ */

export type AlertChannel = "sms" | "email";

export async function subscribeToAlerts(input: {
  channel: AlertChannel;
  phone?: string;
  email?: string;
  categories: string[];
  language: string;
  zip?: string;
}): Promise<void> {
  const { error } = await supabase.from("alert_subscriptions").insert({
    channel: input.channel,
    phone: input.channel === "sms" ? normalizePhone(input.phone ?? "") : null,
    email: input.channel === "email" ? (input.email ?? "").trim().toLowerCase() : null,
    categories: input.categories,
    language: input.language,
    zip_code: input.zip || null,
    confirmed: false,
  });
  if (error) throw error;
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits ? `+${digits}` : "";
}

export function phoneIssue(raw: string): string | null {
  const p = normalizePhone(raw);
  return p.length >= 11 && p.length <= 16 ? null : "Enter a 10-digit US phone number.";
}

/**
 * Published, unexpired alerts across every category — public read, newest first.
 * Used by the weekly digest page; category pages keep using loadCategoryAlerts.
 */
export async function loadRecentPublishedAlerts(limit = 5): Promise<PolicyAlert[]> {
  const { data, error } = await supabase
    .from("policy_alerts")
    .select(SELECT)
    .eq("published", true)
    .order("deadline_date", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(50);
  if (error) return [];
  const now = Date.now();
  return ((data ?? []) as PolicyAlert[])
    .filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > now)
    .slice(0, limit);
}
