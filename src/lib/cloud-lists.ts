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

export async function fetchMyLists(): Promise<List[]> {
  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as List[];
}

export async function fetchListBySlug(slug: string): Promise<{ list: List; items: ListItem[] } | null> {
  const { data: list, error } = await supabase
    .from("lists")
    .select("*")
    .eq("share_slug", slug)
    .maybeSingle();
  if (error || !list) return null;
  const { data: items } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", list.id)
    .order("position", { ascending: true });
  return { list: list as List, items: (items ?? []) as ListItem[] };
}

export async function fetchListWithItems(id: string): Promise<{ list: List; items: ListItem[] } | null> {
  const { data: list, error } = await supabase.from("lists").select("*").eq("id", id).maybeSingle();
  if (error || !list) return null;
  const { data: items } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", id)
    .order("position", { ascending: true });
  return { list: list as List, items: (items ?? []) as ListItem[] };
}

export async function createList(input: { name: string; description?: string; is_public?: boolean }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("lists")
    .insert({ user_id: u.user.id, name: input.name, description: input.description ?? null, is_public: input.is_public ?? false })
    .select()
    .single();
  if (error) throw error;
  return data as List;
}

export async function updateList(id: string, patch: Partial<Pick<List, "name" | "description" | "is_public">>) {
  const { error } = await supabase.from("lists").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteList(id: string) {
  const { error } = await supabase.from("lists").delete().eq("id", id);
  if (error) throw error;
}

export async function addToList(listId: string, resourceId: string, note?: string) {
  const { error } = await supabase
    .from("list_items")
    .upsert({ list_id: listId, resource_id: resourceId, note: note ?? null }, { onConflict: "list_id,resource_id" });
  if (error) throw error;
}

export async function removeFromList(listId: string, resourceId: string) {
  const { error } = await supabase
    .from("list_items")
    .delete()
    .eq("list_id", listId)
    .eq("resource_id", resourceId);
  if (error) throw error;
}
