import { useEffect, useState } from "react";
import { ShieldCheck, Trash2, Loader2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { analyticsOptedOut, setAnalyticsOptOut, deleteAllMyData } from "@/lib/privacy";
import { initAnalytics, stopAnalytics } from "@/lib/analytics";

export function DataControls() {
  const [optOut, setOptOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setOptOut(analyticsOptedOut());
  }, []);

  function toggle() {
    const next = !optOut;
    setOptOut(next);
    setAnalyticsOptOut(next);
    if (next) stopAnalytics();
    else initAnalytics();
    toast.success(next ? "Usage counting is off on this device" : "Usage counting is on");
  }

  async function erase() {
    setBusy(true);
    try {
      await deleteAllMyData();
      toast.success("Your data has been deleted from this device and our servers.");
      setConfirming(false);
      setTimeout(() => window.location.assign("/"), 900);
    } catch {
      toast.error("Something went wrong. Please try again or email us.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="data-controls-title" className="mt-8">
      <h2
        id="data-controls-title"
        className="flex items-center gap-2 pt-2 text-lg font-bold sm:text-2xl"
      >
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /> Your data
        controls
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        You are in control. Nothing here requires an account, an email, or a phone number.
      </p>

      <div className="mt-3 flex items-center gap-3 border-y border-border py-3">
        <BarChart3 className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Anonymous usage counting</p>
          <p className="text-xs text-muted-foreground">
            Counts which resources people open, so we can fix gaps. No names, no accounts, no IP
            tracking.
          </p>
        </div>
        {/* The button is the 44px tap target; the track inside it is the visible switch. */}
        <button
          type="button"
          onClick={toggle}
          role="switch"
          aria-checked={!optOut}
          aria-label="Anonymous usage counting"
          className="no-min-h simplified-exempt grid h-11 w-14 shrink-0 place-items-center"
        >
          <span
            aria-hidden="true"
            dir="ltr"
            className={`flex h-5 w-9 items-center rounded-full border-2 border-transparent transition-colors ${optOut ? "bg-input" : "bg-primary"}`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-background transition-transform ${optOut ? "translate-x-0" : "translate-x-4"}`}
            />
          </span>
        </button>
      </div>

      <div className="mt-4">
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="no-min-h inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete all my data
          </button>
        ) : (
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-bold">Delete everything?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This erases your saved resources, preferences, and anonymous usage rows — on this
              device and on our servers. It cannot be undone.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={erase}
                disabled={busy}
                className="no-min-h inline-flex min-h-11 items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-bold text-background hover:bg-foreground/90 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                Yes, delete it all
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="no-min-h inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
