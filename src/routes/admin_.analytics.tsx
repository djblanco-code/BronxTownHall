import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/features/shell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { RESOURCES } from "@/lib/data";
import { ZIP_MAP } from "@/lib/civic-data";
import { UserZipMap } from "@/components/UserZipMap";
import {
  ArrowLeft,
  Lock,
  Users,
  UserPlus,
  Activity,
  CalendarRange,
  Repeat,
  RefreshCw,
  Eye,
  Share2,
  Search,
  LayoutGrid,
  CalendarPlus,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/admin_/analytics")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Analytics Dashboard — The Bronx App" },
      {
        name: "description",
        content:
          "Audience metrics for The Bronx App: total users, new users, weekly and monthly active users, and 7-day retention.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Analytics Dashboard — The Bronx App" },
      { property: "og:description", content: "Audience metrics for The Bronx App." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsPage,
});

type Row = {
  visitor_id: string;
  occurred_at: string;
  is_first_visit: boolean;
  device: string | null;
  language: string | null;
  zip_code: string | null;
};

type TopResource = {
  resource_id: string;
  category: string | null;
  views: number;
  clicks: number;
  conversion_rate: number;
};

type TopShared = {
  resource_id: string;
  category: string | null;
  total_shares: number;
  sms_shares: number;
  whatsapp_shares: number;
  other_shares: number;
};

type SearchAnalytics = {
  total: number;
  with_results: number;
  zero_results: number;
  ai_searches: number;
  fuzzy_searches: number;
  top_queries: { query: string; searches: number; zero_results: number; avg_results: number }[];
  top_zero_queries: { query: string; searches: number }[];
};

type CategoryPerf = { category: string; views: number; clicks: number; conversion_rate: number };

type EventStats = {
  total: number;
  community_submitted: number;
  approved: number;
  pending: number;
  by_week: { week: string; count: number }[];
  by_category: { category: string; count: number }[];
};

const DAY = 86_400_000;

