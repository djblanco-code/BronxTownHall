import { Link, useRouterState } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

// Single persistent SOS entry point. Routes to the existing Urgent Help page.
export function SosFab() {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/urgent")) return null;
  return (
    <Link
      to="/urgent"
      aria-label={`SOS — ${t("getHelpNow")}`}
      className="no-min-h fixed z-50 bottom-24 sm:bottom-6 end-4 h-14 w-14 rounded-full bg-destructive text-destructive-foreground shadow-xl grid place-items-center font-extrabold text-sm hover:scale-105 active:scale-95 transition"
    >
      <span className="flex flex-col items-center leading-none" aria-hidden="true">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-[11px] mt-0.5">SOS</span>
      </span>
    </Link>
  );
}
