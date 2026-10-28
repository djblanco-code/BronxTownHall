import { actionLinkFlag } from "@/lib/how-to-apply";
import { topCategoryFor } from "@/lib/bronx-to-resource";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BRONX_VERIFICATION_LABELS,
  SOURCES,
  SOURCE_IDS,
  type BronxResource,
  type BronxResourceSource,
  type BronxVerificationStatus,
  type IngestResult,
  type ResourceCategoryRow,
  type SourceId,
  findLikelyDuplicates,
  ingestRecords,
  loadCategories,
  loadDirectory,
  loadSourcesFor,
  markVerified,
  mergeResources,
  parseCSV,
  parseJSONRows,
  toCSV,
  verifiedAgo,
} from "@/lib/bronx-resources";
import { AlertTriangle, Check, Database, Download, Loader2, Merge, Plus, Save, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";

type ImportRow = { id: string; created_at: string; source: string; format: string; filename: string | null; rows_received: number; rows_created: number; rows_updated: number; rows_merged: number; rows_skipped_non_bronx: number };

const BLANK = {
  organization_name: "",
  resource_name: "",
  resource_category: "food_pantry",
  address: "",
  zip_code: "",
  phone: "",
  email: "",
  website: "",
  application_url: "",
  how_to_apply: "",
  hours: "",
  eligibility: "",
  description: "",
};

/**
 * Admin control room for the Bronx master resource database.
 *
 * Import (CSV/JSON) -> normalize -> Bronx filter -> dedupe/merge -> verify.
 * Every write goes through `src/lib/bronx-resources.ts` so the pipeline is
 * identical no matter which source the data came from.
 */
export function AdminBronxDataPanel() {
  const [rows, setRows] = useState<BronxResource[]>([]);
  const [cats, setCats] = useState<ResourceCategoryRow[]>([]);
  const [srcMap, setSrcMap] = useState<Record<string, BronxResourceSource[]>>({});
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [source, setSource] = useState<SourceId>("nyc_food_help");
  const [fallbackCat, setFallbackCat] = useState("food_pantry");
  const [paste, setPaste] = useState("");
  const [result, setResult] = useState<IngestResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<Record<string, Partial<BronxResource>>>({});
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({ ...BLANK });
  const [mergePick, setMergePick] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [list, categories] = await Promise.all([loadDirectory({ includeInactive: true }), loadCategories()]);
    setRows(list);
    setCats(categories);
    setSrcMap(await loadSourcesFor(list.map((r) => r.id)));
    const { data } = await supabase
      .from("bronx_resource_imports")
      .select("id,created_at,source,format,filename,rows_received,rows_created,rows_updated,rows_merged,rows_skipped_non_bronx")
      .order("created_at", { ascending: false })
      .limit(8);
    setImports((data ?? []) as unknown as ImportRow[]);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const activeCats = cats.filter((c) => c.active);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (!showInactive && (!r.active || r.merged_into)) return false;
      if (cat && r.resource_category !== cat) return false;
      if (status && r.verification_status !== status) return false;
      if (term && !`${r.organization_name} ${r.resource_name ?? ""} ${r.address ?? ""} ${r.zip_code ?? ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, q, cat, status, showInactive]);

  const dupes = useMemo(() => findLikelyDuplicates(rows.filter((r) => r.active && !r.merged_into)), [rows]);

  const runImport = async (text: string, format: "csv" | "json", filename?: string) => {
    if (!text.trim()) { toast.error("Nothing to import."); return; }
    setBusy("import");
    try {
      const parsed = format === "csv" ? parseCSV(text) : parseJSONRows(text);
      if (parsed.length === 0) { toast.error("No rows found in that file."); return; }
      const res = await ingestRecords(parsed as Record<string, unknown>[], source, fallbackCat, { format, filename });
      setResult(res);
      toast.success(`${res.created} added · ${res.updated} updated · ${res.merged} merged · ${res.skippedNonBronx} non-Bronx skipped`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setBusy(null);
    }
  };

  const onFile = async (file: File) => {
    const text = await file.text();
    const format = file.name.toLowerCase().endsWith(".json") ? "json" : "csv";
    await runImport(text, format, file.name);
  };

  const saveRow = async (id: string) => {
    const patch = draft[id];
    if (!patch || Object.keys(patch).length === 0) return;
    setBusy(id);
    const { error } = await supabase.from("bronx_resources").update(patch as never).eq("id", id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    setDraft((d) => ({ ...d, [id]: {} }));
    toast.success("Listing updated.");
    await refresh();
  };

  const verify = async (id: string) => {
    setBusy(id);
    const err = await markVerified(id, "manual", null);
    setBusy(null);
    if (err) { toast.error(err); return; }
    toast.success("Marked verified today.");
    await refresh();
  };

  const setStatusOf = async (id: string, next: BronxVerificationStatus) => {
    setBusy(id);
    const { error } = await supabase.from("bronx_resources").update({ verification_status: next } as never).eq("id", id);
    setBusy(null);
    if (error) toast.error(error.message);
    else await refresh();
  };

  /** Clears the import flag and publishes — verification status is untouched. */
  const resolveReview = async (id: string) => {
    setBusy(id);
    const { error } = await supabase
      .from("bronx_resources")
      .update({ needs_review: false, active: true } as never)
      .eq("id", id);
    setBusy(null);
    if (error) toast.error(error.message);
    else { toast.success("Marked reviewed and published."); await refresh(); }
  };

  const toggleActive = async (r: BronxResource) => {
    setBusy(r.id);
    const { error } = await supabase.from("bronx_resources").update({ active: !r.active } as never).eq("id", r.id);
    setBusy(null);
    if (error) toast.error(error.message);
    else { toast.success(r.active ? "Deactivated." : "Reactivated."); await refresh(); }
  };

  const doMerge = async (loser: string, winner: string) => {
    setBusy(loser);
    const err = await mergeResources(loser, winner);
    setBusy(null);
    setMergePick(null);
    if (err) { toast.error(err); return; }
    toast.success("Merged — source references preserved.");
    await refresh();
  };

  const addManual = async () => {
    if (!newRow.organization_name.trim()) { toast.error("Organization name is required."); return; }
    setBusy("add");
    const { error } = await supabase.from("bronx_resources").insert({
      ...Object.fromEntries(Object.entries(newRow).map(([k, v]) => [k, String(v).trim() === "" ? null : v])),
      organization_name: newRow.organization_name.trim(),
      resource_category: newRow.resource_category,
      borough: "Bronx",
      source: "bronx_app_manual",
      verification_status: "needs_verification",
      dedupe_key: `${newRow.organization_name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}|${(newRow.address || "").toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    } as never);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    setNewRow({ ...BLANK });
    setAdding(false);
    toast.success("Listing added.");
    await refresh();
  };

  const exportAll = () => {
    const csv = toCSV(rows.map((r) => ({
      id: r.id, organization_name: r.organization_name, resource_name: r.resource_name,
      resource_category: r.resource_category, resource_subcategory: r.resource_subcategory,
      address: r.address, borough: r.borough, neighborhood: r.neighborhood, zip_code: r.zip_code,
      phone: r.phone, email: r.email, website: r.website, hours: r.hours, eligibility: r.eligibility,
      languages: r.languages, description: r.description, latitude: r.latitude, longitude: r.longitude,
      sources: (srcMap[r.id] ?? []).map((s) => s.source_label).join("; ") || r.source,
      source_url: r.source_url, source_record_id: r.source_record_id,
      last_verified: r.last_verified, verification_status: r.verification_status, active: r.active,
      created_at: r.created_at, updated_at: r.updated_at,
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bronx_master_resources_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const needsVerification = rows.filter((r) => r.active && !r.merged_into && r.verification_status !== "verified").length;

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4 space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" /> Bronx master resource database
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-warning inline-flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {needsVerification} of {rows.filter((r) => r.active && !r.merged_into).length} need verification
          </span>
          <button onClick={exportAll} className="no-min-h inline-flex items-center gap-1.5 rounded-lg border-2 border-border px-3 py-1.5 text-xs font-bold hover:bg-muted">
            <Download className="h-3.5 w-3.5" /> Export master CSV
          </button>
        </div>
      </div>

      {/* ---------------- Import ---------------- */}
      <div className="rounded-xl border border-border p-3 space-y-2">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Upload className="h-4 w-4" /> Import from a source</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="text-xs font-semibold space-y-1">
            Source
            <select value={source} onChange={(e) => setSource(e.target.value as SourceId)} className="w-full rounded-lg border-2 border-border bg-background text-sm px-2 py-2 font-normal">
              {SOURCE_IDS.map((id) => <option key={id} value={id}>{SOURCES[id].label}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold space-y-1">
            Category when the file doesn&apos;t say
            <select value={fallbackCat} onChange={(e) => setFallbackCat(e.target.value)} className="w-full rounded-lg border-2 border-border bg-background text-sm px-2 py-2 font-normal">
              {activeCats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          {SOURCES[source].access}
          {SOURCES[source].url ? <> · <a href={SOURCES[source].url} target="_blank" rel="noreferrer" className="text-primary underline">view source</a></> : null}
        </p>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={4}
          placeholder="Paste CSV or JSON rows here, or choose a file below"
          aria-label="Paste CSV or JSON"
          className="w-full rounded-lg border-2 border-border bg-background text-xs font-mono px-2 py-2"
        />
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => runImport(paste, paste.trim().startsWith("[") || paste.trim().startsWith("{") ? "json" : "csv")}
            disabled={busy === "import"}
            className="no-min-h inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold disabled:opacity-50"
          >
            {busy === "import" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Import pasted data
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            aria-label="Import CSV or JSON file"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); e.target.value = ""; }}
            className="text-xs"
          />
        </div>
        {result && (
          <p className="text-xs font-semibold">
            {result.received} rows read · <span className="text-success">{result.created} new</span> · {result.updated} updated ·{" "}
            {result.merged} duplicates merged · {result.skippedNonBronx} outside the Bronx skipped · {result.skippedInvalid} unusable
            {result.errors.length > 0 && <span className="block text-destructive font-normal mt-1">{result.errors[0]}</span>}
          </p>
        )}
        {imports.length > 0 && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer font-semibold">Recent imports</summary>
            <ul className="mt-1 space-y-0.5">
              {imports.map((i) => (
                <li key={i.id}>
                  {new Date(i.created_at).toLocaleString()} — {SOURCES[i.source as SourceId]?.label ?? i.source} ({i.format}):{" "}
                  {i.rows_created} new, {i.rows_updated} updated, {i.rows_merged} merged, {i.rows_skipped_non_bronx} non-Bronx
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* ---------------- Duplicate review ---------------- */}
      {dupes.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-3 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><Merge className="h-4 w-4" /> Possible duplicates ({dupes.length})</h3>
          {dupes.slice(0, 8).map(([a, b]) => (
            <div key={`${a.id}${b.id}`} className="text-xs flex flex-wrap items-center gap-2 border-b border-border/60 pb-1.5">
              <span className="font-semibold">{a.organization_name}</span>
              <span className="text-muted-foreground">{a.address ?? "no address"}</span>
              <span aria-hidden>↔</span>
              <span className="font-semibold">{b.organization_name}</span>
              <span className="text-muted-foreground">{b.address ?? "no address"}</span>
              <button onClick={() => doMerge(b.id, a.id)} className="no-min-h rounded-lg bg-primary text-primary-foreground px-2 py-1 font-bold">Keep first</button>
              <button onClick={() => doMerge(a.id, b.id)} className="no-min-h rounded-lg border border-border px-2 py-1 font-bold">Keep second</button>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- Filters ---------------- */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search master database" aria-label="Search master database" className="w-full ps-9 pe-3 py-2 rounded-lg border-2 border-border bg-background text-sm" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category" className="rounded-lg border-2 border-border bg-background text-sm px-3 py-2">
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by verification status" className="rounded-lg border-2 border-border bg-background text-sm px-3 py-2">
          <option value="">Any status</option>
          {Object.entries(BRONX_VERIFICATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="h-4 w-4" />
          Show inactive / merged
        </label>
        <button onClick={() => setAdding((v) => !v)} className="no-min-h inline-flex items-center gap-1.5 rounded-lg border-2 border-border px-3 py-2 text-sm font-bold hover:bg-muted">
          <Plus className="h-4 w-4" /> Add manually
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-border p-3 grid sm:grid-cols-3 gap-2">
          {(["organization_name", "resource_name", "address", "zip_code", "phone", "email", "website", "how_to_apply", "hours", "eligibility", "description"] as const).map((f) => (
            <input
              key={f}
              value={newRow[f]}
              onChange={(e) => setNewRow((n) => ({ ...n, [f]: e.target.value }))}
              placeholder={f === "how_to_apply" ? "How to Apply — link or phone" : f.replace(/_/g, " ")}
              aria-label={f === "how_to_apply" ? "How to apply link or phone" : f.replace(/_/g, " ")}
              className="rounded-lg border border-border bg-background text-xs px-2 py-1.5"
            />
          ))}
          <select value={newRow.resource_category} onChange={(e) => setNewRow((n) => ({ ...n, resource_category: e.target.value }))} aria-label="Category" className="rounded-lg border border-border bg-background text-xs px-2 py-1.5">
            {activeCats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <button onClick={addManual} disabled={busy === "add"} className="no-min-h rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold disabled:opacity-50">Save listing</button>
        </div>
      )}

      {/* ---------------- Listings ---------------- */}
      {loading ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2 py-6 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading master database…
        </p>
      ) : (
        <div className="space-y-2 max-h-[640px] overflow-y-auto pe-1">
          {filtered.map((r) => {
            const d = draft[r.id] ?? {};
            const srcs = srcMap[r.id] ?? [];
            const set = (patch: Partial<BronxResource>) => setDraft((x) => ({ ...x, [r.id]: { ...d, ...patch } }));
            return (
              <div key={r.id} className={`rounded-xl border p-3 ${r.active && !r.merged_into ? "border-border" : "border-dashed border-muted-foreground/40 opacity-70"}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.organization_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cats.find((c) => c.id === r.resource_category)?.label ?? r.resource_category} · {r.address ?? "No address on file"} {r.zip_code ?? ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Sources: {srcs.length ? srcs.map((s) => s.source_label).join(" • ") : (SOURCES[r.source as SourceId]?.label ?? "Manual entry")}
                      {r.source_url ? <> · <a href={r.source_url} target="_blank" rel="noreferrer" className="text-primary underline">original</a></> : null}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold ${r.verification_status === "verified" ? "text-success" : "text-warning"}`}>
                      {BRONX_VERIFICATION_LABELS[r.verification_status]} · {verifiedAgo(r.last_verified)}
                    </span>
                    {(() => {
                      const flag = actionLinkFlag(
                        topCategoryFor((d.resource_category as string | undefined) ?? r.resource_category),
                        (d.how_to_apply as string | undefined) ?? r.how_to_apply,
                      );
                      return flag ? (
                        <span className="text-[11px] font-semibold text-warning bg-warning/10 rounded-full px-2 py-0.5">
                          {flag}
                        </span>
                      ) : null;
                    })()}
                    {r.needs_review ? (
                      <span className="text-[11px] font-semibold text-warning bg-warning/10 rounded-full px-2 py-0.5">
                        Needs review
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Bulk-import flags are surfaced, never auto-resolved: an admin
                    decides what the right value is before the listing goes live. */}
                {r.needs_review && r.review_note ? (
                  <div className="mt-2 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-2">
                    <p className="text-[11px] font-bold text-warning-foreground">Flagged during import — resolve before publishing</p>
                    <p className="text-xs text-warning-foreground mt-0.5">{r.review_note}</p>
                    <button
                      type="button"
                      onClick={() => void resolveReview(r.id)}
                      className="mt-2 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-semibold"
                    >
                      Mark reviewed &amp; publish
                    </button>
                  </div>
                ) : null}


                <div className="grid sm:grid-cols-4 gap-2 mt-2">
                  <input value={d.phone ?? r.phone ?? ""} placeholder="Phone" onChange={(e) => set({ phone: e.target.value })} aria-label={`Phone for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5" />
                  <input value={d.hours ?? r.hours ?? ""} placeholder="Hours" onChange={(e) => set({ hours: e.target.value })} aria-label={`Hours for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5 sm:col-span-2" />
                  <input value={d.website ?? r.website ?? ""} placeholder="Website" onChange={(e) => set({ website: e.target.value })} aria-label={`Website for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5" />
                  <input value={d.eligibility ?? r.eligibility ?? ""} placeholder="Eligibility" onChange={(e) => set({ eligibility: e.target.value })} aria-label={`Eligibility for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5 sm:col-span-2" />
                  <input value={(d.how_to_apply as string | undefined) ?? r.how_to_apply ?? ""} placeholder="How to Apply — link or phone" onChange={(e) => set({ how_to_apply: e.target.value })} aria-label={`How to apply for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5 sm:col-span-2" />
                  <input value={(d.application_url as string | undefined) ?? r.application_url ?? ""} placeholder="Application link (optional)" onChange={(e) => set({ application_url: e.target.value })} aria-label={`Application link for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5 sm:col-span-2" />
                  <select value={(d.availability_status as string | undefined) ?? r.availability_status ?? ""} onChange={(e) => set({ availability_status: e.target.value || null })} aria-label={`Availability for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5">
                    <option value="">Availability: not stated</option>
                    <option value="accepting">Accepting now</option>
                    <option value="waitlist">Waitlist</option>
                    <option value="full">Currently full — check back</option>
                  </select>
                  <input value={(d.insurance_accepted as string | undefined) ?? r.insurance_accepted ?? ""} placeholder="Insurance accepted (health only)" onChange={(e) => set({ insurance_accepted: e.target.value })} aria-label={`Insurance accepted for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5 sm:col-span-2" />
                  <select value={(d.resource_category ?? r.resource_category) as string} onChange={(e) => set({ resource_category: e.target.value })} aria-label={`Category for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5">
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <select value={(d.verification_status ?? r.verification_status) as string} onChange={(e) => setStatusOf(r.id, e.target.value as BronxVerificationStatus)} aria-label={`Verification status for ${r.organization_name}`} className="rounded-lg border border-border bg-background text-xs px-2 py-1.5">
                    {Object.entries(BRONX_VERIFICATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => verify(r.id)} disabled={busy === r.id} className="no-min-h inline-flex items-center gap-1.5 rounded-lg bg-success/15 text-success px-3 py-1.5 text-xs font-bold hover:bg-success/25 disabled:opacity-50">
                    <Check className="h-3.5 w-3.5" /> Verified today
                  </button>
                  <button onClick={() => saveRow(r.id)} disabled={busy === r.id} className="no-min-h inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold disabled:opacity-50">
                    {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                  </button>
                  <button onClick={() => toggleActive(r)} disabled={busy === r.id} className="no-min-h inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted disabled:opacity-50">
                    <X className="h-3.5 w-3.5" /> {r.active ? "Deactivate" : "Reactivate"}
                  </button>
                  {mergePick === null ? (
                    <button onClick={() => setMergePick(r.id)} className="no-min-h inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted">
                      <Merge className="h-3.5 w-3.5" /> Merge…
                    </button>
                  ) : mergePick === r.id ? (
                    <span className="text-xs font-bold text-primary self-center">
                      Pick the listing to keep…{" "}
                      <button onClick={() => setMergePick(null)} className="underline">cancel</button>
                    </span>
                  ) : (
                    <button onClick={() => doMerge(mergePick, r.id)} className="no-min-h rounded-lg bg-warning/20 text-warning px-3 py-1.5 text-xs font-bold">
                      Keep this one
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No listings yet. Import a CSV or JSON export from one of the official sources above.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
