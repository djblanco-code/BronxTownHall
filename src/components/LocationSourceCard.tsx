import { Crosshair, MapPin, Loader2 } from "lucide-react";
import { useLiveLocation } from "@/lib/live-location";

/**
 * Always says which origin distances come from, and lets the resident switch
 * either way in one tap. Live location is requested only by this button —
 * never on page load — and is dropped the moment the tab closes.
 */
export function LocationSourceCard({ className = "" }: { className?: string }) {
  const { mode, status, zip, accuracyMeters, updates, supported, enableLive, useZipOnly } =
    useLiveLocation();
  const live = mode === "live";

  const label = live
    ? "Using your real-time location"
    : zip
      ? `Using your zip code ${zip} (approximate)`
      : "No location set — distances are approximate";

  return (
    <div className={`rounded-2xl border border-border bg-card p-3 ${className}`} aria-live="polite">
      <div className="flex items-start gap-2">
        {live ? (
          <Crosshair className="h-4 w-4 mt-0.5 shrink-0 text-success" aria-hidden />
        ) : (
          <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {live
              ? `Distances update as you move around the Bronx. Nothing is saved — your location is used only while this page is open${
                  accuracyMeters ? `, accurate to about ${accuracyMeters} m` : ""
                }.${updates > 0 ? ` Refreshed ${updates} time${updates === 1 ? "" : "s"} this visit.` : ""}`
              : "Turn on your current location for more exact distances. We never save it and never use it in the background."}
          </p>

          {status === "denied" && (
            <p className="mt-1 text-xs font-medium text-warning">
              Location permission was turned off in your browser, so we&apos;re using your zip code
              instead.
            </p>
          )}
          {(status === "unavailable" || (!supported && status !== "idle")) && (
            <p className="mt-1 text-xs font-medium text-warning">
              Your device can&apos;t share a location right now — zip code distances are still
              working.
            </p>
          )}
          {status === "error" && (
            <p className="mt-1 text-xs font-medium text-warning">
              Couldn&apos;t get a location fix. Using your zip code instead.
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {live ? (
              <button
                onClick={useZipOnly}
                className="no-min-h inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-2 text-xs font-bold min-h-[44px]"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden /> Switch back to zip code only
              </button>
            ) : (
              <button
                onClick={enableLive}
                disabled={status === "requesting" || !supported}
                className="no-min-h inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 min-h-[44px]"
              >
                {status === "requesting" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Waiting for your
                    location…
                  </>
                ) : (
                  <>
                    <Crosshair className="h-3.5 w-3.5" aria-hidden /> Use my current location
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
