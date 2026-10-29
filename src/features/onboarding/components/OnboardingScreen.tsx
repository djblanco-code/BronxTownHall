import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Landmark } from "lucide-react";
import { AppShell } from "@/features/shell";
import { heroPhotoFor, nycIsoDate } from "@/features/home";
import { CATEGORY_ICONS } from "@/features/resources";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/data";
import { trackOnboardingStarted, trackOnboardingCompleted } from "@/lib/track-journey";
import {
  BRONX_ZIPS,
  NEED_TO_CATEGORY,
  type Need,
  type UserProfile,
  getProfile,
  saveProfile,
} from "@/lib/onboarding";

/**
 * The short welcome: a photo and one sentence, the language, then up to three
 * needs and an optional ZIP code. Every step can be skipped, the app frame
 * (with SOS) stays on screen, and skipping never changes the language.
 */
type Step = "welcome" | "language" | "needs";

const NEEDS: Need[] = ["food", "health", "legal", "jobs", "childcare", "youth", "civic"];

export function OnboardingScreen() {
  const nav = useNavigate();
  const { t, lang, setLang } = useI18n();
  const [step, setStep] = useState<Step>("welcome");
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const photo = heroPhotoFor(nycIsoDate());

  useEffect(() => {
    trackOnboardingStarted(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The language on screen is the one to keep, whether it was picked here,
  // from the top bar, or came from the browser.
  const finish = (p: UserProfile, skipped = false) => {
    saveProfile({ ...p, preferredLanguage: lang, completed: true });
    trackOnboardingCompleted({ interests: p.userNeeds, zipCode: p.userZipCode, skipped });
    nav({ to: "/" });
  };

  const toggleNeed = (id: Need) => {
    const on = profile.userNeeds.includes(id);
    let next = on ? profile.userNeeds.filter((x) => x !== id) : [...profile.userNeeds, id];
    if (next.length > 3) next = next.slice(0, 3);
    setProfile({ ...profile, userNeeds: next });
  };

  const needLabel = (n: Need) => {
    if (n === "civic") return t("onboarding.needCivic");
    const cat = CATEGORIES.find((c) => c.id === NEED_TO_CATEGORY[n]);
    return cat ? t(cat.labelKey) : n;
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mx-auto max-w-xl">
          {step === "welcome" && (
            <>
              <div className="relative isolate overflow-hidden rounded-3xl bg-masthead">
                <img
                  src={`/images/bronx/${photo.slug}-800.webp`}
                  alt={photo.alt}
                  className="h-56 w-full object-cover sm:h-72"
                  style={{ objectPosition: photo.focus }}
                />
                <a
                  href={photo.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-min-h absolute top-3 end-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/90 hover:text-white"
                >
                  Photo: {photo.credit} · {photo.license}
                </a>
              </div>
              <h1 className="mt-5 text-4xl text-foreground sm:text-5xl">
                {t("onboarding.title", { app: t("appName") })}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">{t("onboarding.intro")}</p>
              <button onClick={() => setStep("language")} className={`mt-6 ${PRIMARY}`}>
                {t("onboarding.start")}
                <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </button>
              <button onClick={() => finish(profile, true)} className={SKIP}>
                {t("onboarding.skip")}
              </button>
            </>
          )}

          {step === "language" && (
            <>
              <p className="label-caps text-primary">
                {t("onboarding.step", { n: "1", total: "2" })}
              </p>
              <h1 className="mt-1 text-3xl text-foreground sm:text-4xl">
                {t("onboarding.languageTitle")}
              </h1>
              <p className="mt-1 text-muted-foreground">{t("onboarding.languageHelp")}</p>
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {LANGS.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => setLang(l.code)}
                      aria-pressed={lang === l.code}
                      className={`no-min-h flex min-h-14 w-full items-center justify-between gap-3 py-2 text-start text-lg font-semibold hover:underline ${lang === l.code ? "text-primary" : "text-foreground"}`}
                    >
                      <span lang={l.bcp47} dir={l.dir}>
                        {l.native}
                      </span>
                      {lang === l.code && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setStep("needs")} className={`mt-6 ${PRIMARY}`}>
                {t("onboarding.next")}
                <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </button>
              <button onClick={() => finish(profile, true)} className={SKIP}>
                {t("onboarding.skip")}
              </button>
            </>
          )}

          {step === "needs" && (
            <>
              <p className="label-caps text-primary">
                {t("onboarding.step", { n: "2", total: "2" })}
              </p>
              <h1 className="mt-1 text-3xl text-foreground sm:text-4xl">
                {t("onboarding.needsTitle")}
              </h1>
              <p className="mt-1 text-muted-foreground">{t("onboarding.needsHelp")}</p>
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {NEEDS.map((n) => {
                  const on = profile.userNeeds.includes(n);
                  const cat = CATEGORIES.find((c) => c.id === NEED_TO_CATEGORY[n]);
                  const Icon = n === "civic" ? Landmark : CATEGORY_ICONS[NEED_TO_CATEGORY[n]];
                  const color = cat?.color ?? "var(--primary)";
                  return (
                    <li key={n}>
                      <button
                        onClick={() => toggleNeed(n)}
                        aria-pressed={on}
                        className="no-min-h flex min-h-14 w-full items-center gap-3 py-2 text-start"
                      >
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                          style={{
                            color,
                            background: `color-mix(in oklch, ${color} 14%, white)`,
                          }}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span
                          className={`flex-1 font-bold ${on ? "text-primary" : "text-foreground"}`}
                        >
                          {needLabel(n)}
                        </span>
                        {on && (
                          <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <label htmlFor="ob-zip" className="mt-6 block font-bold">
                {t("onboarding.zipLabel")}
              </label>
              <p className="mb-2 text-sm text-muted-foreground">{t("onboarding.zipHelp")}</p>
              <select
                id="ob-zip"
                value={profile.userZipCode}
                onChange={(e) => setProfile({ ...profile, userZipCode: e.target.value })}
                className="h-12 w-full rounded-md border border-border bg-card px-3 text-base text-foreground focus-visible:border-primary focus-visible:outline-none"
              >
                <option value="">{t("onboarding.zipNone")}</option>
                {BRONX_ZIPS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>

              <button onClick={() => finish(profile)} className={`mt-6 ${PRIMARY}`}>
                {t("onboarding.done")}
                <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </button>
              <button
                onClick={() => finish({ ...profile, userNeeds: [], userZipCode: "" }, true)}
                className={SKIP}
              >
                {t("onboarding.skipForNow")}
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

const PRIMARY =
  "no-min-h inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-fill px-5 text-lg font-bold text-primary-fill-foreground hover:bg-primary-fill-hover";

const SKIP =
  "no-min-h mt-2 inline-flex min-h-11 w-full items-center justify-center font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground";
