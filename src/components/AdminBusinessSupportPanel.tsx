import { useEffect, useState } from "react";
import { BriefcaseBusiness, Gavel, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LEGAL_TOPICS, loadHiringPosts, loadLegalRequests, updateHiringPost, updateLegalRequest, type HiringPost, type LegalConsultationRequest, type LegalRequestStatus } from "@/lib/business-support";

const statuses: LegalRequestStatus[] = ["new", "contacted", "scheduled", "completed", "closed"];

export function AdminBusinessSupportPanel() {
  const [legal, setLegal] = useState<LegalConsultationRequest[]>([]); const [jobs, setJobs] = useState<HiringPost[]>([]); const [loading, setLoading] = useState(true); const [notes, setNotes] = useState<Record<string, string>>({});
  const refresh = async () => { setLoading(true); try { const [l, j] = await Promise.all([loadLegalRequests(), loadHiringPosts()]); setLegal(l); setJobs(j); } catch (e) { toast.error(e instanceof Error ? e.message : "Could not load business support queues"); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); }, []);
  return <div className="grid lg:grid-cols-2 gap-4">
    <section className="rounded-md border-2 border-border bg-card p-4 space-y-3">
      <h2 className="font-bold flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" /> Legal consultation requests</h2>
      <p className="text-xs text-muted-foreground">Private scheduling queue. Requests are visible only to their owner and admins.</p>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : legal.length === 0 ? <p className="text-sm text-muted-foreground">No requests yet.</p> : legal.map((r) => <article key={r.id} className="rounded-md border border-border p-3 space-y-2">
        <div><p className="font-bold text-sm">{r.business_name}</p><p className="text-xs text-muted-foreground">{LEGAL_TOPICS.find((t) => t.value === r.topic)?.label ?? r.topic} · prefers {r.preferred_contact}</p></div>
        {r.topic_details && <p className="text-sm">{r.topic_details}</p>}
        <p className="text-xs"><strong>Contact:</strong> {[r.contact_email, r.contact_phone].filter(Boolean).join(" · ") || "No saved contact"}</p>
        <textarea rows={2} value={notes[r.id] ?? r.admin_notes ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} placeholder="Private scheduling notes" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <div className="flex gap-2 flex-wrap"><select value={r.status} onChange={async (e) => { await updateLegalRequest(r.id, { status: e.target.value as LegalRequestStatus, admin_notes: notes[r.id] ?? r.admin_notes }); toast.success("Request updated."); void refresh(); }} className="rounded-md border border-border bg-background px-2 py-1.5 text-xs">{statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select><Button size="sm" variant="outline" onClick={async () => { await updateLegalRequest(r.id, { admin_notes: notes[r.id] ?? "" }); toast.success("Notes saved."); void refresh(); }}>Save notes</Button></div>
      </article>)}
    </section>
    <section className="rounded-md border-2 border-border bg-card p-4 space-y-3">
      <h2 className="font-bold flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-primary" /> Hiring posts</h2>
      <p className="text-xs text-muted-foreground">Moderate lightweight Now Hiring posts separately from training and internship listings.</p>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : jobs.length === 0 ? <p className="text-sm text-muted-foreground">No hiring posts yet.</p> : jobs.map((p) => <article key={p.id} className="rounded-md border border-border p-3 flex items-start justify-between gap-3"><div><p className="font-bold text-sm">{p.role_title}</p><p className="text-xs text-muted-foreground">{p.employer_name}{p.bronx_preferred ? " · Bronx Preferred" : ""}{p.fair_chance_employer ? " · Fair Chance Employer" : ""} · {p.status}</p></div><Button size="sm" variant="outline" onClick={async () => { await updateHiringPost(p.id, { status: p.status === "closed" ? "published" : "closed" }); toast.success("Hiring post updated."); void refresh(); }}>{p.status === "closed" ? "Publish" : "Close"}</Button></article>)}
    </section>
  </div>;
}