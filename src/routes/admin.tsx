import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check, Download, Lock } from "lucide-react";
import { SHOW_BUSINESS_FEATURES } from "@/lib/first-version";
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
import { AdminReviewQueuePanel } from "@/components/AdminReviewQueuePanel";

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
  staticData: { sitemap: false },
  component: AdminPage,
});

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

  if (loading)
    return (
      <AppShell>
        <div className="max-w-md mx-auto p-12 text-center text-muted-foreground">Loading…</div>
      </AppShell>
    );

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-sm mx-auto px-4 py-12 text-center space-y-4">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <h1 className="text-2xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with an admin account to continue.
          </p>
          <Link
            to="/auth"
            className="inline-block py-2.5 px-4 rounded-lg bg-primary-fill text-primary-fill-foreground font-semibold"
          >
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto px-4 py-12 text-center space-y-3">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <h1 className="text-2xl">Admins only</h1>
          <p className="text-sm text-muted-foreground">
            This page is for Bronx Town Hall staff. If you are staff, ask an existing admin to add
            your account.
          </p>
        </div>
      </AppShell>
    );
  }

  const exportCSV = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select(
        "name, address, category, subcategory, phone, hours, verified, tier, status, created_at, description, website, verified_date, latitude, longitude",
      )
      .order("created_at", { ascending: false });
    if (error || !data) {
      alert("Failed to load businesses for export.");
      return;
    }
    const headers = [
      "Name",
      "Address",
      "Category",
      "Subcategory",
      "Phone",
      "Hours",
      "Verified",
      "Tier",
      "Status",
      "Created At",
      "Verified Date",
      "Website",
      "Latitude",
      "Longitude",
      "Description",
    ];
    const escape = (value: string | number | null | undefined) => {
      const text = value == null ? "" : String(value).replace(/\r?\n/g, " ");
      if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
      return text;
    };
    const csvContent = [
      headers.join(","),
      ...data.map((r) =>
        [
          escape(r.name),
          escape(r.address),
          escape(r.category),
          escape(r.subcategory),
          escape(r.phone),
          escape(
            typeof r.hours === "object" && r.hours !== null
              ? JSON.stringify(r.hours)
              : String(r.hours),
          ),
          r.verified ? "Yes" : "No",
          escape(r.tier),
          escape(r.status),
          escape(r.created_at),
          escape(r.verified_date),
          escape(r.website),
          escape(r.latitude == null ? "" : String(r.latitude)),
          escape(r.longitude == null ? "" : String(r.longitude)),
          escape(r.description),
        ].join(","),
      ),
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
        <button
          onClick={() => nav({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Home
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl">Admin Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            {SHOW_BUSINESS_FEATURES && (
              <button
                onClick={exportCSV}
                className="no-min-h inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold min-h-[44px] hover:bg-muted"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            )}
            <Link
              to="/admin/analytics"
              className="no-min-h inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-fill text-primary-fill-foreground text-sm font-semibold min-h-[44px]"
            >
              View analytics
            </Link>
          </div>
        </div>

        <AdminReviewQueuePanel />
        <AdminOrgReviewPanel />
        <AdminEventSourcingPanel />
        <AdminConductFlagPanel />
        <AdminPolicyAlertPanel />
        <AdminAdPanel />
        <AdminResourcePanel />
        <AdminBronxDataPanel />
        <VerificationAgentPanel />

        {/* Business, creator and hiring tools are out of the first version. */}
        {SHOW_BUSINESS_FEATURES && (
          <>
            <AdminBusinessSupportPanel />
            <AdminCreatorPanel />
            <Section title="Entrepreneur Leads ('Tell Us Your Idea')">
              {leads.length === 0 && <p className="text-sm text-muted-foreground">No leads yet.</p>}
              {leads.map((l) => (
                <div key={l.id} className="py-3 border-b border-border last:border-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{l.name}</p>
                    <a href={`mailto:${l.email}`} className="text-xs text-primary hover:underline">
                      {l.email}
                    </a>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase">
                      {l.stage}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString()}
                    </span>
                    {l.contacted && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">
                        contacted
                      </span>
                    )}
                  </div>
                  <p className="text-xs">{l.idea_summary}</p>
                  {l.help_needed && l.help_needed.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Needs: {l.help_needed.join(", ")}
                    </p>
                  )}
                  {!l.contacted && (
                    <button
                      onClick={async () => {
                        await supabase
                          .from("entrepreneur_leads")
                          .update({ contacted: true })
                          .eq("id", l.id);
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
          </>
        )}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}
