import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

export type DemoStep = {
  title: string;
  description: string;
  target?: string;
};

export const DEMO_STEPS: DemoStep[] = [
  {
    title: "Find Food Near You",
    description:
      "Say it in plain words — “I need food today” — and we build a pack of open pantries near your ZIP.",
    target: "#search-bar",
  },
  {
    title: "Browse by category",
    description:
      "Food, legal, health, jobs, childcare, youth and more — every category is one tap from home.",
    target: "#category-grid",
  },
  {
    title: "Get Directions",
    description:
      "Each card shows its distance and whether it's open right now. Tap “Get Directions” to use your maps app.",
    target: "#resource-card",
  },
  {
    title: "Share with a Neighbor · Report an Issue",
    description:
      "Open any resource to share it by SMS or WhatsApp, or report info that's wrong. Fixes show up publicly on the Data Quality page.",
    target: "#resource-card",
  },
  {
    title: "Text FOOD to our line",
    description:
      "No smartphone? Neighbors can text FOOD and get open pantries back as a plain text message.",
    target: "#sms-callout",
  },
];

const PAD = 8;

type Rect = { top: number; left: number; width: number; height: number };

export function DemoTour({
  steps = DEMO_STEPS,
  onClose,
}: {
  steps?: DemoStep[];
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[i];

  const measure = useCallback(() => {
    const el = step?.target ? document.querySelector(step.target) : null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    });
  }, [step]);

  useLayoutEffect(() => {
    const el = step?.target ? document.querySelector(step.target) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(measure, 380);
    measure();
    return () => clearTimeout(t);
  }, [step, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, steps.length]);

  if (typeof document === "undefined" || !step) return null;

  const below = rect ? rect.top + rect.height + 12 : 0;
  const spaceBelow = typeof window !== "undefined" ? window.innerHeight - below : 0;
  const placeBelow = !rect || spaceBelow > 220;
  const tooltipStyle: React.CSSProperties = rect
    ? placeBelow
      ? { top: below, left: 12, right: 12 }
      : { bottom: window.innerHeight - rect.top + 12, left: 12, right: 12 }
    : { top: "50%", left: 12, right: 12, transform: "translateY(-50%)" };

  return createPortal(
    <div
      className="fixed inset-0 z-[120]"
      role="dialog"
      aria-modal="true"
      aria-label="Guided demo tour"
    >
      <div className="absolute inset-0 bg-foreground/60" onClick={onClose} />
      {rect && (
        <div
          className="absolute rounded-2xl ring-4 ring-primary pointer-events-none transition-all duration-300"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px hsl(var(--foreground) / 0.6)",
          }}
        />
      )}
      <div
        className="absolute mx-auto max-w-md rounded-2xl border-2 border-primary bg-card p-4 shadow-2xl"
        style={tooltipStyle}
      >
        <div className="flex items-start gap-2">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground">
              Step {i + 1} of {steps.length}
            </p>
            <h2 className="font-bold text-foreground text-lg leading-tight mt-0.5">{step.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tour"
            className="no-min-h rounded-lg p-1.5 hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i === 0}
            className="no-min-h inline-flex items-center gap-1.5 rounded-lg border-2 border-border px-3 py-2 text-sm font-semibold disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-1" aria-hidden>
            {steps.map((_, n) => (
              <span
                key={n}
                className={`h-1.5 w-1.5 rounded-full ${n === i ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
          {i < steps.length - 1 ? (
            <button
              onClick={() => setI((v) => v + 1)}
              className="no-min-h inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="no-min-h inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
