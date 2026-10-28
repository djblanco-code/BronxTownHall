import { CalendarDays } from "lucide-react";
import { buildIcs, downloadIcs, eventStartDate } from "@/lib/ics";
import { useI18n } from "@/lib/i18n-context";

/**
 * "Add to Calendar" — downloads a .ics file (works with Google Calendar,
 * Apple Calendar, and Outlook). Renders nothing unless the listing has a
 * real, specific calendar date (ongoing programs / vague schedules don't
 * get the button).
 */
export function AddToCalendarButton({
  title,
  date,
  time,
  location,
  description,
  durationMinutes = 90,
  className,
}: {
  title: string;
  /** "YYYY-MM-DD" — required; button hidden otherwise. */
  date?: string | null;
  /** Optional start time, e.g. "6:30 PM". Defaults to 12:00 when absent. */
  time?: string | null;
  location?: string | null;
  description?: string | null;
  durationMinutes?: number;
  className?: string;
}) {
  const { t } = useI18n();
  const start = eventStartDate(date, time);
  if (!start) return null;

  const onClick = () => {
    const ics = buildIcs({
      title,
      description: description ?? "",
      location: location ?? "",
      date: start,
      durationMinutes,
    });
    downloadIcs(title, ics);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:border-primary/40 hover:shadow transition"
      }
    >
      <CalendarDays className="h-4 w-4" aria-hidden />
      {t("interface.addCalendar")}
    </button>
  );
}
