import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { DataControls } from "@/components/DataControls";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n-context";
import { usePersonalization } from "@/lib/personalization";
import { resetOnboarding, useProfile, saveProfile, getProfile, BRONX_ZIPS } from "@/lib/onboarding";
import { ArrowLeft, Trash2, Flame, RotateCcw, Accessibility, Volume2, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { TextSizeControl } from "@/lib/text-size";

export const Route = createFileRoute("/settings")({
  staticData: { sitemap: false }, component: SettingsPage });

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
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => navigate({ to: "/" })} className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Settings</h1>

        <section className="rounded-2xl border border-border bg-card p-5 mb-4">
          <h2 className="font-bold text-lg mb-2">Text size</h2>
          <p className="text-sm text-muted-foreground mb-3">Make words bigger across the whole app. Saved on this device{" "}(and to your account when you're signed in).</p>
          <TextSizeControl />
        </section>

        <section className="rounded-2xl border-2 border-primary/30 bg-card p-5 mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-3"><Accessibility className="h-5 w-5 text-primary" /> Simplified View</h2>
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="min-w-0">
              <p className="font-medium">{profile.simplifiedMode ? "Simplified View is ON" : "Simplified View"}</p>
              <p className="text-sm text-muted-foreground">Larger text, bigger buttons, and simpler navigation.</p>
            </div>
            <Switch
              aria-label="Simplified View"
              checked={profile.simplifiedMode}
              onCheckedChange={setSimplified}
            />
          </div>
          {profile.simplifiedMode && (
            <button
              onClick={() => setSimplified(false)}
              className="no-min-h mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium min-h-[44px]"
            >
              Switch to Standard View
            </button>
          )}
        </section>


        <section className="rounded-2xl border border-border bg-card p-5 mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-3"><Accessibility className="h-5 w-5 text-primary" /> Using apps</h2>
          <p className="text-sm text-muted-foreground mb-3">
            How comfortable are you using apps? This only changes how much guidance we show — nothing is hidden either way.
          </p>
          <div className="grid sm:grid-cols-3 gap-2">
            {([["very", "Very comfortable"], ["somewhat", "Somewhat"], ["not", "Not comfortable"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => { saveProfile({ ...getProfile(), comfortLevel: id }); toast.success("Preference saved"); }}
                aria-pressed={profile.comfortLevel === id}
                className={`no-min-h p-3 rounded-xl border-2 text-sm font-semibold min-h-[48px] ${profile.comfortLevel === id ? "border-primary bg-primary/10" : "border-border bg-card"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-3"><Volume2 className="h-5 w-5 text-accent" /> Reading aloud</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Listen buttons are always available. Tell us your preference and we'll put them front and center.
          </p>
          <div className="grid sm:grid-cols-3 gap-2">
            {([["yes", "I prefer to listen"], ["sometimes", "Sometimes"], ["no", "I prefer to read"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => { saveProfile({ ...getProfile(), prefersTTS: id }); toast.success("Preference saved"); }}
                aria-pressed={profile.prefersTTS === id}
                className={`no-min-h p-3 rounded-xl border-2 text-sm font-semibold min-h-[48px] ${profile.prefersTTS === id ? "border-primary bg-primary/10" : "border-border bg-card"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-3"><MapPin className="h-5 w-5 text-primary" /> Your zip code</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Optional. Used on your device to sort results by what's closest to you.
          </p>
          <label htmlFor="settings-zip" className="sr-only">Your Bronx zip code</label>
          <select
            id="settings-zip"
            value={profile.userZipCode}
            onChange={(e) => { saveProfile({ ...getProfile(), userZipCode: e.target.value }); toast.success(e.target.value ? `Zip code set to ${e.target.value}` : "Zip code cleared"); }}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-base min-h-[52px]"
          >
            <option value="">No zip code</option>
            {BRONX_ZIPS.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-3"><Flame className="h-5 w-5 text-warning" /> Frequently Used</h2>
          <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
            <div>
              <p className="font-medium">Enable usage tracking</p>
              <p className="text-sm text-muted-foreground">Powers your personal "Top 3" on the home screen.</p>
            </div>
            <Switch aria-label="Enable usage tracking" checked={settings.trackingEnabled} onCheckedChange={(v) => { setSettings({ ...settings, trackingEnabled: v }); toast.success(v ? "Tracking enabled" : "Tracking disabled"); }} />
          </div>
          <button onClick={() => { clearUsage(); toast.success("Frequently Used history cleared"); }} className="no-min-h mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium min-h-[44px]">
            <Trash2 className="h-4 w-4" /> Clear my frequently used history
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 mb-4">
          <h2 className="font-bold text-lg mb-2">Onboarding</h2>
          <p className="text-sm text-muted-foreground mb-3">Go through the short welcome again — language and what you're looking for.</p>
          <button onClick={() => { resetOnboarding(); toast.success("Onboarding reset"); navigate({ to: "/onboarding" }); }} className="no-min-h inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-secondary text-sm font-medium min-h-[44px]">
            <RotateCcw className="h-4 w-4" /> Reset Onboarding
          </button>
        </section>

        <div className="mb-4">
          <DataControls />
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Read our <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> — we never share your information with immigration or law enforcement.
        </p>
      </div>
    </AppShell>
  );
}

