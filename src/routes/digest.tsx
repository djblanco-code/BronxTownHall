import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Sparkles,
  Star,
  BellRing,
  PlusCircle,
  Phone,
  Compass,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/features/shell";
import { VerifiedPill } from "@/components/VerifiedPill";
import { supabase } from "@/integrations/supabase/client";
import { loadDirectory, loadRecentActivity, type BronxResource } from "@/lib/bronx-resources";
import { loadRecentPublishedAlerts, formatDeadline, type PolicyAlert } from "@/lib/policy-alerts";
import { bronxToResource, topCategoryFor } from "@/lib/bronx-to-resource";
import { factOfTheDay } from "@/lib/bronx-facts";
import { formatEventDate } from "@/lib/event-windows";
import { blendForDiscovery, hasInterestSignal } from "@/lib/interest-history";
import { CATEGORIES } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";

export const Route = createFileRoute("/digest")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "This Week in the Bronx — Weekly Digest | The Bronx App" },
      {
        name: "description",
        content:
          "A one-page weekly read for Bronx residents: this week's events, benefit deadlines, newly added resources, a Bronx fact, and a neighborhood spotlight.",
      },
      { property: "og:title", content: "This Week in the Bronx — Weekly Digest" },
      {
        property: "og:description",
        content:
          "Events, deadlines, newly added resources, and a neighborhood spotlight — all in one short read.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  staticData: { sitemap: false },
  component: DigestPage,
});

/* ----------------------------- helpers ----------------------------- */

type DigestEvent = {
  id: string;
  linkTo: "/events" | "/resource/$id";
  resourceId?: string;
  title: string;
  category: string | null;
  date: string;
  endDate: string | null;
  time: string | null;
  place: string | null;
  verification: {
    status: "verified_by_bronx_app" | "needs_verification";
    lastVerified: string | null;
  };
};

const LABEL_BY_ID = new Map(CATEGORIES.map((c) => [c.id as string, c] as const));

function categoryLabel(id: string | null | undefined): { emoji: string; name: string } | null {
  const meta = id ? LABEL_BY_ID.get(id) : null;
  if (!meta) return null;
  return { emoji: meta.emoji, name: meta.id.charAt(0).toUpperCase() + meta.id.slice(1) };
}

