import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { RESOURCES } from "@/lib/data";
import { useNycTime } from "@/lib/opening-hours";
import { Section, SectionAction } from "@/components/ui/section";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { EventCard } from "@/features/events";
import { ResourceTile } from "@/features/resources";
import { useUpcomingEvents } from "../lib/upcoming-events";
import { eventsIn, openTonight } from "../lib/today";
import { CardRow, CardRowItem, CardRowSkeleton } from "./CardRow";

type Tab = "tonight" | "today" | "weekend";

const MAX_EVENTS = 8;

/**
 * What's useful right now: places open tonight, events today and this
 * weekend. Starts on the first tab that has something to show.
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

  let body: ReactNode;
  if (tab === "tonight") {
    body =
      open === null ? (
        <CardRowSkeleton label={t("interface.loading")} />
      ) : open.length === 0 ? (
        <EmptyState icon={Moon} title={t("home.nothingTonight")} />
      ) : (
        <CardRow>
          {open.map(({ resource }) => (
            <CardRowItem key={resource.id}>
              <ResourceTile resource={resource} />
            </CardRowItem>
          ))}
        </CardRow>
      );
  } else {
    const list = byTab?.[tab];
    body = !list ? (
      <CardRowSkeleton label={t("interface.loadingEvents")} />
    ) : failed ? (
      <EmptyState
        title={t("home.eventsError")}
        action={
          <Link to="/events" className="font-semibold text-primary hover:underline">
            {t("interface.allEvents")}
          </Link>
        }
      />
    ) : list.length === 0 ? (
      <EmptyState
        icon={CalendarDays}
        title={tab === "today" ? t("home.noEventsToday") : t("home.noEventsWeekend")}
        action={
          <Link to="/events" className="font-semibold text-primary hover:underline">
            {t("interface.allEvents")}
          </Link>
        }
      />
    ) : (
      <CardRow>
        {list.map((e) => (
          <CardRowItem key={e.id}>
            <EventCard event={e} />
          </CardRowItem>
        ))}
      </CardRow>
    );
  }

  return (
    <Section
      id="home-today-title"
      title={t("home.rightNow")}
      action={
        tab !== "tonight" && (
          <SectionAction asChild>
            <Link to="/events">{t("home.seeAll")}</Link>
          </SectionAction>
        )
      }
    >
      <div
        role="group"
        aria-label={t("home.rightNow")}
        className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0"
      >
        {tabs.map((x) => (
          <Chip
            key={x.id}
            variant="soft"
            selected={tab === x.id}
            onClick={() => setPicked(x.id)}
            className="shrink-0"
          >
            {x.label}
          </Chip>
        ))}
      </div>
      {body}
    </Section>
  );
}
