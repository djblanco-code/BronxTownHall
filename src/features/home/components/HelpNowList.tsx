import { Link } from "@tanstack/react-router";
import { MessageSquare, Phone, WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { SMS_CONFIGURED, SMS_NUMBER, formatSmsNumber } from "@/lib/sms";

/**
 * Crisis lines under a red rule (and the text line once it is live). No
 * heading box: the rule and the red title carry it.
 */
export function HelpNowList() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="home-help-now-title" className="mx-auto mt-8 max-w-5xl px-4">
      <h2 id="home-help-now-title" className="sr-only">
        {t("home.helpNow")}
      </h2>
      <ul className="divide-y divide-border border-t-[3px] border-b border-t-destructive border-b-border">
        <li>
          <Link to="/emergency" className="no-min-h group flex items-start gap-3 py-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-destructive group-hover:underline">
                {t("interface.emergencyHelp")}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t("interface.worksOffline")}
              </span>
            </span>
          </Link>
        </li>
        {/* The text line shows once it exists; a "coming soon" row would be a dead end. */}
        {SMS_CONFIGURED && (
          <li id="sms-callout">
            <Link to="/sms" className="no-min-h group flex items-start gap-3 py-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-foreground group-hover:underline">
                  {t("home.textLine", { number: formatSmsNumber(SMS_NUMBER) })}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {t("interface.noSmartphone")}
                </span>
              </span>
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}
