import { supabase } from "@/integrations/supabase/client";

export type LegalRequestStatus = "new" | "contacted" | "scheduled" | "completed" | "closed";
export type LegalTopic = "contract_review" | "llc_questions" | "lease_review" | "employment" | "intellectual_property" | "other";

export type LegalConsultationRequest = {
  id: string;
  org_id: string;
  user_id: string;
  business_name: string;
  topic: LegalTopic;
  topic_details: string | null;
  preferred_contact: "email" | "phone";
  contact_email: string | null;
  contact_phone: string | null;
  status: LegalRequestStatus;
  admin_notes: string | null;
  created_at: string;
};

export type HiringPostStatus = "draft" | "published" | "closed";
export type HiringPost = {
  id: string;
  org_id: string;
  user_id: string;
  employer_name: string;
  role_title: string;
  description: string;
  application_method: string;
  bronx_preferred: boolean;
  fair_chance_employer: boolean;
  status: HiringPostStatus;
  created_at: string;
  updated_at: string;
};

export const LEGAL_TOPICS: { value: LegalTopic; label: string }[] = [
  { value: "contract_review", label: "Contract review" },
  { value: "llc_questions", label: "LLC questions" },
  { value: "lease_review", label: "Lease review" },
  { value: "employment", label: "Employment questions" },
  { value: "intellectual_property", label: "Trademark or intellectual property" },
  { value: "other", label: "Other business legal question" },
];

export async function createLegalRequest(input: Omit<LegalConsultationRequest, "id" | "status" | "admin_notes" | "created_at">) {
  const { error } = await supabase.from("legal_consultation_requests").insert(input);
  if (error) throw error;
}

export async function loadLegalRequests() {
  const { data, error } = await supabase.from("legal_consultation_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LegalConsultationRequest[];
}

export async function updateLegalRequest(id: string, patch: Pick<Partial<LegalConsultationRequest>, "status" | "admin_notes">) {
  const { error } = await supabase.from("legal_consultation_requests").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createHiringPost(input: Omit<HiringPost, "id" | "created_at" | "updated_at">) {
  const { error } = await supabase.from("business_hiring_posts").insert(input);
  if (error) throw error;
}

export async function loadHiringPosts(orgId?: string) {
  let query = supabase.from("business_hiring_posts").select("*").order("created_at", { ascending: false });
  if (orgId) query = query.eq("org_id", orgId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as HiringPost[];
}

export async function updateHiringPost(id: string, patch: Pick<Partial<HiringPost>, "role_title" | "description" | "application_method" | "bronx_preferred" | "status">) {
  const { error } = await supabase.from("business_hiring_posts").update(patch).eq("id", id);
  if (error) throw error;
}

export function hiringActionHref(value: string) {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  const digits = v.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 7 ? `tel:${digits}` : null;
}