/** ISO week index — used so the spotlight rotates once a week, not per reload. */
function weekIndex(d = new Date()): number {
  const start = Date.UTC(1970, 0, 5); // a Monday
  return Math.floor(
    (Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / (7 * 86_400_000),
  );
}

function sevenDaysOut(): string {
  return new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
}

/* ------------------------------- page ------------------------------- */

function DigestPage() {
  const { lang } = useI18n();
  const [events, setEvents] = useState<DigestEvent[] | null>(null);
  const [recent, setRecent] = useState<BronxResource[] | null>(null);
  const [alerts, setAlerts] = useState<PolicyAlert[] | null>(null);
  const [spotlight, setSpotlight] = useState<BronxResource | null>(null);
  const [personalized, setPersonalized] = useState(false);

  const fact = useMemo(() => factOfTheDay(), []);

  useEffect(() => {
    setPersonalized(hasInterestSignal());
    let alive = true;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [submitted, directory, recentRows, alertRows] = await Promise.all([
        supabase
          .from("events")
          .select(
            "id,title,category,event_date,event_time,location,neighborhood,verification_status,last_verified",
          )
          .eq("approval_status", "approved")
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(40),
        loadDirectory(),
        loadRecentActivity(14, 40),
        loadRecentPublishedAlerts(3),
      ]);
      if (!alive) return;

      const fromEvents: DigestEvent[] = (
        (submitted.data ?? []) as Array<{
          id: string;
          title: string;
          category: string | null;
          event_date: string;
          event_time: string | null;
          location: string | null;
          neighborhood: string | null;
          verification_status: string | null;
          last_verified: string | null;
        }>
      ).map((e) => ({
        id: `ev-${e.id}`,
        linkTo: "/events" as const,
        title: e.title,
        category: e.category,
        date: e.event_date,
        endDate: null,
        time: e.event_time,
        place: [e.location, e.neighborhood].filter(Boolean).join(" · ") || null,
        verification: {
          status:
            e.verification_status === "verified_by_bronx_app" && e.last_verified
              ? ("verified_by_bronx_app" as const)
              : ("needs_verification" as const),
          lastVerified: e.last_verified ?? null,
        },
      }));

      const fromDirectory: DigestEvent[] = directory
        .filter(
          (r) =>
            r.resource_category === "community_events" &&
            !r.needs_review &&
            r.event_date &&
            (r.event_end_date ?? r.event_date) >= today,
        )
        .map((r) => ({
          id: `bx-${r.id}`,
          linkTo: "/resource/$id" as const,
          resourceId: `bx-${r.id}`,
          title: r.resource_name || r.organization_name,
          category: r.resource_subcategory,
          date: r.event_date as string,
          endDate: r.event_end_date ?? null,
          time: r.event_time ?? null,
          place: [r.address, r.neighborhood].filter(Boolean).join(" · ") || null,
          verification: { status: "needs_verification" as const, lastVerified: null },
        }));

      const upcoming = [...fromEvents, ...fromDirectory].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      // This week first; if the week is thin, the soonest events after it fill in.
      const cutoff = sevenDaysOut();
      const thisWeek = upcoming.filter((e) => e.date <= cutoff);
      const ordered =
        thisWeek.length >= 3 ? [...thisWeek, ...upcoming.filter((e) => e.date > cutoff)] : upcoming;
      setEvents(ordered);

      setRecent(recentRows.filter((r) => !r.needs_review));
      setAlerts(alertRows);

      // Neighborhood spotlight: a real listing with enough substance to read,
      // rotated weekly. Never a paid slot — the pick is purely mechanical.
      const eligible = directory
        .filter(
          (r) =>
            !r.needs_review &&
            r.resource_category !== "community_events" &&
            (r.description ?? "").trim().length >= 80,
        )
        .sort((a, b) => a.id.localeCompare(b.id));
      if (eligible.length > 0) setSpotlight(eligible[weekIndex() % eligible.length]);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const eventPicks = useMemo(() => {
    if (!events) return { picked: [] as DigestEvent[], discoveryIds: new Set<DigestEvent>() };
    return blendForDiscovery(events, (e) => e.category, 5);
  }, [events]);

  const recentPicks = useMemo(() => {
    if (!recent) return { picked: [] as BronxResource[], discoveryIds: new Set<BronxResource>() };
    return blendForDiscovery(recent, (r) => topCategoryFor(r.resource_category), 5);
  }, [recent]);

  const today = new Date().toLocaleDateString(lang === "en" ? "en-US" : lang, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* masthead */}
        <header className="pt-5 pb-4 border-b-2 border-foreground/10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Weekly digest · {today}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-black text-foreground leading-tight">
            This Week in the Bronx
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One short read: what&apos;s happening, what&apos;s closing soon, and what&apos;s new in
            the app.{" "}
            {personalized
              ? "Weighted toward what you browse — with a few picks from outside it on purpose."
              : "A broad mix across every category to start with."}
          </p>
        </header>

        {/* 1. This Week's Events */}
        <Section
          icon={<CalendarDays className="h-5 w-5 text-primary" aria-hidden />}
          title="This Week's Events"
          action={{ to: "/events", label: "All events" }}
        >
          {events === null ? (
            <Loading label="Loading events" />
          ) : eventPicks.picked.length === 0 ? (
            <Empty>No upcoming events listed right now — check back soon.</Empty>
          ) : (
            <ul className="space-y-2.5">
              {eventPicks.picked.map((e) => {
                const badge = categoryLabel(e.category);
                const inner = (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        {formatEventDate(e.date)}
                        {e.endDate && e.endDate !== e.date ? `–${formatEventDate(e.endDate)}` : ""}
                        {e.time ? ` · ${e.time}` : ""}
                      </span>
                      {badge && (
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {badge.emoji} {badge.name}
                        </span>
                      )}
                      {eventPicks.discoveryIds.has(e) && <DiscoveryTag />}
                    </div>
                    <p className="mt-1 font-bold text-foreground leading-snug">{e.title}</p>
                    {e.place && (
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{e.place}</span>
                      </p>
                    )}
                    <div className="mt-1.5">
                      <VerifiedPill
                        compact
                        category="events"
                        status={e.verification.status}
                        lastVerified={e.verification.lastVerified}
                      />
                    </div>
                  </>
                );
                return (
                  <li key={e.id}>
                    {e.linkTo === "/resource/$id" && e.resourceId ? (
                      <Link
                        to="/resource/$id"
                        params={{ id: e.resourceId }}
                        className="no-min-h block rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <Link
                        to="/events"
                        className="no-min-h block rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition"
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* 2. Know Before You Go */}
        <Section
          icon={<BellRing className="h-5 w-5 text-warning" aria-hidden />}
          title="Know Before You Go"
        >
          {alerts === null ? (
            <Loading label="Loading updates" />
          ) : alerts.length === 0 ? (
            <Empty>No deadline or policy updates posted right now — check back.</Empty>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {alerts.map((a) => {
                const badge = categoryLabel(a.category);
                return (
                  <li key={a.id} className="p-3">
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {a.headline}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      {badge && (
                        <span className="font-semibold">
                          {badge.emoji} {badge.name}
                        </span>
                      )}
                      {a.deadline_date && (
                        <span className="font-bold text-warning">
                          {formatDeadline(a.deadline_date)}
                        </span>
                      )}
                      {a.source_url ? (
                        <a
                          href={a.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-min-h font-bold text-primary hover:underline"
                        >
                          Read more →
                        </a>
                      ) : (
                        <Link
                          to="/category/$cat"
                          params={{ cat: a.category }}
                          className="no-min-h font-bold text-primary hover:underline"
                        >
                          Read more →
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* 3. Just Added This Week */}
        <Section
          icon={<PlusCircle className="h-5 w-5 text-success" aria-hidden />}
          title="Just Added This Week"
        >
          {recent === null ? (
            <Loading label="Loading new listings" />
          ) : recentPicks.picked.length === 0 ? (
            <Empty>Nothing new added in the past two weeks.</Empty>
          ) : (
            <ul className="space-y-2.5">
              {recentPicks.picked.map((r) => {
                const view = bronxToResource(r);
                const badge = categoryLabel(view.category);
                return (
                  <li key={r.id}>
                    <Link
                      to="/resource/$id"
                      params={{ id: view.id }}
                      className="no-min-h block rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {badge && (
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {badge.emoji} {badge.name}
                          </span>
                        )}
                        {recentPicks.discoveryIds.has(r) && <DiscoveryTag />}
                      </div>
                      <p className="mt-1 font-bold text-foreground leading-snug">{view.name.en}</p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {view.description.en}
                      </p>
                      <div className="mt-1.5">
                        <VerifiedPill
                          compact
                          category={view.category}
                          status={view.__imported.status}
                          lastVerified={view.__imported.lastVerified}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* 4. Bronx Fact of the Day */}
        <Section
          icon={<Sparkles className="h-5 w-5 text-accent" aria-hidden />}
          title="Bronx Fact of the Day"
        >
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
              {fact.category}
            </p>
            <p className="mt-1.5 text-base font-semibold text-foreground leading-snug">
              {fact.fact}
            </p>
            <Link
              to="/facts"
              className="no-min-h mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              More Bronx facts <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </Section>

        {/* 5. Neighborhood Spotlight */}
        <Section
          icon={<Star className="h-5 w-5 text-warning" aria-hidden />}
          title="Neighborhood Spotlight"
        >
          {spotlight === null ? (
            <Loading label="Loading spotlight" />
          ) : (
            <SpotlightCard row={spotlight} />
          )}
        </Section>

        <p className="mt-8 text-xs text-muted-foreground">
          This page is a view inside the app — nothing is emailed. Everything above comes from live
          listings, so it changes as dates pass and new resources are added.
        </p>
      </div>
    </AppShell>
  );
}

/* ---------------------------- small parts ---------------------------- */

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: { to: "/events"; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6" aria-label={title}>
      <div className="flex items-end justify-between gap-2 mb-2.5">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {action && (
          <Link
            to={action.to}
            className="no-min-h text-sm font-semibold text-primary hover:underline"
          >
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function DiscoveryTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
      <Compass className="h-3 w-3" aria-hidden /> New to you
    </span>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 justify-center py-4 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {label}…
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function SpotlightCard({ row }: { row: BronxResource }) {
  const view = bronxToResource(row);
  const badge = categoryLabel(view.category);
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 flex-wrap">
        {badge && (
          <span className="text-[11px] font-semibold text-muted-foreground">
            {badge.emoji} {badge.name}
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Rotates weekly · not a paid placement
        </span>
      </div>
      <h3 className="mt-1.5 text-xl font-bold text-foreground leading-tight">{view.name.en}</h3>
      {row.neighborhood && (
        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{row.neighborhood}</p>
      )}
      <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{view.description.en}</p>
      {view.requirements?.en && (
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Who it&apos;s for: </span>
          {view.requirements.en}
        </p>
      )}
      <dl className="mt-3 grid gap-1.5 text-xs text-muted-foreground">
        {view.address && (
          <div className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
            <span>{view.address}</span>
          </div>
        )}
        {view.phone && (
          <div className="flex items-start gap-1.5">
            <Phone className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
            <span>{view.phone}</span>
          </div>
        )}
        {view.hours?.en && (
          <div className="flex items-start gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
            <span>{view.hours.en}</span>
          </div>
        )}
      </dl>
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <VerifiedPill
          compact
          category={view.category}
          status={view.__imported.status}
          lastVerified={view.__imported.lastVerified}
        />
        <Link
          to="/resource/$id"
          params={{ id: view.id }}
          className="no-min-h inline-flex items-center gap-1 rounded-full bg-primary-fill px-3.5 py-1.5 text-xs font-bold text-primary-fill-foreground hover:opacity-90"
        >
          See full details <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
