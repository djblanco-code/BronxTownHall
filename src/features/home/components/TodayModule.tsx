import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { RESOURCES } from "@/lib/data";
import { useNycTime } from "@/lib/opening-hours";
import { Section, SectionAction } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceRow } from "@/features/resources";
import { cn } from "@/lib/utils";
import { useUpcomingEvents } from "../lib/upcoming-events";
import { eventsIn, openTonight } from "../lib/today";
import { EventRow } from "./EventRow";

type Tab = "tonight" | "today" | "weekend";

const MAX_EVENTS = 8;
const MAX_ROWS = 5;

/**
 * What's useful right now: places open tonight, events today and this
 * weekend, as short lists. Phones pick one with chips (starting on the
 * first that has something); laptops show places and events side by side.
 */
export function TodayModule({ neighborhood }: { neighborhood: string | null }) {
  const { t } = useI18n();
  const now = useNycTime();
  const { events, failed } = useUpcomingEvents();
  const [picked, setPicked] = useState<Tab | null>(null);

  const open = useMemo(
    () => (now ? openTonight(RESOURCES, now, neighborhood) : null),
    [now, neighborhood],
  );
  const byTab = useMemo(() => {
    if (!events) return null;
    const local = (list: typeof events) => {
      if (!neighborhood) return list;
      const near = list.filter((e) => e.neighborhood === neighborhood);
      return near.length >= 2 ? near : list;
    };
    return {
      today: local(eventsIn(events, "today")).slice(0, MAX_EVENTS),
      weekend: local(eventsIn(events, "weekend")).slice(0, MAX_EVENTS),
    };
  }, [events, neighborhood]);

  const firstWithContent: Tab =
    open?.length !== 0
      ? "tonight"
      : byTab?.today.length
        ? "today"
        : byTab?.weekend.length
          ? "weekend"
          : "tonight";
  const tab = picked ?? firstWithContent;

  const tabs: { id: Tab; label: string }[] = [
    { id: "tonight", label: t("home.openTonight") },
    { id: "today", label: t("home.eventsToday") },
    { id: "weekend", label: t("home.thisWeekend") },
  ];

  const tonightBody: ReactNode =
    open === null ? (
      <ListSkeleton label={t("interface.loading")} />
    ) : open.length === 0 ? (
      <EmptyState icon={Moon} title={t("home.nothingTonight")} />
    ) : (
      <ul className={LIST}>
        {open.slice(0, MAX_ROWS).map(({ resource }) => (
          <ResourceRow key={resource.id} resource={resource} />
        ))}
      </ul>
    );

  const eventsBody = (which: "today" | "weekend"): ReactNode => {
    const list = byTab?.[which];
    if (!list) return <ListSkeleton label={t("interface.loadingEvents")} />;
    if (failed || list.length === 0)
      return (
        <EmptyState
          icon={failed ? undefined : CalendarDays}
          title={
            failed
              ? t("home.eventsError")
              : which === "today"
                ? t("home.noEventsToday")
                : t("home.noEventsWeekend")
          }
          action={
            <Link to="/events" className="font-semibold text-primary hover:underline">
              {t("interface.allEvents")}
            </Link>
          }
        />
      );
    return (
      <ul className={LIST}>
        {list.slice(0, MAX_ROWS).map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </ul>
    );
  };

  // On a laptop both columns show at once, so the events column keeps its own choice.
  const eventTab: "today" | "weekend" =
    tab !== "tonight" ? tab : byTab?.today.length || !byTab?.weekend.length ? "today" : "weekend";

  const chips = (ids: Tab[], current: Tab, className?: string) => (
    <div
      role="group"
      aria-label={t("home.rightNow")}
      className={cn(
        "-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0",
        className,
      )}
    >
      {tabs
        .filter((x) => ids.includes(x.id))
        .map((x) => (
          <Chip
            key={x.id}
            variant="soft"
            selected={current === x.id}
            onClick={() => setPicked(x.id)}
            className="shrink-0"
          >
            {x.label}
          </Chip>
        ))}
    </div>
  );

  return (
    <Section
      id="home-today-title"
      title={t("home.rightNow")}
      action={
        <SectionAction asChild className={tab === "tonight" ? "lg:inline-flex hidden" : undefined}>
          <Link to="/events">{t("home.seeAll")}</Link>
        </SectionAction>
      }
    >
      {/* Phone: one list at a time, picked with chips. */}
      <div className="lg:hidden">
        {chips(["tonight", "today", "weekend"], tab)}
        {tab === "tonight" ? tonightBody : eventsBody(tab)}
      </div>

      {/* Laptop: places open tonight beside what's happening. */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-2">
        <div>
          <h3 className="mb-3 flex h-10 items-center gap-2 text-sm font-bold text-foreground">
            <Moon className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("home.openTonight")}
          </h3>
          {tonightBody}
        </div>
        <div>
          {chips(["today", "weekend"], eventTab)}
          {eventsBody(eventTab)}
        </div>
      </div>
    </Section>
  );
}

const LIST = "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card";

/** Placeholder rows while a list loads; `label` is read to screen readers. */
function ListSkeleton({ label }: { label: string }) {
  return (
    <div className={LIST} aria-busy="true">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="flex items-center gap-3 p-3">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
