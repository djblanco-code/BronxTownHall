import { Accessibility } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n-context";
import { getProfile, saveProfile, useProfile } from "@/lib/onboarding";

/**
 * A quiet offer of Simplified View at the bottom of Home, for people who
 * need bigger text. Hidden once it is on.
 */
export function SimplerViewPrompt() {
  const { t } = useI18n();
  const profile = useProfile();
  if (profile.simplifiedMode) return null;

  return (
    <div
      role="region"
      aria-label={t("home.simplerTitle")}
      className="mt-4 flex items-center gap-3 rounded-2xl bg-secondary p-3"
    >
      <Accessibility className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">
        {t("home.simplerTitle")}
      </p>
      <button
        type="button"
        onClick={() => {
          saveProfile({ ...getProfile(), simplifiedMode: true });
          toast.success(t("home.simplerToast"));
        }}
        className="no-min-h h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {t("home.simplerOn")}
      </button>
    </div>
  );
}
