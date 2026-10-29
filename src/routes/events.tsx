import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitCommunityEvent } from "@/lib/events.functions";
import { AppShell } from "@/features/shell";
import { EventCard, type EventSummary } from "@/features/events";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Loader2,
  ArrowLeft,
  List,
  CalendarRange,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  PartyPopper,
  Tent,
  Palette,
  Bike,
  Sparkles,
  Pin,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { loadDirectory } from "@/lib/bronx-resources";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Bronx Events | The Bronx App" },
      {
        name: "description",
        content: "Find current and upcoming community events across the Bronx.",
      },
      { property: "og:title", content: "Bronx Events | The Bronx App" },
      {
        property: "og:description",
        content: "Find current and upcoming community events across the Bronx.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  staticData: { sitemap: true },
  component: EventsPage,
});

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

const EVENT_TYPES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "block_party", label: "Block Party", icon: PartyPopper },
  { id: "festival", label: "Festival", icon: Tent },
  { id: "arts_culture", label: "Arts / Culture", icon: Palette },
  { id: "recreation", label: "Recreation", icon: Bike },
  { id: "holiday", label: "Holiday", icon: Sparkles },
  { id: "other", label: "Other", icon: Pin },
];

/** Ruled list: hairlines between rows and under the last one, no box. */
const LIST = "divide-y divide-border border-b border-border";

/** Editorial tab: a bold label with a rule under the active one. */
const TAB =
  "no-min-h simplified-exempt -mb-px inline-flex h-11 items-center gap-1.5 border-b-2 text-sm font-bold transition-colors";

/** The page's one solid button. */
const PRIMARY =
  "no-min-h inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary-fill px-5 font-bold text-primary-fill-foreground transition-colors hover:bg-primary-fill-hover disabled:opacity-60";

