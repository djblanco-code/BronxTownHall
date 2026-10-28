import { HelpCircle } from "lucide-react";
import { useSimplifiedMode } from "@/lib/simplified-mode";
import { Link } from "@tanstack/react-router";

export function SimplifiedHelpFab() {
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
