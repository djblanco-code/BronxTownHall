import { useEffect, useState } from "react";
import { AlertTriangle, Bell, CalendarClock, ChevronDown, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { loadCategoryAlerts, formatDeadline, type PolicyAlert } from "@/lib/policy-alerts";
import { AlertSubscribeForm } from "./AlertSubscribeForm";

export function PolicyAlerts({ category }: { category: string }) {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<PolicyAlert[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let live = true;
    loadCategoryAlerts(category).then((a) => {
      if (live) setAlerts(a);
    });
    return () => {
      live = false;
    };
  }, [category]);

  return (
    <section
      aria-labelledby="policy-alerts-heading"
      className="mb-6 rounded-2xl border-2 border-amber-300/70 bg-amber-50/60 dark:bg-amber-500/5 p-4"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1">
          <h2 id="policy-alerts-heading" className="font-bold">
            {t("alertsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("alertsSubtitle")}</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("alertsEmpty")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {alerts.map((a) => {
            const isOpen = open === a.id;
            return (
              <li key={a.id} className="rounded-xl bg-card border border-border p-3">
                <div className="flex items-start gap-2 flex-wrap">
                  {a.kind === "deadline" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                      {a.deadline_date ? formatDeadline(a.deadline_date) : t("alertsDeadline")}
                    </span>
                  )}
                  <p className="font-semibold flex-1 min-w-[12rem]">{a.headline}</p>
                </div>

                {(a.detail || a.source_url) && (
                  <button
                    onClick={() => setOpen(isOpen ? null : a.id)}
                    aria-expanded={isOpen}
                    className="no-min-h mt-1 inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                  >
                    {isOpen ? t("alertsReadLess") : t("alertsReadMore")}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                )}

                {isOpen && (
                  <div className="mt-2 space-y-2">
                    {a.detail && (
                      <p className="text-sm text-foreground/90 whitespace-pre-line">{a.detail}</p>
                    )}
                    {a.source_url && (
                      <a
                        href={a.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                      >
                        {a.source_label || t("alertsSource")}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-xs text-muted-foreground">{t("alertsStaffNote")}</p>

      <div className="mt-3 pt-3 border-t border-amber-300/50">
        {showForm ? (
          <AlertSubscribeForm defaultCategory={category} onDone={() => setShowForm(false)} />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{t("alertsOptional")}</p>
            <button
              onClick={() => setShowForm(true)}
              className="no-min-h mt-1 inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
            >
              <Bell className="h-4 w-4" aria-hidden /> {t("alertsGetAlerts")}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
