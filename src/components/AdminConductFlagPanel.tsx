import { useEffect, useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Flag = {
  id: string;
  resource_id: string;
  resource_name: string | null;
  resource_type: string;
  category: string | null;
  concern: string;
  details: string;
  happened_on: string | null;
  money_involved: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  willing_to_talk: boolean;
  status: string;
  admin_notes: string | null;
  reviewed_at?: string | null;
  created_at: string;
};

const STATUSES = [
  { id: "new", label: "New" },
  { id: "reviewing", label: "Under review" },
  { id: "action_taken", label: "Action taken" },
  { id: "dismissed", label: "Dismissed" },
] as const;

const CONCERN_LABELS: Record<string, string> = {
  unlicensed: "Posing as licensed professional",
  predatory_pricing: "Predatory pricing / hidden fees",
  fraud: "Took money, no service",
  immigration_scam: "Unauthorized immigration help",
  discrimination: "Discrimination",
  unsafe: "Unsafe or harmful",
  other: "Other serious concern",
};

/** Admin-only queue for serious conduct flags, kept separate from the
 *  edit-suggestion / incorrect-info queue. Nothing here is public. */
export function AdminConductFlagPanel() {
  const [rows, setRows] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("open");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("conduct_flags")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((data ?? []) as Flag[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const update = async (id: string, patch: Partial<Flag>) => {
    setBusy(id);
    const { error } = await supabase
      .from("conduct_flags")
      .update(patch as never)
      .eq("id", id);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Flag updated.");
    void load();
  };

  const visible = rows.filter((r) =>
    filter === "all"
      ? true
      : filter === "open"
        ? r.status === "new" || r.status === "reviewing"
        : r.status === filter,
  );
  const openCount = rows.filter((r) => r.status === "new" || r.status === "reviewing").length;

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
          Conduct flags
          {openCount > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
              {openCount} open
            </span>
          )}
        </h2>
        <label className="text-xs font-semibold flex items-center gap-2">
          Show
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter conduct flags"
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
          >
            <option value="open">Open</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
            <option value="all">All</option>
          </select>
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        Serious concerns about a business misleading or exploiting people. Separate from
        incorrect-info reports and edit suggestions. These never change a listing or its
        verification badge automatically, and are never shown publicly. Review each one deliberately
        before taking action.
      </p>

      {loading ? (
        <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading flags…
        </p>
      ) : visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No flags to review.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <li key={r.id} className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                  {CONCERN_LABELS[r.concern] ?? r.concern}
                </span>
                <span className="text-sm font-bold">{r.resource_name || r.resource_id}</span>
                <span className="text-xs text-muted-foreground">
                  {r.resource_type}
                  {r.category ? ` · ${r.category}` : ""}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold">
                  {STATUSES.find((s) => s.id === r.status)?.label ?? r.status}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm">{r.details}</p>

              <p className="text-xs text-muted-foreground">
                {r.happened_on ? `Happened ${r.happened_on}. ` : ""}
                {r.money_involved ? `Money: ${r.money_involved}. ` : ""}
                {r.reporter_name || r.reporter_email || r.reporter_phone
                  ? `Reporter: ${[r.reporter_name, r.reporter_email, r.reporter_phone].filter(Boolean).join(" · ")}${r.willing_to_talk ? " (open to contact)" : ""}`
                  : "Reporter left no contact details."}
              </p>

              <textarea
                rows={2}
                value={notes[r.id] ?? r.admin_notes ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                placeholder="Review notes — what you checked, who you spoke to, what you decided"
                aria-label={`Review notes for ${r.resource_name || r.resource_id}`}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    update(r.id, { admin_notes: notes[r.id] ?? r.admin_notes ?? null })
                  }
                  disabled={busy === r.id}
                  className="no-min-h rounded-lg border-2 border-border px-3 py-1.5 text-xs font-bold hover:bg-muted disabled:opacity-50"
                >
                  Save notes
                </button>
                {STATUSES.filter((s) => s.id !== r.status).map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      update(r.id, {
                        status: s.id,
                        admin_notes: notes[r.id] ?? r.admin_notes ?? null,
                        reviewed_at: new Date().toISOString(),
                      })
                    }
                    disabled={busy === r.id}
                    className="no-min-h rounded-lg border-2 border-border px-3 py-1.5 text-xs font-bold hover:bg-muted disabled:opacity-50"
                  >
                    Mark {s.label.toLowerCase()}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
