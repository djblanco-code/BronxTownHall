import { Link } from "@tanstack/react-router";
import type { EventSummary } from "@/features/events";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";
import { nycIsoDate } from "../lib/today";

/**
 * An event as one row on Home, like a listings column in a paper: weekday
 * and day number on the leading side, then the title and when, where and
 * whether it's free. Opens the events page.
 */
export function EventRow({ event: e }: { event: EventSummary }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.bcp47;
  // An event that is already running (multi-day) shows today, not its start.
  const today = nycIsoDate();
  const shown =
    e.event_date < today && (e.event_end_date ?? e.event_date) >= today ? today : e.event_date;
  const [y, m, d] = shown.split("-").map(Number);
  const day = new Date(y!, (m ?? 1) - 1, d ?? 1);
  const meta = [e.event_time, e.location || e.neighborhood, e.is_free ? t("interface.free") : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Link to="/events" className="no-min-h group flex gap-3 py-3">
        <span className="w-12 shrink-0">
          <span className="label-caps block text-primary">
            {day.toLocaleDateString(locale, { weekday: "short" })}
          </span>
          <span className="font-display block text-2xl leading-none font-extrabold text-foreground">
            {day.toLocaleDateString(locale, { day: "numeric" })}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 font-bold text-foreground group-hover:underline">
            {e.title}
          </span>
          {meta && <span className="mt-0.5 block text-sm text-muted-foreground">{meta}</span>}
        </span>
      </Link>
    </li>
  );
}
