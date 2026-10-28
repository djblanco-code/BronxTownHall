import { Link } from "@tanstack/react-router";
import { ChevronRight, MessageSquare, Phone, WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { SMS_CONFIGURED, SMS_NUMBER, formatSmsNumber } from "@/lib/sms";

/** Grouped list rows, like a settings screen: urgent help first, then the text line. */
export function HelpNowList() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="home-help-now-title" className="mx-auto mt-8 max-w-5xl px-4">
      <h2 id="home-help-now-title" className="mb-3 text-lg font-bold text-foreground sm:text-2xl">
        {t("home.helpNow")}
      </h2>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        <li>
          <Link
            to="/emergency"
            className="no-min-h flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-secondary"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground">
              <Phone className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-destructive">
                {t("interface.emergencyHelp")}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t("interface.worksOffline")}
              </span>
            </span>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180"
              aria-hidden="true"
            />
          </Link>
        </li>
        <li>
          <Link
            id="sms-callout"
            to="/sms"
            className="no-min-h flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-secondary"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-foreground">
                {SMS_CONFIGURED
                  ? t("home.textLine", { number: formatSmsNumber(SMS_NUMBER) })
                  : t("home.textLineSoon")}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t("interface.noSmartphone")}
                {SMS_CONFIGURED ? "" : ` · ${t("interface.lineSoon")}`}
              </span>
            </span>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180"
              aria-hidden="true"
            />
          </Link>
        </li>
      </ul>
    </section>
  );
}
