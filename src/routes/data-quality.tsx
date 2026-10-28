import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { RESOURCES } from "@/lib/data";
import { useResourceMeta } from "@/lib/resource-meta";
import { freshnessOf, isVerified, verifyEveryDaysFor } from "@/lib/verification";
import { VerifiedPill } from "@/components/VerifiedPill";
import { RecentlyFixedTicker } from "@/components/RecentlyFixedTicker";
import { ShieldCheck, TrendingUp, Flag, CalendarCheck, Users } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/data-quality")({
  staticData: { sitemap: true },
  component: DataQualityPage,
  head: () => ({
    meta: [
      { title: "Data Quality — The Bronx App" },
      { name: "description", content: "How fresh our listings are, how many we've verified this week, and how the community helps keep them accurate." },
    ],
  }),
});

function DataQualityPage() {
  const meta = useResourceMeta();

  // Counts come from real verification records only. Listings we have not
  // checked are reported as unverified rather than quietly counted as fresh.
  const stats = useMemo(() => {
    let fresh = 0;
    let dueSoon = 0;
    let overdue = 0;
    let never = 0;
    let verifiedThisWeek = 0;
    RESOURCES.forEach((r) => {
      const m = meta[r.id];
      const verified = m && isVerified(m.verification_status) && m.last_verified;
      if (!verified) {
        never++;
        return;
      }
      const days = Math.floor((Date.now() - new Date(m.last_verified!).getTime()) / 86_400_000);
      if (days <= 7) verifiedThisWeek++;
      const f = freshnessOf(m.last_verified, m.verify_every_days ?? verifyEveryDaysFor(r.category));
      if (f === "fresh") fresh++;
      else if (f === "due_soon") dueSoon++;
      else overdue++;
    });
    return { fresh, dueSoon, overdue, never, verifiedThisWeek, total: RESOURCES.length };
  }, [meta]);

  const pctFresh = stats.total ? Math.round((stats.fresh / stats.total) * 100) : 0;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <ShieldCheck className="h-4 w-4" />
          Public data-quality report
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Fresh data is our whole job.</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          Every listing carries a verification record — who confirmed it and when. Different listings are re-checked on
          different schedules: a food pantry every 90 days, a hospital about once a year. Listings we have not confirmed
          yet say so plainly. These numbers are counted from real records, not estimated.
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Stat icon={<CalendarCheck className="h-5 w-5" />} value={stats.verifiedThisWeek.toString()} label="Verified this week" tone="fresh" />
          <Stat icon={<TrendingUp className="h-5 w-5" />} value={`${pctFresh}%`} label="Currently within their re-check window" tone="fresh" />
          <Stat icon={<Users className="h-5 w-5" />} value={stats.total.toString()} label="Total listings tracked" tone="neutral" />
        </div>

        <div className="mt-8">
          <RecentlyFixedTicker />
        </div>

        <div className="mt-8 rounded-2xl border-2 border-border bg-card p-6">
          <h2 className="text-xl font-bold mb-4">Verification breakdown</h2>
          <div className="space-y-3">
            <Bar label="Fresh — inside its re-check window" count={stats.fresh} total={stats.total} tone="success" />
            <Bar label="Due soon — nearing its re-check date" count={stats.dueSoon} total={stats.total} tone="warning" />
            <Bar label="Overdue — past its re-check date" count={stats.overdue} total={stats.total} tone="destructive" />
            <Bar label="Not yet verified by us" count={stats.never} total={stats.total} tone="muted" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 items-center text-xs">
            <span className="text-muted-foreground">Legend:</span>
            <VerifiedPill status="verified_by_bronx_app" lastVerified={new Date()} category="food" />
            <VerifiedPill status="verified_by_org" lastVerified={new Date(Date.now() - 80 * 24 * 3600 * 1000)} category="food" />
            <VerifiedPill status="community_submitted" />
            <VerifiedPill />
          </div>
        </div>


        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border-2 border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="h-5 w-5 text-primary" />
              <h3 className="font-bold">See something wrong?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Every listing has a <strong>Report incorrect info</strong> button. Three reports auto-hide a resource until a Liaison re-checks it.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-success" />
              <h3 className="font-bold">Community Liaison network</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Trained volunteers foot-verify pantries, clinics, and legal-aid programs. This is the entire moat against Google Maps and 311.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/" className="text-primary font-semibold hover:underline">← Back home</Link>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: "fresh" | "neutral" }) {
  const bg = tone === "fresh" ? "bg-success/10 border-success/30" : "bg-card border-border";
  return (
    <div className={`rounded-2xl border-2 ${bg} p-5`}>
      <div className="flex items-center gap-2 text-muted-foreground text-sm">{icon}<span>{label}</span></div>
      <div className="text-4xl font-bold mt-2">{value}</div>
    </div>
  );
}

function Bar({ label, count, total, tone }: { label: string; count: number; total: number; tone: "success" | "warning" | "destructive" | "muted" }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "muted" ? "bg-muted-foreground/40" : "bg-destructive";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{count} · {pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
