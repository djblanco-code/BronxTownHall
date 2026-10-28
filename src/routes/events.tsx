import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitCommunityEvent } from "@/lib/events.functions";
import { AppShell } from "@/features/shell";
import { supabase } from "@/integrations/supabase/client";
import { buildIcs, downloadIcs } from "@/lib/civic-data";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, MapPin, Share2, Plus, Check, Loader2, ArrowLeft, List, CalendarRange } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { trackEventViewed, trackEventShared, trackEventSaved, trackEventRsvp } from "@/lib/track-event";
import { loadDirectory } from "@/lib/bronx-resources";
import { VerifiedPill } from "@/components/VerifiedPill";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Bronx Events | The Bronx App" },
      { name: "description", content: "Find current and upcoming community events across the Bronx." },
      { property: "og:title", content: "Bronx Events | The Bronx App" },
      { property: "og:description", content: "Find current and upcoming community events across the Bronx." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  staticData: { sitemap: true }, component: EventsPage });

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  category: string | null;
  event_date: string;
  event_end_date: string | null;
  event_time: string | null;
  location: string | null;
  address: string | null;
  is_free: boolean;
  cost: string | null;
  website: string | null;
  is_verified: boolean;
  is_community_submitted: boolean;
};

const EVENT_TYPES = [
  { id: "block_party", label: "Block Party", emoji: "🎉" },
  { id: "festival", label: "Festival", emoji: "🎪" },
  { id: "arts_culture", label: "Arts / Culture", emoji: "🎨" },
  { id: "recreation", label: "Recreation", emoji: "🏃" },
  { id: "holiday", label: "Holiday", emoji: "✨" },
  { id: "other", label: "Other", emoji: "📌" },
];

function EventsPage() {
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data }, directory] = await Promise.all([
        supabase
          .from("events")
          .select("id,title,description,event_type,category,event_date,event_time,location,address,is_free,cost,website,is_verified,is_community_submitted")
          .eq("approval_status", "approved")
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(100),
        loadDirectory(),
      ]);
      const submitted = ((data as Omit<EventRow, "event_end_date">[]) ?? []).map((event) => ({ ...event, event_end_date: null }));
      const imported = directory
        .filter((resource) => resource.resource_category === "community_events" && resource.event_date && (resource.event_end_date ?? resource.event_date) >= today)
        .map<EventRow>((resource) => ({
          id: `bx-${resource.id}`,
          title: resource.resource_name || resource.organization_name,
          description: resource.description,
          event_type: "other",
          category: resource.resource_subcategory,
          event_date: resource.event_date as string,
          event_end_date: resource.event_end_date ?? null,
          event_time: resource.event_time ?? null,
          location: resource.neighborhood,
          address: resource.address,
          is_free: true,
          cost: null,
          website: resource.website,
          is_verified: false,
          is_community_submitted: false,
        }));
      setRows([...submitted, ...imported].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    })();
  }, []);

  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  const monthEnd = new Date(now.getTime() + 31 * 24 * 3600 * 1000);

  const filtered = useMemo(
    () => (rows ?? []).filter((r) => !typeFilter || r.event_type === typeFilter),
    [rows, typeFilter],
  );
  const thisWeek = filtered.filter((r) => new Date(r.event_date) <= weekEnd);
  const thisMonth = filtered.filter(
    (r) => new Date(r.event_date) > weekEnd && new Date(r.event_date) <= monthEnd,
  );
  const later = filtered.filter((r) => new Date(r.event_date) > monthEnd);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/" className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">🎉 Events in the Bronx</h1>
            <p className="text-muted-foreground mt-1">
              Block parties, festivals, and hyper-local events — the ones only Bronx locals would know about.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="no-min-h inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-md font-semibold hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" /> Submit an Event
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex rounded-full border border-border overflow-hidden">
            <button onClick={() => setView("list")} className={`no-min-h px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 ${view === "list" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>
              <List className="h-4 w-4" /> List
            </button>
            <button onClick={() => setView("calendar")} className={`no-min-h px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 ${view === "calendar" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>
              <CalendarRange className="h-4 w-4" /> Calendar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Chip active={!typeFilter} onClick={() => setTypeFilter(null)}>All</Chip>
          {EVENT_TYPES.map((t) => (
            <Chip key={t.id} active={typeFilter === t.id} onClick={() => setTypeFilter(t.id === typeFilter ? null : t.id)}>
              <span className="me-1">{t.emoji}</span> {t.label}
            </Chip>
          ))}
        </div>

        {rows === null ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8"><Loader2 className="h-5 w-5 animate-spin" /> Loading events…</div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground py-8">No upcoming events match this filter yet. Be the first to submit one!</p>
        ) : view === "calendar" ? (
          <CalendarView items={filtered} />
        ) : (
          <>
            <Section title="Upcoming This Week" items={thisWeek} />
            <Section title="Upcoming This Month" items={thisMonth} />
            <Section title="Later" items={later} />
          </>
        )}
      </div>

      {showForm && <SubmitEventModal onClose={() => setShowForm(false)} />}
    </AppShell>
  );
}

