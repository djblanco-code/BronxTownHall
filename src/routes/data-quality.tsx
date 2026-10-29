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
      {
        name: "description",
        content:
          "How fresh our listings are, how many we've verified this week, and how the community helps keep them accurate.",
      },
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
      <div className="mx-auto max-w-5xl px-4 py-6">
        <p className="label-caps mb-2 flex items-center gap-1.5 text-primary">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          Public data-quality report
        </p>
        <h1 className="text-3xl text-foreground sm:text-4xl">Fresh data is our whole job.</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Every listing carries a verification record — who confirmed it and when. Different
          listings are re-checked on different schedules: a food pantry every 90 days, a hospital
          about once a year. Listings we have not confirmed yet say so plainly. These numbers are
          counted from real records, not estimated.
        </p>

        <div className="mt-8 grid gap-x-6 sm:grid-cols-3">
          <Stat
            icon={<CalendarCheck className="h-5 w-5" />}
            value={stats.verifiedThisWeek.toString()}
            label="Verified this week"
            tone="fresh"
          />
          <Stat
            icon={<TrendingUp className="h-5 w-5" />}
            value={`${pctFresh}%`}
            label="Currently within their re-check window"
            tone="fresh"
          />
          <Stat
            icon={<Users className="h-5 w-5" />}
            value={stats.total.toString()}
            label="Total listings tracked"
            tone="neutral"
          />
        </div>

        <div className="mt-8">
          <RecentlyFixedTicker />
        </div>

        <section aria-labelledby="dq-breakdown" className="mt-8 pt-2">
          <h2 id="dq-breakdown" className="mb-4 text-lg font-bold sm:text-2xl">
            Verification breakdown
          </h2>
          <div className="space-y-3">
            <Bar
              label="Fresh — inside its re-check window"
              count={stats.fresh}
              total={stats.total}
              tone="success"
            />
            <Bar
              label="Due soon — nearing its re-check date"
              count={stats.dueSoon}
              total={stats.total}
              tone="warning"
            />
            <Bar
              label="Overdue — past its re-check date"
              count={stats.overdue}
              total={stats.total}
              tone="destructive"
            />
            <Bar
              label="Not yet verified by us"
              count={stats.never}
              total={stats.total}
              tone="muted"
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
            <span className="text-muted-foreground">Legend:</span>
            <VerifiedPill
              status="verified_by_bronx_app"
              lastVerified={new Date()}
              category="food"
            />
            <VerifiedPill
              status="verified_by_org"
              lastVerified={new Date(Date.now() - 80 * 24 * 3600 * 1000)}
              category="food"
            />
            <VerifiedPill status="community_submitted" />
            <VerifiedPill />
          </div>
        </section>

        <div className="mt-8 grid gap-x-6 sm:grid-cols-2">
          <div className="py-3">
            <div className="mb-1 flex items-center gap-2">
              <Flag className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <h3 className="font-bold">See something wrong?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Every listing has a <strong>Report incorrect info</strong> button. Three reports
              auto-hide a resource until a Liaison re-checks it.
            </p>
          </div>
          <div className="py-3">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <h3 className="font-bold">Community Liaison network</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Trained volunteers foot-verify pantries, clinics, and legal-aid programs. This is the
              entire moat against Google Maps and 311.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="no-min-h inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4"
          >
            ← Back home
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: "fresh" | "neutral";
}) {
  return (
    <div className="py-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={tone === "fresh" ? "text-success" : "text-primary"}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="font-display mt-1 text-4xl font-bold">{value}</div>
    </div>
  );
}

function Bar({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: "success" | "warning" | "destructive" | "muted";
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "muted"
          ? "bg-muted-foreground/40"
          : "bg-destructive";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">
          {count} · {pct}%
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-sm bg-secondary">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
