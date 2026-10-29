import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, MessageCircle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { useResourceMeta } from "@/lib/resource-meta";
import { SimplerViewPrompt } from "./SimplerViewPrompt";

/**
 * The quiet end of Home: report something missing or wrong, how we verify
 * listings and handle data, and the offer of Simplified View.
 */
export function HomeFooter({ onFeedback }: { onFeedback: () => void }) {
  const { t } = useI18n();
  const meta = useResourceMeta();
  const verifiedThisWeek = useMemo(
    () =>
      Object.values(meta).filter(
        (m) => m.last_verified && Date.now() - new Date(m.last_verified).getTime() < 7 * 86_400_000,
      ).length,
    [meta],
  );

  return (
    <footer className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex items-center gap-3 border-t border-border pt-5">
        <MessageCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground">{t("home.feedbackTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("home.feedbackBody")}</p>
        </div>
        <button
          type="button"
          onClick={onFeedback}
          className="no-min-h h-11 shrink-0 rounded-md border border-border px-4 text-sm font-bold text-foreground hover:bg-secondary"
        >
          {t("home.feedbackCta")}
        </button>
      </div>

      <SimplerViewPrompt />

      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <Link
          to="/data-quality"
          className="no-min-h inline-flex min-h-11 items-center gap-1.5 hover:text-foreground hover:underline"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          {verifiedThisWeek > 0
            ? t("interface.verifiedWeek", { count: verifiedThisWeek })
            : t("interface.howVerifyListings")}
        </Link>
        <Link
          to="/privacy"
          className="no-min-h inline-flex min-h-11 items-center gap-1.5 hover:text-foreground hover:underline"
        >
          <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("interface.privacyLink")}
        </Link>
      </p>
    </footer>
  );
}