function CalendarView({ items }: { items: EventRow[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const base = new Date();
  const view = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();
  const monthLabel = view.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = new Map<string, EventRow[]>();
  for (const e of items) {
    const key = e.event_date;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(e);
  }
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const [selected, setSelected] = useState<string | null>(null);
  const selectedEvents = selected ? byDate.get(selected) ?? [] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonthOffset((v) => v - 1)} className="no-min-h px-3 py-2 rounded-full border border-border hover:bg-secondary text-sm font-medium">← Prev</button>
        <h2 className="text-lg font-bold">{monthLabel}</h2>
        <button onClick={() => setMonthOffset((v) => v + 1)} className="no-min-h px-3 py-2 rounded-full border border-border hover:bg-secondary text-sm font-medium">Next →</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="aspect-square" />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayEvents = byDate.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selected;
          return (
            <button
              key={i}
              onClick={() => setSelected(isSelected ? null : key)}
              className={`aspect-square rounded-lg border p-1 text-left transition ${
                isSelected ? "border-primary bg-primary/10" : isToday ? "border-accent bg-accent/10" : "border-border bg-card hover:border-primary/50"
              } ${dayEvents.length > 0 ? "font-bold" : "text-muted-foreground"}`}
            >
              <div className="text-sm">{d}</div>
              {dayEvents.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <span key={idx} className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-6">
          <h3 className="font-bold mb-3">{new Date(selected + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
          {selectedEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events on this day.</p>
          ) : (
            <ul className="space-y-3">{selectedEvents.map((e) => <EventCard key={e.id} e={e} />)}</ul>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: EventRow[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">── {title} ──</h2>
      <ul className="space-y-3">
        {items.map((e) => <EventCard key={e.id} e={e} />)}
      </ul>
    </section>
  );
}

function EventCard({ e }: { e: EventRow }) {
  const meta = EVENT_TYPES.find((t) => t.id === e.event_type);
  const cardRef = useRef<HTMLLIElement | null>(null);
  const seen = useRef(false);

  // Events render as cards (no detail route) — count a view the first time a
  // card is actually visible on screen.
  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting && !seen.current) {
          seen.current = true;
          trackEventViewed({ eventId: e.id, category: e.category ?? e.event_type, date: e.event_date });
          obs.disconnect();
        }
      }
    }, { threshold: 0.5 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [e.id, e.category, e.event_type, e.event_date]);

  const d = new Date(e.event_date + "T12:00:00");
  const startLabel = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const endLabel = e.event_end_date
    ? new Date(e.event_end_date + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;
  const dateLabel = endLabel ? `${startLabel}–${endLabel}` : startLabel;

  const onAddToCal = () => {
    trackEventSaved({ eventId: e.id, eventDate: e.event_date });
    const dt = new Date(e.event_date + "T" + (parseTime(e.event_time) || "12:00:00"));
    downloadIcs(
      e.title,
      buildIcs({
        title: e.title,
        description: e.description ?? "",
        location: e.address || e.location || "Bronx, NY",
        date: dt,
        durationMinutes: 120,
      }),
    );
  };

  const onShare = async () => {
    const shareData = { title: e.title, text: `${e.title} · ${dateLabel} · ${e.location ?? ""}`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); trackEventShared({ eventId: e.id, method: "native" }); } catch { /* ignored */ }
    } else {
      await navigator.clipboard.writeText(`${shareData.text} — ${shareData.url}`);
      trackEventShared({ eventId: e.id, method: "copy" });
      alert("Link copied to clipboard!");
    }
  };

  return (
    <li ref={cardRef} className="rounded-2xl border-2 border-border bg-card p-4 hover:border-primary transition">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{meta?.emoji ?? "📅"}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide text-accent font-semibold">
            {dateLabel}{e.event_time ? ` · ${e.event_time}` : ""}
          </p>
          <p className="font-bold text-foreground mt-0.5 text-lg flex items-center gap-2 flex-wrap">
            {e.title}
            {e.is_verified && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">
                <Check className="h-3 w-3" /> Verified
              </span>
            )}
            {e.is_community_submitted && !e.is_verified && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-semibold">
                Community Submitted
              </span>
            )}
            {e.id.startsWith("bx-") && (
              <VerifiedPill compact category="events" status="needs_verification" lastVerified={null} source={null} />
            )}
          </p>
          {e.description && <p className="text-sm text-muted-foreground mt-1">{e.description}</p>}
          {(e.location || e.address) && (
            <p className="text-sm text-muted-foreground mt-2 inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {e.location}{e.address ? ` — ${e.address}` : ""}
            </p>
          )}
          <p className="text-sm mt-1 font-medium">
            {e.is_free ? "Free" : "Paid"}{e.cost ? ` · ${e.cost}` : ""}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={onAddToCal} className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-secondary hover:bg-secondary/70">
              <CalendarDays className="h-4 w-4" /> Add to Calendar
            </button>
            <button onClick={onShare} className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-secondary hover:bg-secondary/70">
              <Share2 className="h-4 w-4" /> Share
            </button>
            {e.website && (
              <a href={e.website} target="_blank" rel="noreferrer" onClick={() => trackEventRsvp({ eventId: e.id, organization: e.location })} className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20">
                RSVP / Website ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function parseTime(t: string | null): string | null {
  if (!t) return null;
  const m = t.trim().match(/^(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ?? "00";
  const p = m[3]?.toLowerCase();
  if (p === "pm" && h < 12) h += 12;
  if (p === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}:00`;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`no-min-h px-4 py-2 rounded-full text-sm font-medium border transition ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

const submitSchema = z.object({
  title: z.string().trim().min(3).max(120),
  event_type: z.string(),
  event_date: z.string().min(1),
  event_time: z.string().max(30).optional(),
  location: z.string().max(200).optional(),
  address: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  is_free: z.enum(["free", "donation", "paid"]),
  cost: z.string().max(60).optional(),
  website: z.string().max(300).optional(),
  submitted_by: z.string().max(120).optional(),
  submitted_email: z.string().email().max(200).optional().or(z.literal("")),
});

function SubmitEventModal({ onClose }: { onClose: () => void }) {
  const submitEvent = useServerFn(submitCommunityEvent);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = submitSchema.safeParse(raw);
    if (!parsed.success) {
      setErr(parsed.error.errors[0]?.message ?? "Please fill required fields.");
      return;
    }
    const v = parsed.data;
    setBusy(true);
    try {
      await submitEvent({
        data: {
          title: v.title,
          description: v.description || null,
          event_type: v.event_type,
          event_date: v.event_date,
          event_time: v.event_time || null,
          location: v.location || null,
          address: v.address || null,
          is_free: v.is_free !== "paid",
          cost: v.is_free === "free" ? "Free" : v.is_free === "donation" ? "Donation" : (v.cost || null),
          website: v.website || null,
          submitted_by: v.submitted_by || null,
          submitted_email: v.submitted_email || null,
        },
      });
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not submit right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 sticky top-0 bg-card border-b border-border">
          <h2 className="text-xl font-bold">Submit a Local Event</h2>
          <p className="text-sm text-muted-foreground">Reviewed within 24–48 hours. Thank you for helping your neighbors!</p>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold text-lg">Thanks — we got it!</p>
            <p className="text-sm text-muted-foreground mt-1">Your event is pending review.</p>
            <button onClick={onClose} className="no-min-h mt-5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold">Close</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-5 space-y-3">
            <Field label="Event Name *"><input name="title" required maxLength={120} className={inp} /></Field>
            <Field label="Event Type *">
              <select name="event_type" required className={inp} defaultValue="block_party">
                {EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date *"><input type="date" name="event_date" required className={inp} /></Field>
              <Field label="Time"><input name="event_time" placeholder="e.g. 3:00 PM" className={inp} /></Field>
            </div>
            <Field label="Location Name"><input name="location" className={inp} placeholder="e.g. Andrew Freedman Home" /></Field>
            <Field label="Address"><input name="address" className={inp} placeholder="Street, Bronx, NY" /></Field>
            <Field label="Description"><textarea name="description" rows={3} maxLength={2000} className={inp} /></Field>
            <Field label="Cost">
              <select name="is_free" className={inp} defaultValue="free">
                <option value="free">Free</option>
                <option value="donation">Donation</option>
                <option value="paid">Paid</option>
              </select>
            </Field>
            <Field label="Cost detail (optional)"><input name="cost" className={inp} placeholder="$5 suggested" /></Field>
            <Field label="Contact / Website"><input name="website" className={inp} placeholder="https://…" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Your Name"><input name="submitted_by" className={inp} /></Field>
              <Field label="Your Email"><input name="submitted_email" type="email" className={inp} /></Field>
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="no-min-h px-4 py-2.5 rounded-full border border-border font-medium hover:bg-secondary">Cancel</button>
              <button type="submit" disabled={busy} className="no-min-h px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-60 inline-flex items-center gap-2">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit Event
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium mb-1 block">{label}</span>{children}</label>;
}
