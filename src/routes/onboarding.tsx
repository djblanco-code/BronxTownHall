import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackOnboardingStarted, trackOnboardingCompleted } from "@/lib/track-journey";
import { Heart, ChevronRight, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { Lang, LANGS } from "@/lib/i18n";
import { BRONX_ZIPS, Need, UserProfile, getProfile, saveProfile } from "@/lib/onboarding";

export const Route = createFileRoute("/onboarding")({
  staticData: { sitemap: false },
  component: OnboardingPage,
});

/**
 * Onboarding is deliberately SHORT: three screens, one of them skippable.
 * Everything else that used to live here (language tutorial, TTS tutorial,
 * comfort question, reading-aloud question) now lives in Settings with
 * sensible defaults, so nothing blocks a resident who needs help right now.
 */
type Step = "welcome" | "language" | "needs";

const NEEDS: { id: Need; label: string; emoji: string }[] = [
  { id: "food", label: "Food pantries", emoji: "🍎" },
  { id: "health", label: "Health clinics", emoji: "🏥" },
  { id: "legal", label: "Legal help", emoji: "⚖️" },
  { id: "jobs", label: "Jobs", emoji: "💼" },
  { id: "childcare", label: "Childcare", emoji: "🧸" },
  { id: "youth", label: "Youth activities", emoji: "🎒" },
  { id: "civic", label: "Civic information", emoji: "🏛️" },
];

function OnboardingPage() {
  const nav = useNavigate();
  const { setLang } = useI18n();
  const [step, setStep] = useState<Step>("welcome");
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());

  useEffect(() => {
    trackOnboardingStarted(profile.preferredLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (p: UserProfile, skipped = false) => {
    saveProfile({ ...p, completed: true });
    trackOnboardingCompleted({ interests: p.userNeeds, zipCode: p.userZipCode, skipped });
    setLang(p.preferredLanguage);
    nav({ to: "/" });
  };

  const toggleNeed = (id: Need) => {
    const on = profile.userNeeds.includes(id);
    let next = on ? profile.userNeeds.filter((x) => x !== id) : [...profile.userNeeds, id];
    if (next.length > 3) next = next.slice(0, 3);
    setProfile({ ...profile, userNeeds: next });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground shadow">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="font-bold text-lg">The Bronx App</span>
        </div>
        {step !== "welcome" && (
          <button
            onClick={() => finish(profile, true)}
            className="no-min-h text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 min-h-[44px]"
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {step === "welcome" && (
            <Card>
              <div className="text-center space-y-4">
                <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground shadow-lg">
                  <Heart className="h-10 w-10" fill="currentColor" />
                </div>
                <h1 className="text-3xl font-bold">The Bronx App</h1>
                <p className="text-lg text-muted-foreground">
                  Connecting 1.4 Million Neighbors to One Heartbeat
                </p>
                <button
                  onClick={() => setStep("language")}
                  className="no-min-h w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow min-h-[56px]"
                >
                  Get Started
                </button>
              </div>
            </Card>
          )}

          {step === "language" && (
            <Card>
              <div className="space-y-5">
                <Dots step={2} total={3} />
                <h2 className="text-xl font-bold">What language do you prefer?</h2>
                <div className="space-y-2">
                  {LANGS.map((l) => (
                    <Pick
                      key={l.code}
                      active={profile.preferredLanguage === l.code}
                      onClick={() => {
                        const p = { ...profile, preferredLanguage: l.code as Lang };
                        setProfile(p);
                        setLang(l.code as Lang);
                        setStep("needs");
                      }}
                    >
                      {l.native} — {l.label}
                    </Pick>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {step === "needs" && (
            <Card>
              <div className="space-y-5">
                <Dots step={3} total={3} />
                <div>
                  <h2 className="text-xl font-bold">What do you need help finding most?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose up to 3 — this decides what we show first.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {NEEDS.map((n) => {
                    const on = profile.userNeeds.includes(n.id);
                    return (
                      <button
                        key={n.id}
                        onClick={() => toggleNeed(n.id)}
                        aria-pressed={on}
                        className={`no-min-h text-left p-3 rounded-xl border-2 min-h-[64px] flex items-center gap-2 ${on ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                      >
                        <span className="text-2xl" aria-hidden>
                          {n.emoji}
                        </span>
                        <span className="font-medium text-sm flex-1">{n.label}</span>
                        {on && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <label htmlFor="ob-zip" className="block font-bold">
                    Your Bronx zip code
                  </label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Optional — it lets us sort results by what's closest.
                  </p>
                  <select
                    id="ob-zip"
                    value={profile.userZipCode}
                    onChange={(e) => setProfile({ ...profile, userZipCode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-base min-h-[52px]"
                  >
                    <option value="">Select a zip code…</option>
                    {BRONX_ZIPS.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => finish(profile)}
                  className="no-min-h w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold min-h-[56px] inline-flex items-center justify-center gap-2"
                >
                  Go to the app <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => finish({ ...profile, userNeeds: [], userZipCode: "" }, true)}
                  className="no-min-h w-full py-3 text-base font-semibold text-muted-foreground hover:text-foreground underline min-h-[48px]"
                >
                  Skip for now
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-border bg-card shadow-xl p-6 sm:p-8">
      {children}
    </div>
  );
}

function Pick({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`no-min-h w-full text-left p-4 rounded-xl border-2 min-h-[56px] flex items-center justify-between ${active ? "border-primary bg-primary/10" : "border-border bg-card"}`}
    >
      <span className="font-medium">{children}</span>
      {active && <Check className="h-5 w-5 text-primary" />}
    </button>
  );
}

function Dots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full ${i + 1 === step ? "w-8 bg-primary" : i + 1 < step ? "w-2 bg-primary/60" : "w-2 bg-border"}`}
        />
      ))}
    </div>
  );
}