function computeMetrics(rows: Row[]) {
  const now = Date.now();
  const first = new Map<string, number>();
  const last = new Map<string, number>();
  const times = new Map<string, number[]>();

  for (const r of rows) {
    const t = new Date(r.occurred_at).getTime();
    const f = first.get(r.visitor_id);
    if (f === undefined || t < f) first.set(r.visitor_id, t);
    const l = last.get(r.visitor_id);
    if (l === undefined || t > l) last.set(r.visitor_id, t);
    const arr = times.get(r.visitor_id) ?? [];
    arr.push(t);
    times.set(r.visitor_id, arr);
  }

  const totalUsers = first.size;
  let newUsersThisWeek = 0;
  let wau = 0;
  let mau = 0;
  let eligible = 0;
  let returned = 0;

  for (const [id, f] of first) {
    if (now - f <= 7 * DAY) newUsersThisWeek++;
    const l = last.get(id) ?? f;
    if (now - l <= 7 * DAY) wau++;
    if (now - l <= 30 * DAY) mau++;
    if (now - f >= DAY) {
      eligible++;
      const ts = times.get(id) ?? [];
      if (ts.some((t) => t > f && t <= f + 7 * DAY)) returned++;
    }
  }

  const retentionRate = eligible ? Math.round((returned / eligible) * 100) : 0;

  const byDay = new Map<string, { visits: number; visitors: Set<string> }>();
  for (const r of rows) {
    const t = new Date(r.occurred_at);
    if (now - t.getTime() > 30 * DAY) continue;
    const key = t.toISOString().slice(0, 10);
    const b = byDay.get(key) ?? { visits: 0, visitors: new Set<string>() };
    b.visits++;
    b.visitors.add(r.visitor_id);
    byDay.set(key, b);
  }
  const daily = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, b]) => ({ day, visits: b.visits, visitors: b.visitors.size }));

  const breakdown = (key: "device" | "language" | "zip_code") => {
    const m = new Map<string, Set<string>>();
    for (const r of rows) {
      const v = (r[key] || "").trim();
      if (!v) continue;
      const s = m.get(v) ?? new Set<string>();
      s.add(r.visitor_id);
      m.set(v, s);
    }
    return [...m.entries()]
      .map(([name, s]) => ({ name, count: s.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  return {
    totalUsers,
    newUsersThisWeek,
    weeklyActiveUsers: wau,
    monthlyActiveUsers: mau,
    retentionRate,
    retentionBase: eligible,
    sessions: rows.length,
    daily,
    devices: breakdown("device"),
    languages: breakdown("language"),
    zips: breakdown("zip_code"),
    allZips: (() => {
      const m2 = new Map<string, Set<string>>();
      for (const r of rows) {
        const v = (r.zip_code || "").trim();
        if (!v) continue;
        const s = m2.get(v) ?? new Set<string>();
        s.add(r.visitor_id);
        m2.set(v, s);
      }
      return [...m2.entries()]
        .map(([zip, s]) => ({ zip, count: s.size }))
        .sort((a, b) => b.count - a.count);
    })(),
  };
}

function AnalyticsPage() {
  const { user, isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [topResources, setTopResources] = useState<TopResource[] | null>(null);
  const [topShared, setTopShared] = useState<TopShared[] | null>(null);
  const [searchStats, setSearchStats] = useState<SearchAnalytics | null>(null);
  const [catPerf, setCatPerf] = useState<CategoryPerf[] | null>(null);
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    const since = new Date(Date.now() - 120 * DAY).toISOString();
    const [
      { data, error: sessionsError },
      { data: topData, error: topError },
      { data: sharedData, error: sharedError },
      { data: searchData },
      { data: catData },
      { data: eventData },
    ] = await Promise.all([
      supabase
        .from("analytics_sessions")
        .select("visitor_id,occurred_at,is_first_visit,device,language,zip_code")
        .gte("occurred_at", since)
        .order("occurred_at", { ascending: false })
        .limit(20000),
      supabase.rpc("top_resources", { _limit: 10 }),
      supabase.rpc("top_shared_resources", { _limit: 10 }),
      supabase.rpc("search_analytics", { _days: 30 }),
      supabase.rpc("category_performance", { _days: 30 }),
      supabase.rpc("event_submission_stats", { _weeks: 12 }),
    ]);
    if (sessionsError) setError(sessionsError.message);
    else if (topError) setError(topError.message);
    else if (sharedError) setError(sharedError.message);
    else {
      setError(null);
      setRows((data ?? []) as Row[]);
      setTopResources((topData as TopResource[] | null) ?? []);
      setTopShared((sharedData as TopShared[] | null) ?? []);
      setSearchStats((searchData as unknown as SearchAnalytics | null) ?? null);
      setCatPerf((catData as CategoryPerf[] | null) ?? []);
      setEventStats((eventData as unknown as EventStats | null) ?? null);
    }
    setBusy(false);
  };

  useEffect(() => {
    if (isAdmin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const m = useMemo(() => computeMetrics(rows ?? []), [rows]);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto p-12 text-center text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AppShell>
        <div className="max-w-sm mx-auto px-4 py-12 text-center space-y-4">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            {user
              ? "This dashboard is limited to admin accounts."
              : "Sign in with an admin account to continue."}
          </p>
          {!user && (
            <Link
              to="/auth"
              className="inline-block py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold"
            >
              Sign in
            </Link>
          )}
        </div>
      </AppShell>
    );
  }

  const maxVisits = Math.max(1, ...m.daily.map((d) => d.visits));

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/admin"
            className="no-min-h inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <button
            onClick={() => void load()}
            disabled={busy}
            className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-secondary disabled:opacity-50 min-h-[40px]"
          >
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <header>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anonymous visit data from the last 120 days · {m.sessions.toLocaleString()} sessions
            recorded
          </p>
        </header>

        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard
            icon={<Users className="h-4 w-4" />}
            title="Total users"
            value={m.totalUsers.toLocaleString()}
            hint="Unique visitors"
          />
          <MetricCard
            icon={<UserPlus className="h-4 w-4" />}
            title="New users (7d)"
            value={m.newUsersThisWeek.toLocaleString()}
            hint="First visit this week"
          />
          <MetricCard
            icon={<Activity className="h-4 w-4" />}
            title="Weekly active"
            value={m.weeklyActiveUsers.toLocaleString()}
            hint="≥1 session in 7 days"
          />
          <MetricCard
            icon={<CalendarRange className="h-4 w-4" />}
            title="Monthly active"
            value={m.monthlyActiveUsers.toLocaleString()}
            hint="≥1 session in 30 days"
          />
          <MetricCard
            icon={<Repeat className="h-4 w-4" />}
            title="7-day retention"
            value={`${m.retentionRate}%`}
            hint={`${m.retentionBase.toLocaleString()} users eligible`}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-bold mb-3">Daily visits (last 30 days)</h2>
          {m.daily.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
          ) : (
            <div
              className="flex items-end gap-1 h-40"
              role="img"
              aria-label="Daily visit chart for the last 30 days"
            >
              {m.daily.map((d) => (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col justify-end"
                  title={`${d.day}: ${d.visits} visits, ${d.visitors} visitors`}
                >
                  <div
                    className="rounded-t bg-primary"
                    style={{ height: `${(d.visits / maxVisits) * 100}%`, minHeight: 3 }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-bold">Top 10 most viewed resources</h2>
          </div>
          {topResources === null || topResources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resource views recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-semibold">Resource</th>
                    <th className="pb-2 font-semibold">Category</th>
                    <th className="pb-2 font-semibold text-right">Views</th>
                    <th className="pb-2 font-semibold text-right">Clicks</th>
                    <th className="pb-2 font-semibold text-right">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {topResources.map((r, i) => {
                    const resource = RESOURCES.find((res) => res.id === r.resource_id);
                    const name = resource?.name.en ?? r.resource_id;
                    return (
                      <tr key={r.resource_id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-xs font-bold tabular-nums">
                              {i + 1}
                            </span>
                            <Link
                              to="/resource/$id"
                              params={{ id: r.resource_id }}
                              className="font-medium hover:underline line-clamp-1"
                            >
                              {name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 capitalize text-muted-foreground">
                          {r.category ?? "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {r.views.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {r.clicks.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">{r.conversion_rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-bold">Most shared resources</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Resources residents pass along to neighbors via text message or WhatsApp.
          </p>
          {topShared === null || topShared.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shares recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-semibold">Resource</th>
                    <th className="pb-2 font-semibold">Category</th>
                    <th className="pb-2 font-semibold text-right">Total shares</th>
                    <th className="pb-2 font-semibold">Share method</th>
                  </tr>
                </thead>
                <tbody>
                  {topShared.map((r, i) => {
                    const resource = RESOURCES.find((res) => res.id === r.resource_id);
                    const name = resource?.name.en ?? r.resource_id;
                    const total = Math.max(1, Number(r.total_shares));
                    const sms = Number(r.sms_shares);
                    const wa = Number(r.whatsapp_shares);
                    const other = Number(r.other_shares);
                    return (
                      <tr key={r.resource_id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-xs font-bold tabular-nums">
                              {i + 1}
                            </span>
                            <Link
                              to="/resource/$id"
                              params={{ id: r.resource_id }}
                              className="font-medium hover:underline line-clamp-1"
                            >
                              {name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 capitalize text-muted-foreground">
                          {r.category ?? "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {Number(r.total_shares).toLocaleString()}
                        </td>
                        <td className="py-2.5 min-w-[190px]">
                          <div
                            className="flex h-2 w-full overflow-hidden rounded-full bg-secondary"
                            aria-hidden="true"
                          >
                            <div
                              className="bg-primary"
                              style={{ width: `${(sms / total) * 100}%` }}
                            />
                            <div
                              className="bg-success"
                              style={{ width: `${(wa / total) * 100}%` }}
                            />
                            <div
                              className="bg-muted-foreground/40"
                              style={{ width: `${(other / total) * 100}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            SMS {sms} · WhatsApp {wa}
                            {other > 0 ? ` · Other ${other}` : ""}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-bold">Search analytics</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Last 30 days. Zero-result searches show gaps in the resource data.
          </p>
          {!searchStats || searchStats.total === 0 ? (
            <p className="text-sm text-muted-foreground">No searches recorded yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <MiniStat label="Searches" value={searchStats.total.toLocaleString()} />
                <MiniStat
                  label="Result rate"
                  value={`${Math.round((searchStats.with_results / Math.max(1, searchStats.total)) * 100)}%`}
                />
                <MiniStat label="Zero-result" value={searchStats.zero_results.toLocaleString()} />
                <MiniStat
                  label="AI vs keyword"
                  value={`${searchStats.ai_searches} / ${searchStats.fuzzy_searches}`}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Top 10 search queries</h3>
                  {searchStats.top_queries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No queries yet.</p>
                  ) : (
                    <ol className="space-y-1.5">
                      {searchStats.top_queries.map((q, i) => (
                        <li
                          key={q.query}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="truncate">
                            <span className="text-muted-foreground tabular-nums mr-2">
                              {i + 1}.
                            </span>
                            {q.query}
                          </span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {q.searches} · avg {q.avg_results} results
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Zero-result searches (data gaps)</h3>
                  {searchStats.top_zero_queries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Every search returned something. 🎉
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {searchStats.top_zero_queries.map((q) => (
                        <li
                          key={q.query}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="truncate">{q.query}</span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {q.searches}×
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-bold">Category performance</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            High views with low conversion can mean incomplete or outdated listings. Low views may
            need promotion or more content.
          </p>
          {catPerf === null || catPerf.length === 0 ? (
            <p className="text-sm text-muted-foreground">No category activity recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-semibold">Category</th>
                    <th className="pb-2 font-semibold text-right">Views</th>
                    <th className="pb-2 font-semibold text-right">Clicks</th>
                    <th className="pb-2 font-semibold text-right">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {catPerf.map((c) => {
                    const rate = Number(c.conversion_rate);
                    return (
                      <tr key={c.category} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-3 capitalize font-medium">{c.category}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {Number(c.views).toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums">
                          {Number(c.clicks).toLocaleString()}
                        </td>
                        <td
                          className={`py-2.5 text-right tabular-nums font-semibold ${rate < 30 ? "text-destructive" : ""}`}
                        >
                          {rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-bold">Event submissions</h2>
          </div>
          {!eventStats || eventStats.total === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events submitted in the last 12 weeks.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <MiniStat label="Total submitted" value={eventStats.total.toLocaleString()} />
                <MiniStat
                  label="Community submitted"
                  value={eventStats.community_submitted.toLocaleString()}
                />
                <MiniStat label="Approved" value={eventStats.approved.toLocaleString()} />
                <MiniStat label="Pending review" value={eventStats.pending.toLocaleString()} />
              </div>

              <h3 className="text-sm font-semibold mb-2">Events by week (last 12 weeks)</h3>
              {eventStats.by_week.length === 0 ? (
                <p className="text-sm text-muted-foreground">No weekly data.</p>
              ) : (
                <div
                  className="flex items-end gap-1.5 h-32"
                  role="img"
                  aria-label="Event submissions by week"
                >
                  {eventStats.by_week.map((w) => {
                    const max = Math.max(1, ...eventStats.by_week.map((x) => x.count));
                    return (
                      <div
                        key={w.week}
                        className="flex-1 flex flex-col justify-end items-center gap-1"
                        title={`Week of ${w.week}: ${w.count} events`}
                      >
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {w.count}
                        </span>
                        <div
                          className="w-full rounded-t bg-accent"
                          style={{ height: `${(w.count / max) * 100}%`, minHeight: 3 }}
                        />
                        <span className="text-[9px] text-muted-foreground">{w.week.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <h3 className="text-sm font-semibold mt-5 mb-2">Events by category</h3>
              <Breakdown
                title=""
                items={eventStats.by_category.map((c) => ({ name: c.category, count: c.count }))}
                bare
              />
            </>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-bold">User location data</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Based on the ZIP code residents choose in the app — approximate, never precise location.
          </p>
          {m.allZips.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ZIP codes recorded yet.</p>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              <UserZipMap data={m.allZips} />
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold mb-2">ZIP codes by users</h3>
                  <Breakdown
                    title=""
                    items={m.allZips.slice(0, 12).map((z) => ({ name: z.zip, count: z.count }))}
                    bare
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Community board breakdown</h3>
                  <Breakdown title="" items={boardCounts(m.allZips)} bare />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="grid sm:grid-cols-3 gap-3">
          <Breakdown title="Devices" items={m.devices} />
          <Breakdown title="Languages" items={m.languages} />
          <Breakdown title="Top zip codes" items={m.zips} />
        </section>

        <p className="text-xs text-muted-foreground">
          Visits are logged anonymously with a device-local random code. No names, emails, or IP
          addresses are stored. Page views, referrers, and custom events (searches, calls,
          directions) are also tracked in the privacy-friendly analytics provider configured for
          this site.
        </p>
      </div>
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function boardCounts(zips: { zip: string; count: number }[]) {
  const m = new Map<string, number>();
  for (const z of zips) {
    const boards = ZIP_MAP[z.zip]?.cb ?? [];
    for (const b of boards) m.set(b, (m.get(b) ?? 0) + z.count);
  }
  return [...m.entries()]
    .map(([name, count]) => ({ name: `Community Board ${name.replace("CB", "")}`, count }))
    .sort((a, b) => b.count - a.count);
}

function Breakdown({
  title,
  items,
  bare,
}: {
  title: string;
  items: { name: string; count: number }[];
  bare?: boolean;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className={bare ? "" : "rounded-2xl border border-border bg-card p-4"}>
      {title && <h2 className="font-bold mb-3">{title}</h2>}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{i.name}</span>
                <span className="font-semibold tabular-nums">{i.count.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(i.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
