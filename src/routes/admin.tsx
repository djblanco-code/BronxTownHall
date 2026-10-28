import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useEffect, useState } from "react";
import { Business, BusinessEvent, deleteBusiness, getBusinesses, getEvents, saveBusinesses, saveEvents } from "@/lib/business";
import { listSuggestions, setSuggestionStatus, Suggestion } from "@/lib/suggestions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check, Download, Lock, Trash2, X } from "lucide-react";
import { VerificationAgentPanel } from "@/components/VerificationAgentPanel";
import { AdminResourcePanel } from "@/components/AdminResourcePanel";
import { AdminBronxDataPanel } from "@/components/AdminBronxDataPanel";
import { AdminCreatorPanel } from "@/components/AdminCreatorPanel";
import { AdminOrgReviewPanel } from "@/components/AdminOrgReviewPanel";
import { AdminPolicyAlertPanel } from "@/components/AdminPolicyAlertPanel";
import { AdminAdPanel } from "@/components/AdminAdPanel";
import { AdminConductFlagPanel } from "@/components/AdminConductFlagPanel";
import { AdminBusinessSupportPanel } from "@/components/AdminBusinessSupportPanel";
import { AdminEventSourcingPanel } from "@/components/AdminEventSourcingPanel";


type EntrepreneurLead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  idea_summary: string;
  stage: string;
  help_needed: string[] | null;
  contacted: boolean;
};

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false }, component: AdminPage });

