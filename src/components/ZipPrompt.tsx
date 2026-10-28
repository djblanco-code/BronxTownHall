import { useState } from "react";
import { MapPin } from "lucide-react";
import { BRONX_ZIPS, getProfile, saveProfile, useProfile } from "@/lib/onboarding";
import { useI18n } from "@/lib/i18n-context";

const DISMISS_KEY = "bronx.zipPromptDismissed";

/**
 * Contextual ZIP ask. Onboarding no longer requires a zip code, so we ask
 * exactly where distance actually matters — the "near you" surface — and only
 * if the resident hasn't already given one or dismissed the ask.
 */
export function ZipPrompt({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const profile = useProfile();
  const [dismissed, setDismissed] = useState(false);
  const [zip, setZip] = useState("");

  const alreadyDismissed =
    dismissed || (typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1");

  if (profile.userZipCode || alreadyDismissed) return null;

  const save = (value: string) => {
    setZip(value);
    if (!value) return;
    saveProfile({ ...getProfile(), userZipCode: value });
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 ${className}`}>
      <p className="font-semibold text-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" aria-hidden /> See what's closest to you
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Add your zip code and we'll sort by distance. We keep it on your device only.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor="zip-prompt" className="sr-only">
          Your Bronx zip code
        </label>
        <select
          id="zip-prompt"
          value={zip}
          onChange={(e) => save(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-border bg-card text-base min-h-[48px]"
        >
          <option value="">{t("zip")}</option>
          {BRONX_ZIPS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <button
          onClick={dismiss}
          className="no-min-h px-4 py-3 rounded-xl border-2 border-border bg-card text-sm font-semibold min-h-[48px]"
        >
          {t("interface.cancel")}
        </button>
      </div>
    </div>
  );
}
