// Local-storage queue of user suggestions: edits to existing resources OR new submissions.
const KEY = "bronx.suggestions";

export type Suggestion = {
  id: string;
  kind: "edit" | "new";
  resourceId?: string;     // present when kind === "edit"
  fields: {
    name?: string;
    address?: string;
    phone?: string;
    category?: string;
    description?: string;
    note?: string;
  };
  createdAt: number;
  status: "pending" | "approved" | "rejected";
};

function read(): Suggestion[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
function write(list: Suggestion[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("bronx:suggestions"));
}

export function listSuggestions(): Suggestion[] { return read(); }
export function addSuggestion(s: Omit<Suggestion, "id" | "createdAt" | "status">) {
  const next: Suggestion = { ...s, id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now(), status: "pending" };
  write([next, ...read()]);
  return next;
}
export function setSuggestionStatus(id: string, status: Suggestion["status"]) {
  write(read().map((s) => s.id === id ? { ...s, status } : s));
}
export function clearSuggestions() { write([]); }
