import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { useSimplifiedMode } from "@/lib/simplified-mode";

/**
 * Every floating button lives in one stack above the tab bar: the page's own
 * action (passed to AppShell as `fab`), Simplified View's Help, then SOS at
 * the bottom where people learn to find it. Nothing overlaps.
 */
export function FloatingActions({ fab }: { fab?: ReactNode }) {
  return (
    <div className="print-hide app-float-bottom pointer-events-none fixed end-4 z-50 flex flex-col items-end gap-3 *:pointer-events-auto">
      {fab}
      <SimplifiedHelpButton />
      <SosButton />
    </div>
  );
}

function SimplifiedHelpButton() {
  const on = useSimplifiedMode();
  if (!on) return null;
  return (
    <Link
      to="/onboarding"
      className="simplified-help-fab no-min-h"
      aria-label="Get help using this app"
    >
      <HelpCircle className="h-6 w-6" aria-hidden="true" />
      Help
    </Link>
  );
}

/** Single persistent SOS entry point. Routes to the Urgent Help page. */
function SosButton() {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/urgent")) return null;
  return (
    <Link
      to="/urgent"
      aria-label={`SOS — ${t("getHelpNow")}`}
      className="no-min-h inline-flex h-12 items-center gap-1.5 rounded-md border-2 border-white bg-destructive px-3 text-sm font-extrabold text-destructive-foreground shadow-lg hover:bg-destructive/90"
    >
      <span className="flex items-center gap-1.5 leading-none" aria-hidden="true">
        <AlertTriangle className="h-4 w-4" />
        SOS
      </span>
    </Link>
  );
}
