import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, MapPin, Share2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";
import { VerifiedPill } from "@/components/VerifiedPill";
import type { VerificationStatus } from "@/lib/verification";
import { buildIcs, downloadIcs } from "@/lib/ics";
import {
  trackEventRsvp,
  trackEventSaved,
  trackEventShared,
  trackEventViewed,
} from "@/lib/track-event";
import { cn } from "@/lib/utils";

/** An event as every screen shows it, whichever table it came from. */
export type EventSummary = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  /** YYYY-MM-DD */
  event_date: string;
  event_end_date?: string | null;
  event_time?: string | null;
  location?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  is_free: boolean;
  cost?: string | null;
  website?: string | null;
  verification_status: VerificationStatus;
  last_verified?: string | null;
  source?: string | null;
};

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

/** "6:30 PM" → "18:30:00", for the calendar file. */
function parseTime(t: string | null | undefined): string | null {
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

/**
 * The one event card. Compact: a tappable summary that opens the events page
 * (Home's swipeable row). Full: description, cost and calendar/share/RSVP
 * actions (the events page). It draws no box or rule of its own: put cards
 * in a ruled list (`divide-y divide-border border-b border-border`).
 */
export function EventCard({
  event: e,
  detail = "compact",
}: {
  event: EventSummary;
  detail?: "compact" | "full";
}) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.bcp47;
  const full = detail === "full";
  const start = parseDay(e.event_date);
  const when = [
    start.toLocaleDateString(locale, { weekday: "short" }),
    e.event_end_date
      ? `– ${parseDay(e.event_end_date).toLocaleDateString(locale, { month: "short", day: "numeric" })}`
      : null,
    e.event_time,
  ]
    .filter(Boolean)
    .join(" · ")
    .replace(" · –", " –");
  const where = full
    ? [e.location, e.address].filter(Boolean).join(" — ")
    : [e.location, e.neighborhood].filter(Boolean).join(" · ");

  // Full cards have no detail page, so a view counts once the card is on screen.
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!full || !ref.current || typeof IntersectionObserver === "undefined") return;
    let seen = false;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!seen && entries.some((en) => en.isIntersecting)) {
          seen = true;
          trackEventViewed({
            eventId: e.id,
            category: e.category ?? undefined,
            date: e.event_date,
          });
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [full, e.id, e.category, e.event_date]);

  // Like a listings column: month and day on the leading side, everything
  // else lined up under the title.
  const dateColumn = (
    <span aria-hidden="true" className="w-12 shrink-0">
      <span className="label-caps block text-primary">
        {start.toLocaleDateString(locale, { month: "short" })}
      </span>
      <span className="font-display block text-2xl leading-none font-extrabold text-foreground">
        {start.getDate()}
      </span>
    </span>
  );

  const heading = (
    <>
      <p
        className={cn(
          "font-bold leading-snug text-foreground",
          full ? "text-lg" : "line-clamp-2 group-hover:underline",
        )}
      >
        {e.title}
      </p>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">
        <span className="sr-only">
          {start.toLocaleDateString(locale, { month: "long", day: "numeric" })},{" "}
        </span>
        {when}
      </p>
    </>
  );

  const facts = (
    <div className="mt-2 space-y-2">
      {full && e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
      {where && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className={full ? undefined : "truncate"}>{where}</span>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {e.is_free ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
            <Ticket className="h-3.5 w-3.5" aria-hidden="true" /> {t("interface.free")}
          </span>
        ) : (
          full && (
            <span className="text-xs font-semibold text-foreground">
              {t("interface.paid")}
              {e.cost ? ` · ${e.cost}` : ""}
            </span>
          )
        )}
        <VerifiedPill
          compact
          category="events"
          status={e.verification_status}
          lastVerified={e.last_verified ?? null}
          source={e.source ?? null}
        />
      </div>
    </div>
  );

  if (!full) {
    return (
      <Link
        to="/events"
        onClick={() =>
          trackEventViewed({
            eventId: e.id,
            category: e.category ?? undefined,
            date: e.event_date,
          })
        }
        className="no-min-h group flex w-full gap-3 py-3"
      >
        {dateColumn}
        <span className="block min-w-0 flex-1">
          {heading}
          {facts}
        </span>
      </Link>
    );
  }

  const addToCalendar = () => {
    trackEventSaved({ eventId: e.id, eventDate: e.event_date });
    const date = new Date(`${e.event_date}T${parseTime(e.event_time) ?? "12:00:00"}`);
    downloadIcs(
      e.title,
      buildIcs({
        title: e.title,
        description: e.description ?? "",
        location: e.address || e.location || "Bronx, NY",
        date,
        durationMinutes: 120,
      }),
    );
  };

  const share = async () => {
    const text = [e.title, when, e.location].filter(Boolean).join(" · ");
    if (navigator.share) {
      try {
        await navigator.share({ title: e.title, text, url: window.location.href });
        trackEventShared({ eventId: e.id, method: "native" });
      } catch {
        /* share sheet dismissed */
      }
    } else {
      await navigator.clipboard.writeText(`${text} — ${window.location.href}`);
      trackEventShared({ eventId: e.id, method: "copy" });
      toast.success(t("events.linkCopied"));
    }
  };

  const action =
    "no-min-h inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-sm font-bold transition-colors";
  const outline = "border border-border text-foreground hover:bg-secondary";

  return (
    <div ref={ref} className="flex w-full gap-3 py-4">
      {dateColumn}
      <div className="min-w-0 flex-1">
        {heading}
        {facts}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={addToCalendar} className={cn(action, outline)}>
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> {t("addToCalendar")}
          </button>
          <button type="button" onClick={share} className={cn(action, outline)}>
            <Share2 className="h-4 w-4" aria-hidden="true" /> {t("events.share")}
          </button>
          {e.website && (
            <a
              href={e.website}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEventRsvp({ eventId: e.id, organization: e.location })}
              className={cn(action, "text-primary underline underline-offset-4 hover:decoration-2")}
            >
              {t("events.website")}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
