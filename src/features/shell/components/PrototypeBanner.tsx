import { useEffect, useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

const KEY = "bronx.prototypeBanner.dismissed";

/** One slim line instead of three; dismissible for the rest of the visit. */
export function PrototypeBanner() {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === "1") setHidden(true);
    } catch {
      /* storage blocked: keep showing it */
    }
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div role="status" className="print-hide bg-warning text-warning-foreground">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-1 text-xs font-medium">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          <span className="lg:hidden">{t("shell.prototypeShort")}</span>
          <span className="hidden lg:inline">{t("prototypeBanner")}</span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("shell.dismiss")}
          className="no-min-h simplified-exempt -me-2 grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-black/10"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
