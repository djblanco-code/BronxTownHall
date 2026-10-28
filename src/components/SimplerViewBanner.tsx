import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Accessibility, X } from "lucide-react";
import { getProfile, saveProfile, useProfile } from "@/lib/onboarding";
import { toast } from "sonner";

const KEY = "bronx.simplerViewBannerDismissed";

/**
 * One-time, non-blocking nudge that replaces the old onboarding
 * "how comfortable are you using apps?" question.
 */
export function SimplerViewBanner({ className = "" }: { className?: string }) {
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
    <div
      className={`rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 flex items-start gap-3 text-start ${className}`}
      role="region"
      aria-label="Simpler view suggestion"
    >
      <Accessibility className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">Want a simpler view?</p>
        <p className="text-sm text-muted-foreground">
          Larger text and bigger buttons. You can change this anytime in{" "}
          <Link to="/settings" className="font-semibold text-primary hover:underline">Settings</Link>.
        </p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              saveProfile({ ...getProfile(), simplifiedMode: true });
              toast.success("Simplified View turned on");
              dismiss();
            }}
            className="no-min-h px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold min-h-[44px]"
          >
            Turn on simpler view
          </button>
          <button
            onClick={dismiss}
            className="no-min-h px-4 py-2 rounded-lg border border-border text-sm font-medium min-h-[44px]"
          >
            No thanks
          </button>
        </div>
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="no-min-h p-1 text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
