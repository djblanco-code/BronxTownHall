import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RESOURCES, CATEGORIES } from "@/lib/data";
import { invalidateResourceMeta, loadResourceMeta, type ResourceMeta } from "@/lib/resource-meta";
import {
  freshnessOf,
  isVerified,
  verifyEveryDaysFor,
  verifiedAgoLabel,
  VERIFICATION_SHORT,
  type VerificationStatus,
} from "@/lib/verification";
import { Check, Loader2, Save, Search, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/** Current = a real verified status whose timestamp is still inside its cadence. */
function isCurrent(m: ResourceMeta | undefined, category: string): boolean {
  if (!m) return false;
  if (!isVerified(m.verification_status)) return false;
  return (
    freshnessOf(m.last_verified, m.verify_every_days ?? verifyEveryDaysFor(category)) !== "overdue"
  );
}

type Draft = { phone?: string; hours?: string; source?: string; source_url?: string };

/**
 * Content management without a code deploy.
 *
 * Every listing in the built-in catalog appears here; saving writes an override
 * row into `resources`. "Verify" stamps a real timestamp — the only way a
 * listing can ever claim to be verified.
 */
export function AdminResourcePanel() {
  const [meta, setMeta] = useState<Record<string, ResourceMeta>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [onlyStale, setOnlyStale] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    invalidateResourceMeta();
    setMeta(await loadResourceMeta(true));
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (cat && r.category !== cat) return false;
      if (term && !`${r.name.en} ${r.address}`.toLowerCase().includes(term)) return false;
      if (onlyStale) {
        const m = meta[r.id];
        if (isCurrent(meta[r.id], r.category)) return false;
      }
      return true;
    }).slice(0, 60);
  }, [q, cat, onlyStale, meta]);

  const upsert = async (id: string, patch: Record<string, unknown>) => {
    setBusy(id);
    const base = RESOURCES.find((r) => r.id === id)!;
    const { error } = await supabase.from("resources").upsert(
      {
        id,
        name: meta[id]?.name ?? base.name.en,
        category: meta[id]?.category ?? base.category,
        address: meta[id]?.address ?? base.address,
        verify_every_days: meta[id]?.verify_every_days ?? verifyEveryDaysFor(base.category),
        ...patch,
      } as never,
      { onConflict: "id" },
    );
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDrafts((d) => ({ ...d, [id]: {} }));
    await refresh();
  };

  const verifyNow = (id: string) =>
    upsert(id, {
      verification_status: "verified_by_bronx_app",
      last_verified: new Date().toISOString(),
    });

  const staleCount = RESOURCES.filter((r) => !isCurrent(meta[r.id], r.category)).length;

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Resources & verification
        </h2>
        <span className="text-xs font-semibold text-warning inline-flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" /> {staleCount} of {RESOURCES.length} need
          verification
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search listings"
            aria-label="Search listings"
            className="w-full ps-9 pe-3 py-2 rounded-lg border-2 border-border bg-background text-sm"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Filter by category"
          className="rounded-lg border-2 border-border bg-background text-sm px-3 py-2"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={onlyStale}
            onChange={(e) => setOnlyStale(e.target.checked)}
            className="h-4 w-4"
          />
          Needs verification only
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2 py-6 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading listings…
        </p>
      ) : (
        <div className="space-y-2 max-h-[560px] overflow-y-auto pe-1">
          {rows.map((r) => {
            const m = meta[r.id];
            const status = (m?.verification_status as VerificationStatus) ?? "needs_verification";
            const fresh = freshnessOf(
              m?.last_verified ?? null,
              m?.verify_every_days ?? verifyEveryDaysFor(r.category),
            );
            const current = isCurrent(m, r.category);
            const d = drafts[r.id] ?? {};
            return (
              <div key={r.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.name.en}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.category} · {r.address}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold ${current ? "text-success" : fresh === "never" ? "text-muted-foreground" : "text-warning"}`}
                  >
                    {VERIFICATION_SHORT[status]}
                    {m?.last_verified ? ` · ${verifiedAgoLabel(m.last_verified)}` : ""}
                  </span>
                </div>
                <div className="grid sm:grid-cols-4 gap-2 mt-2">
                  <input
                    value={d.phone ?? m?.phone ?? r.phone}
                    onChange={(e) =>
                      setDrafts((x) => ({ ...x, [r.id]: { ...d, phone: e.target.value } }))
                    }
                    aria-label={`Phone for ${r.name.en}`}
                    className="rounded-lg border border-border bg-background text-xs px-2 py-1.5"
                  />
                  <input
                    value={d.hours ?? m?.hours ?? r.hours.en}
                    onChange={(e) =>
                      setDrafts((x) => ({ ...x, [r.id]: { ...d, hours: e.target.value } }))
                    }
                    aria-label={`Hours for ${r.name.en}`}
                    className="rounded-lg border border-border bg-background text-xs px-2 py-1.5 sm:col-span-2"
                  />
                  <input
                    value={d.source ?? m?.source ?? ""}
                    placeholder="Source (e.g. called site)"
                    onChange={(e) =>
                      setDrafts((x) => ({ ...x, [r.id]: { ...d, source: e.target.value } }))
                    }
                    aria-label={`Source for ${r.name.en}`}
                    className="rounded-lg border border-border bg-background text-xs px-2 py-1.5"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => verifyNow(r.id)}
                    disabled={busy === r.id}
                    className="no-min-h inline-flex items-center gap-1.5 rounded-lg bg-success/15 text-success px-3 py-1.5 text-xs font-bold hover:bg-success/25 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Verified today
                  </button>
                  <button
                    onClick={() =>
                      upsert(r.id, {
                        phone: d.phone ?? m?.phone ?? r.phone,
                        hours: d.hours ?? m?.hours ?? r.hours.en,
                        source: d.source ?? m?.source ?? null,
                      })
                    }
                    disabled={busy === r.id}
                    className="no-min-h inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                  >
                    {busy === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}{" "}
                    Save
                  </button>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No listings match.</p>
          )}
        </div>
      )}
    </section>
  );
}
