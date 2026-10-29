import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Check, RotateCcw, Trash2 } from "lucide-react";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
import { Section } from "@/components/ui/section";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";
import { usePersonalization } from "@/lib/personalization";
import { clearCategoryHistory } from "@/lib/interest-history";
import { resetOnboarding, useProfile, saveProfile, getProfile, BRONX_ZIPS } from "@/lib/onboarding";
import { TextSizeControl } from "@/lib/text-size";
import { DataControls } from "./DataControls";

/**
 * Settings behind the profile icon (docs/product-scope.md): language, text
 * size, Simplified View, reading aloud, ZIP, suggestions and data controls.
 */
export function SettingsScreen() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const { settings, setSettings, clearUsage } = usePersonalization();
  const profile = useProfile();

  const setSimplified = (v: boolean) => {
    saveProfile({ ...getProfile(), simplifiedMode: v });
    toast.success(v ? t("settings.simplifiedToastOn") : t("settings.simplifiedToastOff"));
  };

  const clearHistory = () => {
    clearUsage();
    clearCategoryHistory();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("back")}
        </button>
        <PagePhoto slug={"grand-concourse"} />
        <h1 className="text-3xl text-foreground sm:text-4xl">{t("settings.title")}</h1>

        <Section
          id="settings-language-title"
          title={t("settings.language")}
          ruled
          className={GROUP}
        >
          <p className="mb-3 text-sm text-muted-foreground">{t("settings.languageHelp")}</p>
          <ul className={OPTIONS}>
            {LANGS.map((l) => (
              <li key={l.code}>
                <OptionButton
                  label={l.native}
                  lang={l.bcp47}
                  dir={l.dir}
                  selected={lang === l.code}
                  onClick={() => setLang(l.code)}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="settings-text-size-title"
          title={t("settings.textSize")}
          ruled
          className={GROUP}
        >
          <p className="mb-3 text-sm text-muted-foreground">{t("settings.textSizeHelp")}</p>
          <TextSizeControl />
        </Section>

        <Section
          id="settings-simplified-title"
          title={t("settings.simplified")}
          ruled
          className={GROUP}
        >
          <label
            htmlFor="settings-simplified-switch"
            className="flex min-h-16 cursor-pointer items-center justify-between gap-4 border-b border-border py-3"
          >
            <span className="min-w-0">
              <span className="block font-bold">
                {profile.simplifiedMode ? t("settings.simplifiedOn") : t("settings.simplified")}
              </span>
              <span className="block text-sm text-muted-foreground">
                {t("settings.simplifiedHelp")}
              </span>
            </span>
            {/* The row is the tap target. dir="ltr": the thumb slides by a physical offset,
                so in Arabic it would otherwise leave the track. */}
            <Switch
              aria-label={t("settings.simplified")}
              checked={profile.simplifiedMode}
              onCheckedChange={setSimplified}
              id="settings-simplified-switch"
              className="simplified-exempt"
              dir="ltr"
            />
          </label>
          {profile.simplifiedMode && (
            <button onClick={() => setSimplified(false)} className={`mt-3 ${SECONDARY}`}>
              {t("settings.standardView")}
            </button>
          )}
        </Section>

        <Section id="settings-tts-title" title={t("settings.tts")} ruled className={GROUP}>
          <p className="mb-3 text-sm text-muted-foreground">{t("settings.ttsHelp")}</p>
          <ul className={OPTIONS}>
            {(
              [
                ["yes", "settings.ttsYes"],
                ["sometimes", "settings.ttsSometimes"],
                ["no", "settings.ttsNo"],
              ] as const
            ).map(([id, key]) => (
              <li key={id}>
                <OptionButton
                  label={t(key)}
                  selected={profile.prefersTTS === id}
                  onClick={() => {
                    saveProfile({ ...getProfile(), prefersTTS: id });
                    toast.success(t("settings.prefSaved"));
                  }}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="settings-zip-title" title={t("settings.zip")} ruled className={GROUP}>
          <p className="mb-3 text-sm text-muted-foreground">{t("settings.zipHelp")}</p>
          <label htmlFor="settings-zip" className="sr-only">
            {t("settings.zipLabel")}
          </label>
          <select
            id="settings-zip"
            value={profile.userZipCode}
            onChange={(e) => {
              saveProfile({ ...getProfile(), userZipCode: e.target.value });
              toast.success(
                e.target.value
                  ? t("settings.zipSet", { zip: e.target.value })
                  : t("settings.zipCleared"),
              );
            }}
            className="h-12 w-full rounded-md border border-border bg-card px-3 text-base text-foreground focus-visible:border-primary focus-visible:outline-none"
          >
            <option value="">{t("settings.zipNone")}</option>
            {BRONX_ZIPS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Section>

        <Section
          id="settings-suggestions-title"
          title={t("settings.suggestions")}
          ruled
          className={GROUP}
        >
          <label
            htmlFor="settings-tracking-switch"
            className="flex min-h-16 cursor-pointer items-center justify-between gap-4 border-b border-border py-3"
          >
            <span className="min-w-0">
              <span className="block font-bold">{t("settings.remember")}</span>
              <span className="block text-sm text-muted-foreground">
                {t("settings.rememberHelp")}
              </span>
            </span>
            <Switch
              aria-label={t("settings.remember")}
              checked={settings.trackingEnabled}
              onCheckedChange={(v) => {
                setSettings({ ...settings, trackingEnabled: v });
                // Turning it off also forgets what was already remembered.
                if (!v) clearHistory();
                toast.success(v ? t("settings.rememberOn") : t("settings.rememberOff"));
              }}
              id="settings-tracking-switch"
              className="simplified-exempt"
              dir="ltr"
            />
          </label>
          <button
            onClick={() => {
              clearHistory();
              toast.success(t("settings.historyCleared"));
            }}
            className={`mt-3 ${SECONDARY}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> {t("settings.clearHistory")}
          </button>
        </Section>

        <Section id="settings-welcome-title" title={t("settings.welcome")} ruled className={GROUP}>
          <p className="mb-3 text-sm text-muted-foreground">{t("settings.welcomeHelp")}</p>
          <button
            onClick={() => {
              resetOnboarding();
              navigate({ to: "/onboarding" });
            }}
            className={SECONDARY}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t("settings.welcomeAgain")}
          </button>
        </Section>

        <DataControls />

        <p className="mt-6 mb-4 text-sm text-muted-foreground">
          {t("settings.privacyNote")}{" "}
          <Link to="/privacy" className="font-bold text-primary underline underline-offset-4">
            {t("settings.privacyLink")}
          </Link>
        </p>
      </div>
    </AppShell>
  );
}

/** Settings groups sit inside the page column, so they drop Section's own width and padding. */
const GROUP = "max-w-none px-0";

const SECONDARY =
  "no-min-h inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary";

/** One-of-several choices as rows between hairlines, a check on the chosen one. */
const OPTIONS = "divide-y divide-border border-y border-border";

function OptionButton({
  label,
  selected,
  onClick,
  lang,
  dir,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  lang?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`no-min-h flex min-h-12 w-full items-center justify-between gap-3 py-2 text-start font-semibold hover:underline ${selected ? "text-primary" : "text-foreground"}`}
    >
      <span lang={lang} dir={dir}>
        {label}
      </span>
      {selected && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
    </button>
  );
}
