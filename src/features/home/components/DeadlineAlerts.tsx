import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/data";
import { loadRecentPublishedAlerts, type PolicyAlert } from "@/lib/policy-alerts";
import { activeDeadlines, nycIsoDate } from "../lib/today";

/**
 * Staff-published deadlines (benefits renewals, applications) that haven't
 * passed yet. Renders nothing at all when none are active.
 */
export function DeadlineAlerts() {
  const { t, lang } = useI18n();
  const [alerts, setAlerts] = useState<PolicyAlert[]>([]);

  useEffect(() => {
    let alive = true;
    loadRecentPublishedAlerts(50).then((all) => {
      if (alive) setAlerts(activeDeadlines(all, nycIsoDate()));
    });
    return () => {
      alive = false;
    };
  }, []);

  if (alerts.length === 0) return null;
  const locale = LANGS.find((l) => l.code === lang)?.bcp47;

  return (
    <section aria-labelledby="home-deadlines-title" className="mx-auto mt-6 max-w-5xl px-4">
      <h2 id="home-deadlines-title" className="sr-only">
        {t("home.deadlinesTitle")}
      </h2>
      <ul className="space-y-2">
        {alerts.map((a) => {
          const date = new Date(`${a.deadline_date}T12:00:00`).toLocaleDateString(locale, {
            month: "short",
            day: "numeric",
          });
          const hasPage = CATEGORIES.some((c) => c.id === a.category);
          const linked = hasPage || !!a.source_url;
          const content = (
            <>
              <CalendarClock
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-amber-800 dark:text-amber-200">
                  {t("home.deadlineOn", { date })}
                </span>
                <span className="block text-sm font-semibold text-foreground">{a.headline}</span>
              </span>
              {linked && (
                <ChevronRight
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180"
                  aria-hidden="true"
                />
              )}
            </>
          );
          const cls =
            "no-min-h flex items-start gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/70 p-3 hover:border-amber-500 dark:bg-amber-500/10";
          return (
            <li key={a.id}>
              {hasPage ? (
                <Link to="/category/$cat" params={{ cat: a.category }} className={cls}>
                  {content}
                </Link>
              ) : a.source_url ? (
                <a href={a.source_url} target="_blank" rel="noopener noreferrer" className={cls}>
                  {content}
                </a>
              ) : (
                <div className={cls}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
