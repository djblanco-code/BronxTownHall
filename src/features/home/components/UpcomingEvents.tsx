import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import { Section, SectionAction } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { EventCard } from "@/features/events";
import { useUpcomingEvents } from "../lib/upcoming-events";

const MAX_EVENTS = 6;

/**
 * The part of Home that changes week to week. A swipeable row on phones,
 * a grid on desktop.
 */
export function UpcomingEvents({ neighborhood }: { neighborhood: string | null }) {
  const { t } = useI18n();
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
              <EventCard event={e} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
