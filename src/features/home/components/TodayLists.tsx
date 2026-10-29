import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { RESOURCES } from "@/lib/data";
import { useNycTime } from "@/lib/opening-hours";
import { Section, SectionAction } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceRow } from "@/features/resources";
import { useUpcomingEvents } from "../lib/upcoming-events";
import { eventsIn, openTonight } from "../lib/today";
import { EventRow } from "./EventRow";

/** Rows shown before "Show more" / "See all". */
const FIRST_ROWS = 3;
const MAX_ROWS = 8;

/** Ruled list: hairlines between rows and under the last one, no box. */
const LIST = "divide-y divide-border border-b border-border";

/**
 * The two "what's useful now" lists: places open tonight, then events in the
 * next 7 days. Stacked on phones, side by side on laptops.
 */
export function TodayLists({ neighborhood }: { neighborhood: string | null }) {
  return (
    <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-2 lg:gap-8 lg:px-4">
      <OpenTonight neighborhood={neighborhood} />
      <ThisWeek neighborhood={neighborhood} />
    </div>
  );
}

const COLUMN = "lg:mx-0 lg:max-w-none lg:px-0";

function OpenTonight({ neighborhood }: { neighborhood: string | null }) {
  const { t } = useI18n();
  const now = useNycTime();
  const [expanded, setExpanded] = useState(false);
  const open = useMemo(
    () => (now ? openTonight(RESOURCES, now, neighborhood, MAX_ROWS) : null),
    [now, neighborhood],
  );

  let body: ReactNode;
  if (open === null) body = <ListSkeleton label={t("interface.loading")} />;
  else if (open.length === 0) body = <EmptyState icon={Moon} title={t("home.nothingTonight")} />;
  else
    body = (
      <ul id="open-tonight-list" className={LIST}>
        {open.slice(0, expanded ? MAX_ROWS : FIRST_ROWS).map(({ resource }) => (
          <ResourceRow key={resource.id} resource={resource} />
        ))}
      </ul>
    );

  return (
    <Section
      id="home-tonight-title"
      title={t("home.openTonight")}
      ruled
      className={COLUMN}
      action={
        open &&
        open.length > FIRST_ROWS && (
          <SectionAction
            aria-expanded={expanded}
            aria-controls="open-tonight-list"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? t("home.showFewer") : t("home.showMore")}
          </SectionAction>
        )
      }
    >
      {body}
    </Section>
  );
}

function ThisWeek({ neighborhood }: { neighborhood: string | null }) {
  const { t } = useI18n();
  const { events, failed } = useUpcomingEvents();
  const week = useMemo(() => {
    if (!events) return null;
    const all = eventsIn(events, "week");
    if (!neighborhood) return all;
    const near = all.filter((e) => e.neighborhood === neighborhood);
    return near.length >= 2 ? near : all;
  }, [events, neighborhood]);

  const allEvents = (
    <Link to="/events" className="font-semibold text-primary hover:underline">
      {t("interface.allEvents")}
    </Link>
  );

  let body: ReactNode;
  if (!week) body = <ListSkeleton label={t("interface.loadingEvents")} />;
  else if (failed) body = <EmptyState title={t("home.eventsError")} action={allEvents} />;
  else if (week.length === 0)
    body = <EmptyState icon={CalendarDays} title={t("home.noEventsWeek")} action={allEvents} />;
  else
    body = (
      <ul className={LIST}>
        {week.slice(0, FIRST_ROWS).map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </ul>
    );

  return (
    <Section
      id="home-week-title"
      title={t("home.thisWeek")}
      ruled
      className={COLUMN}
      action={
        <SectionAction asChild>
          <Link to="/events">{t("home.seeAll")}</Link>
        </SectionAction>
      }
    >
      {body}
    </Section>
  );
}

/** Placeholder rows while a list loads; `label` is read to screen readers. */
function ListSkeleton({ label }: { label: string }) {
  return (
    <div className={LIST} aria-busy="true">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="space-y-2 py-3">
          <div className="h-3 w-1/3 animate-pulse rounded-sm bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded-sm bg-muted" />
        </div>
      ))}
    </div>
  );
}