/** Secondary: a 2px ink outline that fills on hover. */
const OUTLINE =
  "no-min-h inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-border px-4 text-sm font-bold text-foreground transition-colors hover:bg-secondary";

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
          .select(
            "id,title,description,event_type,category,event_date,event_time,location,address,is_free,cost,website,is_verified,is_community_submitted",
          )
          .eq("approval_status", "approved")
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(100),
        loadDirectory(),
      ]);
      const submitted = ((data as Omit<EventRow, "event_end_date">[]) ?? []).map((event) => ({
        ...event,
        event_end_date: null,
      }));
      const imported = directory
        .filter(
          (resource) =>
            resource.resource_category === "community_events" &&
            resource.event_date &&
            (resource.event_end_date ?? resource.event_date) >= today,
        )
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
      <div className="mx-auto max-w-5xl px-4 pt-3 pb-6 lg:pt-8">
        <Link
          to="/"
          className="no-min-h inline-flex h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Home
        </Link>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="max-w-2xl">
            <h1 className="text-[2.5rem] leading-[0.95] text-foreground sm:text-6xl">
              Events in the <span className="text-primary">Bronx</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Block parties, festivals, and hyper-local events — the ones only Bronx locals would
              know about.
            </p>
          </div>
          <button type="button" onClick={() => setShowForm(true)} className={PRIMARY}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Submit an Event
          </button>
        </div>

        <div className="mt-5 flex gap-6 border-b border-border">
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={cn(
              TAB,
              view === "list"
                ? "border-primary text-primary"
                : "border-transparent text-foreground hover:border-foreground",
            )}
          >
            <List className="h-4 w-4" aria-hidden="true" /> List
          </button>
          <button
            type="button"
            aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
            className={cn(
              TAB,
              view === "calendar"
                ? "border-primary text-primary"
                : "border-transparent text-foreground hover:border-foreground",
            )}
          >
            <CalendarRange className="h-4 w-4" aria-hidden="true" /> Calendar
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip selected={!typeFilter} onClick={() => setTypeFilter(null)} className="h-11">
            All
          </Chip>
          {EVENT_TYPES.map((t) => (
            <Chip
              key={t.id}
              icon={t.icon}
              selected={typeFilter === t.id}
              onClick={() => setTypeFilter(t.id === typeFilter ? null : t.id)}
              className="h-11"
            >
              {t.label}
            </Chip>
          ))}
        </div>

        {rows === null ? (
          <div
            className="mt-8 flex items-center gap-2 border-y border-border py-4 text-muted-foreground"
            aria-busy="true"
          >
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading events…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={CalendarDays}
            title="No upcoming events match this filter yet. Be the first to submit one!"
          />
        ) : view === "calendar" ? (
          <CalendarView items={filtered} />
        ) : (
          <>
            <EventSection id="events-week" title="Upcoming This Week" items={thisWeek} />
            <EventSection id="events-month" title="Upcoming This Month" items={thisMonth} />
            <EventSection id="events-later" title="Later" items={later} />
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
  const selectedEvents = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-2 pt-2">
        <button
          type="button"
          onClick={() => setMonthOffset((v) => v - 1)}
          className={cn(OUTLINE, "px-3")}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Prev
        </button>
        <h2 className="text-center text-lg font-bold text-foreground sm:text-2xl">{monthLabel}</h2>
        <button
          type="button"
          onClick={() => setMonthOffset((v) => v + 1)}
          className={cn(OUTLINE, "px-3")}
        >
          Next <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
      {/* Bleeds a little on phones so each day stays a 44px target. */}
      <div className="-mx-2 sm:mx-0">
        <div className="grid grid-cols-7 text-center text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="label-caps min-w-0 overflow-hidden py-1 [html.simplified_&]:tracking-normal [html.simplified_&]:normal-case"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-s border-t border-border">
          {cells.map((d, i) => {
            if (d === null)
              return (
                <div
                  key={i}
                  className="aspect-square border-e border-b border-border sm:aspect-auto sm:h-20"
                />
              );
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const dayEvents = byDate.get(key) ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selected;
            return (
              <button
                key={i}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(isSelected ? null : key)}
                className={cn(
                  "simplified-exempt flex aspect-square min-w-0 flex-col items-start border-e border-b border-border p-1 text-start transition-colors sm:aspect-auto sm:h-20",
                  isSelected
                    ? "bg-primary-fill text-primary-fill-foreground"
                    : isToday
                      ? "bg-secondary text-foreground hover:bg-secondary/70"
                      : "hover:bg-secondary",
                  dayEvents.length > 0
                    ? "font-bold"
                    : !isSelected && !isToday && "text-muted-foreground",
                )}
              >
                <span className={cn("text-sm", isToday && "font-extrabold underline")}>{d}</span>
                {dayEvents.length > 0 && (
                  <span className="mt-0.5 flex flex-wrap gap-0.5">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          isSelected ? "bg-current" : "bg-primary-fill",
                        )}
                        aria-hidden
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {selected && (
        <div className="mt-8">
          <h3 className="pt-2 text-lg font-bold text-foreground">
            {new Date(selected + "T12:00:00").toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {selectedEvents.length === 0 ? (
            <EmptyState className="mt-1" icon={CalendarDays} title="No events on this day." />
          ) : (
            <ul className={LIST}>
              {selectedEvents.map((e) => (
                <li key={e.id}>
                  <EventCard event={toSummary(e)} detail="full" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function EventSection({ id, title, items }: { id: string; title: string; items: EventRow[] }) {
  if (items.length === 0) return null;
  return (
    <Section id={id} title={title} ruled className="px-0">
      <ul className={LIST}>
        {items.map((e) => (
          <li key={e.id}>
            <EventCard event={toSummary(e)} detail="full" />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The events table stores yes/no flags; the shared card speaks verification statuses. */
function toSummary(e: EventRow): EventSummary {
  return {
    ...e,
    verification_status: e.is_verified
      ? "verified_by_bronx_app"
      : e.is_community_submitted
        ? "community_submitted"
        : "needs_verification",
  };
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
          cost:
            v.is_free === "free" ? "Free" : v.is_free === "donation" ? "Donation" : v.cost || null,
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-event-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 border-b border-border bg-card p-5">
          <h2 id="submit-event-title" className="text-2xl font-bold text-foreground">
            Submit a Local Event
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reviewed within 24–48 hours. Thank you for helping your neighbors!
          </p>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <CircleCheck className="mx-auto mb-3 h-10 w-10 text-success" aria-hidden="true" />
            <p className="text-lg font-bold">Thanks — we got it!</p>
            <p className="mt-1 text-sm text-muted-foreground">Your event is pending review.</p>
            <button type="button" onClick={onClose} className={cn(PRIMARY, "mt-5")}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3 p-5">
            <Field label="Event Name *">
              <input name="title" required maxLength={120} className={inp} />
            </Field>
            <Field label="Event Type *">
              <select name="event_type" required className={inp} defaultValue="block_party">
                {EVENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date *">
                <input type="date" name="event_date" required className={inp} />
              </Field>
              <Field label="Time">
                <input name="event_time" placeholder="e.g. 3:00 PM" className={inp} />
              </Field>
            </div>
            <Field label="Location Name">
              <input name="location" className={inp} placeholder="e.g. Andrew Freedman Home" />
            </Field>
            <Field label="Address">
              <input name="address" className={inp} placeholder="Street, Bronx, NY" />
            </Field>
            <Field label="Description">
              <textarea
                name="description"
                rows={3}
                maxLength={2000}
                className={cn(inp, "h-auto py-2")}
              />
            </Field>
            <Field label="Cost">
              <select name="is_free" className={inp} defaultValue="free">
                <option value="free">Free</option>
                <option value="donation">Donation</option>
                <option value="paid">Paid</option>
              </select>
            </Field>
            <Field label="Cost detail (optional)">
              <input name="cost" className={inp} placeholder="$5 suggested" />
            </Field>
            <Field label="Contact / Website">
              <input name="website" className={inp} placeholder="https://…" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Your Name">
                <input name="submitted_by" className={inp} />
              </Field>
              <Field label="Your Email">
                <input name="submitted_email" type="email" className={inp} />
              </Field>
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className={OUTLINE}>
                Cancel
              </button>
              <button type="submit" disabled={busy} className={PRIMARY}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Submit
                Event
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inp =
  "h-11 w-full min-w-0 rounded-md border border-border bg-background px-3 text-foreground focus:border-foreground focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-foreground">{label}</span>
      {children}
    </label>
  );
}
