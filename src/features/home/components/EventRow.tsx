import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { EventSummary } from "@/features/events";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";

/**
 * An event as one row on Home: day and time in a narrow column on the
 * leading side, then the title and where. Opens the events page.
 */
export function EventRow({ event: e }: { event: EventSummary }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.bcp47;
  const [y, m, d] = e.event_date.split("-").map(Number);
  const day = new Date(y!, (m ?? 1) - 1, d ?? 1).toLocaleDateString(locale, { weekday: "short" });
  const where = [e.location, e.neighborhood].filter(Boolean).join(" · ");

  return (
    <li>
      <Link to="/events" className="no-min-h flex gap-3 px-3 py-3 transition hover:bg-secondary/60">
        <span className="w-16 shrink-0 pt-0.5">
          <span className="block text-sm font-bold text-primary">{day}</span>
          {e.event_time && (
            <span className="block truncate text-xs text-muted-foreground">{e.event_time}</span>
          )}
        </span>
        <span className="min-w-0 flex-1 border-s border-border ps-3">
          <span className="line-clamp-2 font-semibold text-foreground">{e.title}</span>
          {where && (
            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{where}</span>
            </span>
          )}
          {e.is_free && (
            <span className="mt-1 inline-block rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
              {t("interface.free")}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
