import { useEffect, useState } from "react";
import { Accessibility, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n-context";
import { getProfile, saveProfile, useProfile } from "@/lib/onboarding";

const KEY = "bronx.simplerViewBannerDismissed";

/**
 * One-row, one-time offer of Simplified View, for people who need bigger
 * text before they struggle with the rest of the screen.
 */
export function SimplerViewPrompt() {
  const { t } = useI18n();
  const profile = useProfile();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!show || profile.simplifiedMode) return null;

  return (
    <div className="mx-auto mt-4 max-w-5xl px-4">
      <div
        role="region"
        aria-label={t("home.simplerTitle")}
        className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Accessibility className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t("home.simplerTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("home.simplerBody")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            saveProfile({ ...getProfile(), simplifiedMode: true });
            toast.success(t("home.simplerToast"));
            dismiss();
          }}
          className="no-min-h h-10 shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {t("home.simplerOn")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("shell.dismiss")}
          className="no-min-h -me-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
