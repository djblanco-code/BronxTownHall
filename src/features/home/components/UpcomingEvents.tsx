import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Ticket } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";
import { VerifiedPill } from "@/components/VerifiedPill";
import type { VerificationStatus } from "@/lib/verification";
import { trackEventViewed } from "@/lib/track-event";
import { Section, SectionAction } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { useUpcomingEvents, type UpcomingEvent } from "../lib/upcoming-events";

const MAX_EVENTS = 6;

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

/**
 * The part of Home that changes week to week. A swipeable row on phones,
 * a grid on desktop.
 */
export function UpcomingEvents({ neighborhood }: { neighborhood: string | null }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.bcp47;
  const { events, failed } = useUpcomingEvents();

  const shown = useMemo(() => {
    if (!events) return [];
    let list = events;
    if (neighborhood) {
      const local = list.filter((e) => e.neighborhood === neighborhood);
      if (local.length >= 2) list = local;
    }
    return list.slice(0, MAX_EVENTS);
  }, [events, neighborhood]);

  return (
    <Section
      id="home-events-title"
      title={t("interface.upcomingEvents")}
      titleAside={neighborhood}
      action={
        <SectionAction asChild>
          <Link to="/events">{t("home.seeAll")}</Link>
        </SectionAction>
      }
    >
      {events === null ? (
        <div className="-mx-4 flex gap-3 overflow-hidden px-4 lg:mx-0 lg:px-0" aria-busy="true">
          <span className="sr-only">{t("interface.loadingEvents")}</span>
          {[0, 1].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-36 w-[80%] max-w-[18rem] shrink-0 animate-pulse rounded-2xl bg-muted lg:flex-1"
            />
          ))}
        </div>
      ) : failed ? (
        <EmptyState
          title={t("home.eventsError")}
          action={
            <Link to="/events" className="font-semibold text-primary hover:underline">
              {t("interface.allEvents")}
            </Link>
          }
        />
      ) : shown.length === 0 ? (
        <EmptyState title={t("interface.noEvents")} />
      ) : (
        <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {shown.map((e) => (
            <li
              key={e.id}
              className="flex w-[80%] max-w-[18rem] shrink-0 snap-start lg:w-auto lg:max-w-none"
            >
              <EventCard event={e} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function EventCard({ event: e, locale }: { event: UpcomingEvent; locale?: string }) {
  const { t } = useI18n();
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
  const where = [e.location, e.neighborhood].filter(Boolean).join(" · ");

  return (
    <Link
      to="/events"
      onClick={() =>
        trackEventViewed({ eventId: e.id, category: e.category ?? undefined, date: e.event_date })
      }
      className="no-min-h relative flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:border-primary/40"
    >
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <span className="text-[11px] font-bold uppercase leading-none">
            {start.toLocaleDateString(locale, { month: "short" })}
          </span>
          <span className="mt-1 text-xl font-extrabold leading-none">{start.getDate()}</span>
        </span>
        <div className="min-w-0">
          <p className="line-clamp-2 font-bold leading-snug text-foreground">{e.title}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            <span className="sr-only">
              {start.toLocaleDateString(locale, { month: "long", day: "numeric" })},{" "}
            </span>
            {when}
          </p>
        </div>
      </div>
      {where && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{where}</span>
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {e.is_free && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
            <Ticket className="h-3.5 w-3.5" aria-hidden="true" /> {t("interface.free")}
          </span>
        )}
        <VerifiedPill
          compact
          category="events"
          status={(e.verification_status as VerificationStatus) ?? "needs_verification"}
          lastVerified={e.last_verified}
          source={e.source}
        />
      </div>
    </Link>
  );
}
