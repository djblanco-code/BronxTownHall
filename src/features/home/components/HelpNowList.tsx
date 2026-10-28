import { Link } from "@tanstack/react-router";
import { MessageSquare, Phone, WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { SMS_CONFIGURED, SMS_NUMBER, formatSmsNumber } from "@/lib/sms";
import { Section } from "@/components/ui/section";
import { ListGroup, ListRow } from "@/components/ui/list-group";

/** Grouped list rows, like a settings screen: urgent help first, then the text line. */
export function HelpNowList() {
  const { t } = useI18n();
  return (
    <Section id="home-help-now-title" title={t("home.helpNow")}>
      <ListGroup>
        <ListRow
          icon={Phone}
          tone="destructive"
          title={t("interface.emergencyHelp")}
          description={
            <>
              <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t("interface.worksOffline")}
            </>
          }
        >
          <Link to="/emergency" />
        </ListRow>
        <ListRow
          id="sms-callout"
          icon={MessageSquare}
          title={
            SMS_CONFIGURED
              ? t("home.textLine", { number: formatSmsNumber(SMS_NUMBER) })
              : t("home.textLineSoon")
          }
          description={
            t("interface.noSmartphone") + (SMS_CONFIGURED ? "" : ` · ${t("interface.lineSoon")}`)
          }
        >
          <Link to="/sms" />
        </ListRow>
      </ListGroup>
    </Section>
  );
}
