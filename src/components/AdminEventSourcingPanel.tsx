import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { approveScrapedEvent, runEventScrapeNow } from "@/lib/event-scrape.functions";
import { Check, Pencil, RefreshCw, X } from "lucide-react";

type Source = { id: string; name: string; url: string; active: boolean; last_checked_at: string | null; last_status: string | null; last_message: string | null };
type Candidate = { id: string; title: string; event_date: string; event_time: string | null; location: string | null; description: string | null; event_url: string | null; possible_duplicate: boolean; duplicate_note: string | null; source_id: string | null };

export function AdminEventSourcingPanel() {
  const [sources, setSources] = useState<Source[]>([]);
  const [items, setItems] = useState<Candidate[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Candidate>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const runNow = useServerFn(runEventScrapeNow);
  const approve = useServerFn(approveScrapedEvent);

  const load = async () => {
    const [s, c] = await Promise.all([
      supabase.from("event_sources").select("*").order("name"),
      supabase.from("scraped_events").select("*").eq("status", "pending").order("event_date"),
    ]);
    setSources((s.data ?? []) as Source[]);
    setItems((c.data ?? []) as Candidate[]);
  };
  useEffect(() => { load(); }, []);

  const doRun = async () => {
    setBusy(true); setMsg("Checking sources — this can take a minute…");
    try { await runNow(); setMsg("Check complete."); } catch (e) { setMsg((e as Error).message); }
    setBusy(false); load();
  };
  const doApprove = async (c: Candidate) => {
    const v = editing === c.id ? { ...c, ...draft } : c;
    try {
      await approve({ data: { id: c.id, title: v.title, event_date: v.event_date, event_time: v.event_time, location: v.location, description: v.description } });
      setEditing(null); load();
    } catch (e) { alert((e as Error).message); }
  };
  const doReject = async (id: string) => {
    await supabase.from("scraped_events").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    load();
  };
  const addSource = async () => {
    if (!/^https?:\/\//.test(newUrl) || !newName.trim()) return;
    await supabase.from("event_sources").insert({ name: newName.trim(), url: newUrl.trim() });
    setNewName(""); setNewUrl(""); load();
  };
  const toggle = async (s: Source) => { await supabase.from("event_sources").update({ active: !s.active }).eq("id", s.id); load(); };
  const srcName = (id: string | null) => sources.find((s) => s.id === id)?.name ?? "Unknown source";
  const input = "w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm";

  return (
    <section className="rounded-2xl border border-border bg-card p-5 space-y-4" aria-labelledby="evsrc-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="evsrc-h" className="text-lg font-bold">Event Sourcing — Review Queue ({items.length})</h2>
        <button onClick={doRun} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Check sources now
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Sources are checked automatically every week. Nothing is published until you approve it; approved events go live as "Not yet verified". Events without a clear date are skipped.</p>
      {msg && <p role="status" className="text-sm">{msg}</p>}

      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No pending events.</p>}
        {items.map((c) => {
          const isEd = editing === c.id;
          const v = isEd ? { ...c, ...draft } : c;
          return (
            <div key={c.id} className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-warning/20 text-foreground font-semibold">Pending review</span>
                <span className="px-2 py-0.5 rounded-full bg-muted">Not yet verified</span>
                {c.possible_duplicate && <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">Possible duplicate</span>}
                <span className="text-muted-foreground">from {srcName(c.source_id)}</span>
              </div>
              {isEd ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs sm:col-span-2">Title<input className={input} value={v.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
                  <label className="text-xs">Date<input type="date" className={input} value={v.event_date} onChange={(e) => setDraft({ ...draft, event_date: e.target.value })} /></label>
                  <label className="text-xs">Time<input className={input} value={v.event_time ?? ""} onChange={(e) => setDraft({ ...draft, event_time: e.target.value })} /></label>
                  <label className="text-xs sm:col-span-2">Location<input className={input} value={v.location ?? ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></label>
                  <label className="text-xs sm:col-span-2">Description<textarea className={input} rows={3} value={v.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
                </div>
              ) : (
                <div className="text-sm space-y-0.5">
                  <p className="font-semibold">{c.title}</p>
                  <p>{c.event_date}{c.event_time ? ` · ${c.event_time}` : ""}{c.location ? ` · ${c.location}` : ""}</p>
                  {c.description && <p className="text-muted-foreground text-xs">{c.description}</p>}
                  {c.duplicate_note && <p className="text-xs text-destructive">{c.duplicate_note}</p>}
                  {c.event_url && <a href={c.event_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Original page</a>}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => doApprove(c)} className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm font-semibold inline-flex items-center gap-1"><Check className="h-4 w-4" /> {isEd ? "Save & approve" : "Approve"}</button>
                {!isEd && <button onClick={() => { setEditing(c.id); setDraft({}); }} className="px-3 py-1.5 rounded-lg border border-border text-sm inline-flex items-center gap-1"><Pencil className="h-4 w-4" /> Edit</button>}
                {isEd && <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg border border-border text-sm">Cancel</button>}
                <button onClick={() => doReject(c.id)} className="px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-sm inline-flex items-center gap-1"><X className="h-4 w-4" /> Reject</button>
              </div>
            </div>
          );
        })}
      </div>

      <details className="rounded-xl border border-border p-3">
        <summary className="cursor-pointer text-sm font-semibold">Sources ({sources.length})</summary>
        <ul className="mt-2 space-y-2">
          {sources.map((s) => (
            <li key={s.id} className="text-sm flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2 last:border-0">
              <div>
                <p className="font-medium">{s.name} {!s.active && <span className="text-xs text-muted-foreground">(paused)</span>}</p>
                <p className="text-xs text-muted-foreground break-all">{s.url}</p>
                <p className="text-xs">{s.last_checked_at ? `Last checked ${new Date(s.last_checked_at).toLocaleString()} — ${s.last_status}: ${s.last_message}` : "Not checked yet"}</p>
              </div>
              <button onClick={() => toggle(s)} className="text-xs px-2 py-1 rounded border border-border">{s.active ? "Pause" : "Resume"}</button>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input aria-label="Source name" placeholder="Source name" className={input} value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input aria-label="Source URL" placeholder="https://…" className={input} value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
          <button onClick={addSource} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Add source</button>
        </div>
      </details>
    </section>
  );
}
