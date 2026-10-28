import { useEffect, useState } from "react";
import { useRouterState, useNavigate, Link } from "@tanstack/react-router";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

type Step = {
  title: string;
  body: string;
  path: string;
  cta?: string;
};

const steps: Step[] = [
  {
    title: "Welcome to the tour",
    body: "You're looking at a functional prototype of The Bronx App. This 60-second walkthrough hits the highlights. Use ← / → or the buttons.",
    path: "/",
  },
  {
    title: "Home — Your Bronx Today",
    body: "The home screen prioritizes urgent alerts, a daily Bronx fact, and quick paths to every category. Nothing is more than 2 taps away.",
    path: "/",
  },
  {
    title: "Urgent / SOS",
    body: "One-tap crisis flow: hotlines, live location share, escalation paths. Built for the moment someone needs help right now.",
    path: "/urgent",
  },
  {
    title: "Civic Command Center",
    body: "Enter a ZIP and instantly see your Community Board, Precinct, elected officials — with pre-filled contact templates and .ics calendar export.",
    path: "/civic",
  },
  {
    title: "Interactive Map + Transit",
    body: "Every resource on one map, clustered, with subway/bus lines shown per listing. Toggle to spreadsheet view for power users.",
    path: "/map",
  },
  {
    title: "Business Hub",
    body: "Free + Premium tiers. Businesses claim, upload storefront photos and short videos, and appear with verified badges.",
    path: "/businesses",
  },
  {
    title: "Entrepreneur Hub",
    body: "Aspiring founders get a roadmap, grants directory, advisors, and workshops. Leads captured to a moderation queue.",
    path: "/start-business",
  },
  {
    title: "Hyper-Local Events",
    body: "Community-submitted events with admin moderation, category filters, and calendar export.",
    path: "/events",
  },
  {
    title: "That's the tour",
    body: "You've seen the surface — there's much more underneath (RBAC, TTS, i18n in 5 languages, WCAG 2.2 AA, RLS). Ready to talk?",
    path: "/pitch",
    cta: "Back to pitch",
  },
];

const KEY = "bronx.tourStep";

export function TourOverlay() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search }) as { tour?: string };
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return Number(sessionStorage.getItem(KEY) ?? "0") || 0;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (typeof window !== "undefined") sessionStorage.setItem(KEY, String(step));
  }, [step]);

  if (!mounted) return null;
  const active = search?.tour === "1";
  if (!active) return null;

  const current = steps[Math.min(step, steps.length - 1)];

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next));
    setStep(clamped);
    const target = steps[clamped];
    if (target.path !== path) {
      navigate({ to: target.path, search: { tour: "1" } as never });
    }
  };

  const exit = () => {
    sessionStorage.removeItem(KEY);
    setStep(0);
    navigate({ to: path, search: {} });
  };

  return (
    <>
      {/* dim + spotlight ring for context */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="fixed left-1/2 -translate-x-1/2 app-float-bottom lg:bottom-8 z-[80] w-[min(560px,calc(100vw-1.5rem))]"
      >
        <div className="rounded-2xl bg-card border-2 border-primary shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              Guided Tour — Step {step + 1} / {steps.length}
            </div>
            <button
              onClick={exit}
              aria-label="Exit tour"
              className="no-min-h inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-primary-foreground/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <h2 id="tour-title" className="text-lg font-bold mb-1.5">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>

            {/* progress dots */}
            <div className="flex gap-1 mt-4" aria-hidden="true">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 gap-2">
              <button
                onClick={() => go(step - 1)}
                disabled={step === 0}
                className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={() => go(step + 1)}
                  className="no-min-h inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow hover:opacity-90"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  to="/pitch"
                  onClick={exit}
                  className="no-min-h inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow hover:opacity-90"
                >
                  {current.cta ?? "Finish"} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
