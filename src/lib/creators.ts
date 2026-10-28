/**
 * Creator Pages (MVP, invite-only).
 *
 * A creator curates listings that ALREADY exist in the app. Their note is a
 * personal recommendation and never a trust signal — verification stays with
 * the listing's own VerifiedPill.
 */
import { supabase } from "@/integrations/supabase/client";
import { RESOURCES } from "./data";
import { loadDirectory } from "./bronx-resources";
import { formatAddress } from "./bronx-to-resource";

export type CreatorSocials = { instagram?: string; tiktok?: string; youtube?: string };

export type Creator = {
  id: string;
  user_id: string | null;
  handle: string;
  display_name: string;
  bio: string | null;
  photo_url: string | null;
  socials: CreatorSocials;
  follower_count: number | null;
  active: boolean;
  created_at: string;
};

export type PickTargetType = "resource" | "bronx_resource" | "event" | "business";

export type CreatorPick = {
  id: string;
  creator_id: string;
  target_type: PickTargetType;
  target_id: string;
  target_name: string;
  target_category: string | null;
  note: string | null;
  position: number;
};

const CREATOR_COLS =
  "id,user_id,handle,display_name,bio,photo_url,socials,follower_count,active,created_at";

export async function listCreators(opts: { includeInactive?: boolean } = {}): Promise<Creator[]> {
  let q = supabase.from("creators").select(CREATOR_COLS).order("display_name");
  if (!opts.includeInactive) q = q.eq("active", true);
  const { data } = await q;
  return (data ?? []) as unknown as Creator[];
}

export async function getCreatorByHandle(handle: string): Promise<Creator | null> {
  const { data } = await supabase
    .from("creators")
    .select(CREATOR_COLS)
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  return (data as unknown as Creator) ?? null;
}

export async function getMyCreator(userId: string): Promise<Creator | null> {
  const { data } = await supabase
    .from("creators")
    .select(CREATOR_COLS)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as unknown as Creator) ?? null;
}

export async function listPicks(creatorId: string): Promise<CreatorPick[]> {
  const { data } = await supabase
    .from("creator_picks")
    .select("id,creator_id,target_type,target_id,target_name,target_category,note,position")
    .eq("creator_id", creatorId)
    .order("position");
  return (data ?? []) as unknown as CreatorPick[];
}

/** All creators who have featured a given listing (for the "Featured by" line). */
export async function featuredBy(targetId: string): Promise<{ creator: Creator; note: string | null }[]> {
  const { data } = await supabase
    .from("creator_picks")
    .select("note,creators!inner(" + CREATOR_COLS + ")")
    .eq("target_id", targetId);
  const rows = (data ?? []) as unknown as { note: string | null; creators: Creator }[];
  return rows.filter((r) => r.creators?.active).map((r) => ({ creator: r.creators, note: r.note }));
}

export async function addPick(input: {
  creatorId: string;
  targetType: PickTargetType;
  targetId: string;
  targetName: string;
  targetCategory?: string | null;
  note?: string;
  position?: number;
}) {
  return supabase.from("creator_picks").insert({
    creator_id: input.creatorId,
    target_type: input.targetType,
    target_id: input.targetId,
    target_name: input.targetName,
    target_category: input.targetCategory ?? null,
    note: (input.note ?? "").slice(0, 150) || null,
    position: input.position ?? 0,
  });
}

export async function updatePickNote(pickId: string, note: string) {
  return supabase.from("creator_picks").update({ note: note.slice(0, 150) || null }).eq("id", pickId);
}

export async function removePick(pickId: string) {
  return supabase.from("creator_picks").delete().eq("id", pickId);
}

/* --------------------------- admin (invite-only) -------------------------- */

export async function createCreator(input: {
  handle: string;
  display_name: string;
  bio?: string;
  photo_url?: string | null;
  socials?: CreatorSocials;
  follower_count?: number | null;
  contact_email?: string;
}) {
  const { data, error } = await supabase
    .from("creators")
    .insert({
      handle: input.handle.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      display_name: input.display_name,
      bio: (input.bio ?? "").slice(0, 200) || null,
      photo_url: input.photo_url ?? null,
      socials: input.socials ?? {},
      follower_count: input.follower_count ?? null,
      active: true,
    })
    .select("id")
    .maybeSingle();
  if (error || !data) return { error };
  if (input.contact_email) {
    await supabase
      .from("creator_contacts")
      .insert({ creator_id: (data as { id: string }).id, contact_email: input.contact_email });
  }
  return { id: (data as { id: string }).id };
}

export async function setCreatorActive(id: string, active: boolean) {
  return supabase.from("creators").update({ active }).eq("id", id);
}

/** Link an approved creator page to the signed-in account. */
export async function linkCreatorToUser(id: string, userId: string) {
  return supabase.from("creators").update({ user_id: userId }).eq("id", id);
}

/* ------------------------------- analytics ------------------------------- */

export async function trackCreatorView(creatorId: string) {
  try {
    await supabase.from("creator_events").insert({ creator_id: creatorId, kind: "page_view" });
  } catch {
    /* analytics must never break a page */
  }
}

export async function trackPickClick(creatorId: string, targetId: string, action: string) {
  try {
    await supabase
      .from("creator_events")
      .insert({ creator_id: creatorId, kind: "pick_click", target_id: targetId, action });
  } catch {
    /* ignore */
  }
}

export async function creatorStats(creatorId: string): Promise<{ views: number; clicks: number }> {
  const [views, clicks] = await Promise.all([
    supabase
      .from("creator_events")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", creatorId)
      .eq("kind", "page_view"),
    supabase
      .from("creator_events")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", creatorId)
      .eq("kind", "pick_click"),
  ]);
  return { views: views.count ?? 0, clicks: clicks.count ?? 0 };
}

/* --------------------------- pick search source --------------------------- */

export type PickCandidate = {
  target_type: PickTargetType;
  target_id: string;
  name: string;
  category: string | null;
  address: string;
};

/** Search listings that already exist — creators never create new listings. */
export async function searchListings(query: string, limit = 20): Promise<PickCandidate[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: PickCandidate[] = [];

  for (const r of RESOURCES) {
    if (r.name.en.toLowerCase().includes(q) || r.address.toLowerCase().includes(q)) {
      out.push({ target_type: "resource", target_id: r.id, name: r.name.en, category: r.category, address: r.address });
    }
  }

  const dir = await loadDirectory();
  for (const r of dir) {
    const hay = `${r.organization_name} ${r.address ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      out.push({
        target_type: "bronx_resource",
        target_id: r.id,
        name: r.organization_name,
        category: "food",
        address: formatAddress(r.address, r.zip_code),
      });
    }
  }

  const { data: events } = await supabase
    .from("events")
    .select("id,title,category,location")
    .ilike("title", `%${q}%`)
    .limit(10);
  for (const e of (events ?? []) as unknown as { id: string; title: string; category: string | null; location: string | null }[]) {
    out.push({ target_type: "event", target_id: e.id, name: e.title, category: e.category ?? "events", address: e.location ?? "" });
  }

  const { data: biz } = await supabase
    .from("businesses")
    .select("id,name,category,address")
    .ilike("name", `%${q}%`)
    .limit(10);
  for (const b of (biz ?? []) as unknown as { id: string; name: string; category: string | null; address: string | null }[]) {
    out.push({ target_type: "business", target_id: b.id, name: b.name, category: b.category, address: b.address ?? "" });
  }

  return out.slice(0, limit);
}
