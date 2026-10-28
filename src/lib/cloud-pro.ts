import { supabase } from "@/integrations/supabase/client";

export type ProProfile = {
  user_id: string;
  org_name: string;
  role_title: string | null;
  org_type: string | null;
  bio: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Referral = {
  id: string;
  pro_user_id: string;
  resource_id: string;
  client_label: string | null;
  status: "pending" | "completed" | "unsuccessful";
  note: string | null;
  referred_at: string;
  updated_at: string;
};

export async function fetchMyProProfile(): Promise<ProProfile | null> {
  const { data } = await supabase.from("pro_profiles").select("*").maybeSingle();
  return (data as ProProfile) ?? null;
}

export async function upsertProProfile(input: Partial<ProProfile> & { org_name: string }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("pro_profiles")
    .upsert({
      user_id: u.user.id,
      org_name: input.org_name,
      role_title: input.role_title ?? null,
      org_type: input.org_type ?? null,
      bio: input.bio ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ProProfile;
}

export async function fetchMyReferrals(): Promise<Referral[]> {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .order("referred_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Referral[];
}

export async function logReferral(input: {
  resource_id: string;
  client_label?: string;
  status?: Referral["status"];
  note?: string;
}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      pro_user_id: u.user.id,
      resource_id: input.resource_id,
      client_label: input.client_label ?? null,
      status: input.status ?? "pending",
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Referral;
}

export async function updateReferralStatus(id: string, status: Referral["status"]) {
  const { error } = await supabase.from("referrals").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteReferral(id: string) {
  const { error } = await supabase.from("referrals").delete().eq("id", id);
  if (error) throw error;
}
