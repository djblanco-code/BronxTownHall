import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { DataControls } from "@/components/DataControls";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { usePersonalization } from "@/lib/personalization";
import { resetOnboarding, useProfile, saveProfile, getProfile, BRONX_ZIPS } from "@/lib/onboarding";
import { ArrowLeft, Check, Trash2, RotateCcw } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { TextSizeControl } from "@/lib/text-size";

export const Route = createFileRoute("/settings")({
  staticData: { sitemap: false },
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { settings, setSettings, clearUsage } = usePersonalization();
  const profile = useProfile();
  const setSimplified = (v: boolean) => {
    saveProfile({ ...getProfile(), simplifiedMode: v });
    toast.success(v ? "Simplified View turned on" : "Switched to Standard View");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("back")}
        </button>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Settings</h1>

        <Section id="settings-text-size-title" title="Text size" ruled className={GROUP}>
          <p className="mb-3 text-sm text-muted-foreground">
            Make words bigger across the whole app. Saved on this device (and to your account when
            you're signed in).
          </p>
          <TextSizeControl />
        </Section>

        <Section id="settings-simplified-title" title="Simplified View" ruled className={GROUP}>
          <label
            htmlFor="settings-simplified-switch"
            className="flex min-h-16 cursor-pointer items-center justify-between gap-4 border-b border-border py-3"
          >
            <span className="min-w-0">
              <span className="block font-bold">
                {profile.simplifiedMode ? "Simplified View is ON" : "Simplified View"}
              </span>
              <span className="block text-sm text-muted-foreground">
                Larger text, bigger buttons, and simpler navigation.
              </span>
            </span>
            {/* The row is the tap target. dir="ltr": the thumb slides by a physical offset,
                so in Arabic it would otherwise leave the track. */}
            <Switch
              aria-label="Simplified View"
              checked={profile.simplifiedMode}
              onCheckedChange={setSimplified}
              id="settings-simplified-switch"
              className="simplified-exempt"
              dir="ltr"
            />
          </label>
          {profile.simplifiedMode && (
            <button onClick={() => setSimplified(false)} className={`mt-3 ${SECONDARY}`}>
              Switch to Standard View
            </button>
          )}
        </Section>

        <Section id="settings-comfort-title" title="Using apps" ruled className={GROUP}>
          <p className="mb-3 text-sm text-muted-foreground">
            How comfortable are you using apps? This only changes how much guidance we show —
            nothing is hidden either way.
          </p>
          <ul className={OPTIONS}>
            {(
              [
                ["very", "Very comfortable"],
                ["somewhat", "Somewhat"],
                ["not", "Not comfortable"],
              ] as const
            ).map(([id, label]) => (
              <li key={id}>
                <OptionButton
                  label={label}
                  selected={profile.comfortLevel === id}
                  onClick={() => {
                    saveProfile({ ...getProfile(), comfortLevel: id });
                    toast.success("Preference saved");
                  }}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="settings-tts-title" title="Reading aloud" ruled className={GROUP}>
          <p className="mb-3 text-sm text-muted-foreground">
            Listen buttons are always available. Tell us your preference and we'll put them front
            and center.
          </p>
          <ul className={OPTIONS}>
            {(
              [
                ["yes", "I prefer to listen"],
                ["sometimes", "Sometimes"],
                ["no", "I prefer to read"],
              ] as const
            ).map(([id, label]) => (
              <li key={id}>
                <OptionButton
                  label={label}
                  selected={profile.prefersTTS === id}
                  onClick={() => {
                    saveProfile({ ...getProfile(), prefersTTS: id });
                    toast.success("Preference saved");
                  }}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="settings-zip-title" title="Your zip code" ruled className={GROUP}>
          <p className="mb-3 text-sm text-muted-foreground">
            Optional. Used on your device to sort results by what's closest to you.
          </p>
          <label htmlFor="settings-zip" className="sr-only">
            Your Bronx zip code
          </label>
          <select
            id="settings-zip"
            value={profile.userZipCode}
            onChange={(e) => {
              saveProfile({ ...getProfile(), userZipCode: e.target.value });
              toast.success(
                e.target.value ? `Zip code set to ${e.target.value}` : "Zip code cleared",
              );
            }}
            className="h-12 w-full rounded-md border border-border bg-card px-3 text-base text-foreground focus-visible:border-primary focus-visible:outline-none"
          >
            <option value="">No zip code</option>
            {BRONX_ZIPS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Section>

        <Section id="settings-frequent-title" title="Frequently Used" ruled className={GROUP}>
          <label
            htmlFor="settings-tracking-switch"
            className="flex min-h-16 cursor-pointer items-center justify-between gap-4 border-b border-border py-3"
          >
            <span className="min-w-0">
              <span className="block font-bold">Enable usage tracking</span>
              <span className="block text-sm text-muted-foreground">
                Powers your personal "Top 3" on the home screen.
              </span>
            </span>
            <Switch
              aria-label="Enable usage tracking"
              checked={settings.trackingEnabled}
              onCheckedChange={(v) => {
                setSettings({ ...settings, trackingEnabled: v });
                toast.success(v ? "Tracking enabled" : "Tracking disabled");
              }}
              id="settings-tracking-switch"
              className="simplified-exempt"
              dir="ltr"
            />
          </label>
          <button
            onClick={() => {
              clearUsage();
              toast.success("Frequently Used history cleared");
            }}
            className={`mt-3 ${SECONDARY}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear my frequently used history
          </button>
        </Section>

        <Section id="settings-onboarding-title" title="Onboarding" ruled className={GROUP}>
          <p className="mb-3 text-sm text-muted-foreground">
            Go through the short welcome again — language and what you're looking for.
          </p>
          <button
            onClick={() => {
              resetOnboarding();
              toast.success("Onboarding reset");
              navigate({ to: "/onboarding" });
            }}
            className={SECONDARY}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset Onboarding
          </button>
        </Section>

        <DataControls />

        <p className="mt-6 mb-4 text-sm text-muted-foreground">
          Read our{" "}
          <Link to="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>{" "}
          — we never share your information with immigration or law enforcement.
        </p>
      </div>
    </AppShell>
  );
}

/** Settings groups sit inside the page column, so they drop Section's own width and padding. */
const GROUP = "max-w-none px-0";

/** Secondary action: a 2px outline that fills on hover (docs/design-system.md). */
const SECONDARY =
  "no-min-h inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-foreground px-4 py-2 text-sm font-bold text-foreground hover:bg-foreground hover:text-background";

/** One-of-three choices as rows between hairlines, a check on the chosen one. */
const OPTIONS = "divide-y divide-border border-y border-border";

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`no-min-h flex min-h-12 w-full items-center justify-between gap-3 py-2 text-start font-semibold hover:underline ${selected ? "text-primary" : "text-foreground"}`}
    >
      {label}
      {selected && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
    </button>
  );
}
