import { Link } from "@tanstack/react-router";
import { MessageSquare, Phone, WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { SMS_CONFIGURED, SMS_NUMBER, formatSmsNumber } from "@/lib/sms";
import { Section } from "@/components/ui/section";
import { ListGroup, ListRow } from "@/components/ui/list-group";

/** Crisis lines (and the text line once it is live) as grouped list rows. */
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
        {/* The text line shows once it exists; a "coming soon" row would be a dead end. */}
        {SMS_CONFIGURED && (
          <ListRow
            id="sms-callout"
            icon={MessageSquare}
            title={t("home.textLine", { number: formatSmsNumber(SMS_NUMBER) })}
            description={t("interface.noSmartphone")}
          >
            <Link to="/sms" />
          </ListRow>
        )}
      </ListGroup>
    </Section>
  );
}
