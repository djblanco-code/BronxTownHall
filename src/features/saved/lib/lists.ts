import { supabase } from "@/integrations/supabase/client";

export type List = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_slug: string;
  created_at: string;
  updated_at: string;
};

export type ListItem = {
  id: string;
  list_id: string;
  resource_id: string;
  note: string | null;
  position: number;
  created_at: string;
};

/** A public list as seen through its share link: no owner, no ids. */
export type SharedList = {
  name: string;
  description: string | null;
  share_slug: string;
  items: { resource_id: string; note: string | null; position: number }[];
};

/** Throws when a write matched no rows (RLS hides other people's lists). */
function requireRow(data: unknown[] | null) {
  if (!data || data.length === 0) throw new Error("not_found");
}

export async function fetchMyLists(): Promise<List[]> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return [];
  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .eq("user_id", u.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as List[];
}

export async function fetchListBySlug(slug: string): Promise<SharedList | null> {
  const { data, error } = await supabase.rpc("shared_list" as never, { _slug: slug } as never);
  if (error) throw error;
  return (data as SharedList | null) ?? null;
}

export async function fetchListWithItems(
  id: string,
): Promise<{ list: List; items: ListItem[] } | null> {
  const { data: list, error } = await supabase.from("lists").select("*").eq("id", id).maybeSingle();
  if (error || !list) return null;
  const { data: items } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", id)
    .order("position", { ascending: true });
  return { list: list as List, items: (items ?? []) as ListItem[] };
}

export async function createList(input: {
  name: string;
  description?: string;
  is_public?: boolean;
}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("lists")
    .insert({
      user_id: u.user.id,
      name: input.name,
      description: input.description ?? null,
      is_public: input.is_public ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as List;
}

export async function updateList(
  id: string,
  patch: Partial<Pick<List, "name" | "description" | "is_public">>,
) {
  const { data, error } = await supabase.from("lists").update(patch).eq("id", id).select("id");
  if (error) throw error;
  requireRow(data);
}

export async function deleteList(id: string) {
  const { data, error } = await supabase.from("lists").delete().eq("id", id).select("id");
  if (error) throw error;
  requireRow(data);
}

export async function addToList(listId: string, resourceId: string, note?: string) {
  const { error } = await supabase
    .from("list_items")
    .upsert(
      { list_id: listId, resource_id: resourceId, note: note ?? null },
      { onConflict: "list_id,resource_id" },
    );
  if (error) throw error;
}

export async function removeFromList(listId: string, resourceId: string) {
  const { data, error } = await supabase
    .from("list_items")
    .delete()
    .eq("list_id", listId)
    .eq("resource_id", resourceId)
    .select("id");
  if (error) throw error;
  requireRow(data);
}
