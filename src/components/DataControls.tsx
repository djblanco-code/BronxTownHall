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
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /> Your data controls
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        You are in control. Nothing here requires an account, an email, or a phone number.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-border p-3">
        <BarChart3 className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-bold text-sm">Anonymous usage counting</p>
          <p className="text-xs text-muted-foreground">
            Counts which resources people open, so we can fix gaps. No names, no accounts, no IP
            tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          role="switch"
          aria-checked={!optOut}
          aria-label="Anonymous usage counting"
          className={`h-7 w-12 shrink-0 rounded-full transition ${optOut ? "bg-muted" : "bg-primary"}`}
        >
          <span
            className={`block h-6 w-6 rounded-full bg-card shadow transition-transform ${optOut ? "translate-x-0.5" : "translate-x-[22px]"}`}
          />
        </button>
      </div>

      <div className="mt-4">
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-destructive px-4 py-2 text-sm font-bold text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete all my data
          </button>
        ) : (
          <div className="rounded-xl border-2 border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm font-bold">Delete everything?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This erases your saved resources, preferences, and anonymous usage rows — on this
              device and on our servers. It cannot be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={erase}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground disabled:opacity-60"
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
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold"
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
