import { Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { exitDemoMode, useDemoMode } from "../lib/demo-mode";

/** Shown on every page while demo mode is on, so sample content is never mistaken for live data. */
export function DemoBanner() {
  const { t } = useI18n();
  const on = useDemoMode();
  if (!on) return null;
  return (
    <div role="note" className="bg-bronx-orange text-bronx-orange-foreground">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-1.5 text-sm font-semibold">
        <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1">{t("demo.banner")}</span>
        <a
          href="?demo=0"
          onClick={exitDemoMode}
          className="no-min-h shrink-0 underline underline-offset-2"
        >
          {t("demo.exit")}
        </a>
      </div>
    </div>
  );
}