function AdminPage() {
  const nav = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [tick, setTick] = useState(0);
  const [leads, setLeads] = useState<EntrepreneurLead[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("entrepreneur_leads")
        .select("id,created_at,name,email,idea_summary,stage,help_needed,contacted")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!cancelled && data) setLeads(data as EntrepreneurLead[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, tick]);

  if (loading) return <AppShell><div className="max-w-md mx-auto p-12 text-center text-muted-foreground">Loading…</div></AppShell>;

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-sm mx-auto px-4 py-12 text-center space-y-4">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Sign in with an admin account to continue.</p>
          <Link to="/auth" className="inline-block py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold">Sign in</Link>
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto px-4 py-12 text-center space-y-3">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Admins only</h1>
          <p className="text-sm text-muted-foreground">Your account doesn't have the admin role. Ask an existing admin to grant you access via the user_roles table.</p>
          <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1 inline-block break-all">Your user id: {user.id}</p>
        </div>
      </AppShell>
    );
  }

  const bs = getBusinesses();
  const ev = getEvents();
  const free = bs.filter((b) => b.tier === "free");
  const prem = bs.filter((b) => b.tier === "premium");
  const youthOpenToMinors = bs.filter((b) => b.youthSubcategory === "employment" && b.minorEligibility === "yes");
  const mrr = prem.length * 19;

  const verify = (id: string) => { const list = getBusinesses().map((b) => b.id === id ? { ...b, verified: true, status: "live" as const } : b); saveBusinesses(list); setTick(tick + 1); };
  const approveEvent = (id: string) => { saveEvents(getEvents().map((e) => e.id === id ? { ...e, status: "approved" as const } : e)); setTick(tick + 1); };
  const del = (id: string) => { if (confirm("Delete?")) { deleteBusiness(id); setTick(tick + 1); } };

  const exportCSV = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select("name, address, category, subcategory, phone, hours, verified, tier, status, created_at, description, website, verified_date, latitude, longitude")
      .order("created_at", { ascending: false });
    if (error || !data) {
      alert("Failed to load businesses for export.");
      return;
    }
    const headers = ["Name", "Address", "Category", "Subcategory", "Phone", "Hours", "Verified", "Tier", "Status", "Created At", "Verified Date", "Website", "Latitude", "Longitude", "Description"];
    const escape = (value: string | number | null | undefined) => {
      const text = value == null ? "" : String(value).replace(/\r?\n/g, " ");
      if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
      return text;
    };
    const csvContent = [
      headers.join(","),
      ...data.map((r) => [
        escape(r.name),
        escape(r.address),
        escape(r.category),
        escape(r.subcategory),
        escape(r.phone),
        escape(typeof r.hours === "object" && r.hours !== null ? JSON.stringify(r.hours) : String(r.hours)),
        r.verified ? "Yes" : "No",
        escape(r.tier),
        escape(r.status),
        escape(r.created_at),
        escape(r.verified_date),
        escape(r.website),
        escape(r.latitude == null ? "" : String(r.latitude)),
        escape(r.longitude == null ? "" : String(r.longitude)),
        escape(r.description),
      ].join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bronx_businesses_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <button onClick={() => nav({ to: "/" })} className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"><ArrowLeft className="h-4 w-4" /> Home</button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={exportCSV} className="no-min-h inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold min-h-[44px] hover:bg-muted">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <Link to="/admin/analytics" className="no-min-h inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold min-h-[44px]">
              View analytics
            </Link>
          </div>
        </div>


        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card label="Free businesses" value={free.length} />
          <Card label="Premium businesses" value={prem.length} />
          <Card label="MRR (simulated)" value={`$${mrr}`} />
          <Card label="Youth open-to-minors" value={youthOpenToMinors.length} />
        </div>

        <AdminEventSourcingPanel />
        <AdminConductFlagPanel />
        <AdminBusinessSupportPanel />
        <AdminOrgReviewPanel />
        <AdminAdPanel />
        <AdminPolicyAlertPanel />

        <AdminBronxDataPanel />
        <AdminCreatorPanel />


        <AdminResourcePanel />

        <VerificationAgentPanel />

        <Section title="Pending Business Approvals">

          {bs.filter((b) => !b.verified && b.tier === "premium").length === 0 && <p className="text-sm text-muted-foreground">No premium businesses pending verified badge.</p>}
          {bs.filter((b) => !b.verified && b.tier === "premium").map((b) => (
            <Row key={b.id} title={`${b.name} — ${b.category} / ${b.subcategory}`} actions={<button onClick={() => verify(b.id)} className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm font-semibold inline-flex items-center gap-1"><Check className="h-4 w-4" /> Approve verified</button>} />
          ))}
        </Section>

        <Section title="Pending Events">
          {ev.filter((e) => e.status === "pending").length === 0 && <p className="text-sm text-muted-foreground">No pending events.</p>}
          {ev.filter((e) => e.status === "pending").map((e) => <EventRow key={e.id} ev={e} onApprove={() => approveEvent(e.id)} />)}
        </Section>

        <Section title="All Registered Businesses">
          {bs.length === 0 && <p className="text-sm text-muted-foreground">No businesses registered yet.</p>}
          {bs.map((b) => (
            <Row key={b.id} title={`${b.name} — ${b.tier.toUpperCase()} · ${b.category} / ${b.subcategory}${b.verified ? " · ✓ Verified" : ""}`} actions={<button onClick={() => del(b.id)} className="px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-sm font-medium inline-flex items-center gap-1 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Delete</button>} />
          ))}
        </Section>

        <Section title="Community Suggestions (Edits & New Resources)">
          {listSuggestions().length === 0 && <p className="text-sm text-muted-foreground">No suggestions yet.</p>}
          {listSuggestions().map((s) => <SuggestionRow key={s.id} s={s} onChange={() => setTick(tick + 1)} />)}
        </Section>

        <Section title="Entrepreneur Leads ('Tell Us Your Idea')">
          {leads.length === 0 && <p className="text-sm text-muted-foreground">No leads yet.</p>}
          {leads.map((l) => (
            <div key={l.id} className="py-3 border-b border-border last:border-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold">{l.name}</p>
                <a href={`mailto:${l.email}`} className="text-xs text-primary hover:underline">{l.email}</a>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase">{l.stage}</span>
                <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</span>
                {l.contacted && <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">contacted</span>}
              </div>
              <p className="text-xs">{l.idea_summary}</p>
              {l.help_needed && l.help_needed.length > 0 && (
                <p className="text-xs text-muted-foreground">Needs: {l.help_needed.join(", ")}</p>
              )}
              {!l.contacted && (
                <button
                  onClick={async () => {
                    await supabase.from("entrepreneur_leads").update({ contacted: true }).eq("id", l.id);
                    setTick(tick + 1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" /> Mark contacted
                </button>
              )}
            </div>
          ))}
        </Section>

        <Section title="Youth Opportunities Open to Minors (Compliance)">
          {youthOpenToMinors.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
          {youthOpenToMinors.map((b) => <Row key={b.id} title={`${b.name} — ${b.minorEligibility} ${b.restrictionsNote ? `(${b.restrictionsNote})` : ""}`} />)}
        </Section>
      </div>
    </AppShell>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5 space-y-2"><h2 className="text-lg font-bold">{title}</h2>{children}</div>;
}
function Row({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"><p className="text-sm">{title}</p>{actions}</div>;
}
function EventRow({ ev, onApprove }: { ev: BusinessEvent; onApprove: () => void }) {
  return <div className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"><p className="text-sm">{ev.title} · {ev.date} {ev.time} · {ev.location}</p><button onClick={onApprove} className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-sm font-semibold">Approve</button></div>;
}
function SuggestionRow({ s, onChange }: { s: Suggestion; onChange: () => void }) {
  const status = s.status;
  return (
    <div className="py-3 border-b border-border last:border-0 space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.kind === "edit" ? "bg-warning/20 text-warning" : "bg-primary/15 text-primary"}`}>{s.kind === "edit" ? "EDIT" : "NEW"}</span>
        <p className="text-sm font-semibold">{s.fields.name || "(no name)"}</p>
        <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
        {status !== "pending" && <span className={`text-xs px-2 py-0.5 rounded-full ${status === "approved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{status}</span>}
      </div>
      {s.resourceId && <p className="text-xs text-muted-foreground">For resource: {s.resourceId}</p>}
      {s.fields.address && <p className="text-xs">{s.fields.address}</p>}
      {s.fields.phone && <p className="text-xs">{s.fields.phone}</p>}
      {s.fields.category && <p className="text-xs">Category: {s.fields.category}</p>}
      {s.fields.note && <p className="text-xs italic">"{s.fields.note}"</p>}
      {s.fields.description && <p className="text-xs">{s.fields.description}</p>}
      {status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => { setSuggestionStatus(s.id, "approved"); onChange(); }} className="px-3 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-semibold inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Approve</button>
          <button onClick={() => { setSuggestionStatus(s.id, "rejected"); onChange(); }} className="px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-xs font-medium inline-flex items-center gap-1"><X className="h-3.5 w-3.5" /> Reject</button>
        </div>
      )}
    </div>
  );
}
