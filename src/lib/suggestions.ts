// Resident suggestions ("Suggest a resource", "Suggest an edit"). They go to
// the resource_requests table, where staff see them in the admin review queue.
import { supabase } from "@/integrations/supabase/client";

export type SuggestionFields = {
  name?: string;
  address?: string;
  phone?: string;
  category?: string;
  description?: string;
  note?: string;
};

export async function submitSuggestion({
  kind,
  resourceId,
  fields,
}: {
  kind: "edit" | "new";
  resourceId?: string;
  fields: SuggestionFields;
}) {
  const name = (fields.name ?? "").trim().slice(0, 200) || "(no name)";
  const need = kind === "edit" ? `Edit: ${name}` : `New: ${name}`;
  const note = [
    kind === "edit" && resourceId ? `Listing id: ${resourceId}` : "",
    fields.address ? `Address: ${fields.address}` : "",
    fields.phone ? `Phone: ${fields.phone}` : "",
    fields.description ? `Details: ${fields.description}` : "",
    fields.note ? `Note: ${fields.note}` : "",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 2000);
  const { data } = await supabase.auth.getSession();
  const { error } = await supabase.from("resource_requests").insert({
    need,
    category: fields.category?.slice(0, 40) || null,
    note: note || null,
    user_id: data.session?.user.id ?? null,
  });
  if (error) throw error;
}
