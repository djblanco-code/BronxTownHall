import { Link } from "@tanstack/react-router";
import { Heart, Share2, Sparkles, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { factOfTheDay, getLikedFacts, toggleLikedFact, type BronxFact } from "@/lib/bronx-facts";
import { A11yDialog } from "./A11yDialog";

const DISMISS_KEY = "bronx_fact_dismissed";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function BronxFactPopup() {
  const [fact, setFact] = useState<BronxFact | null>(null);
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const f = factOfTheDay();
    setFact(f);
    setLiked(getLikedFacts().includes(f.id));

    // Show once per calendar day, after the page has settled.
    const dismissed = typeof window !== "undefined" ? localStorage.getItem(DISMISS_KEY) : null;
    if (dismissed !== todayKey()) {
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  // Any way of closing counts: the fact pops up once, right when the app
  // opens — not again on every click or every trip back to the home page.
  const dismissForDay = () => {
    try { localStorage.setItem(DISMISS_KEY, todayKey()); } catch { /* ignore */ }
    setOpen(false);
  };

  const close = dismissForDay;

  const onLike = () => {
    if (!fact) return;
    const next = toggleLikedFact(fact.id);
    setLiked(next.includes(fact.id));
  };

  const onShare = async () => {
    if (!fact) return;
    const text = `Did you know? ${fact.fact} — via The Bronx App`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Bronx Fact of the Day", text });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShared(true); setTimeout(() => setShared(false), 1800);
      }
    } catch { /* user cancelled */ }
  };

  if (!fact) return null;

  return (
    <A11yDialog open={open} onClose={close} title="" className="max-w-lg">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" aria-hidden /> Bronx Fact of the Day
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
            {fact.category}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
          Did you know?
        </h2>
        <p className="mt-3 text-base sm:text-lg text-foreground/90 leading-relaxed">
          {fact.fact}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            to="/facts"
            onClick={close}
            className="no-min-h inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition min-h-[44px]"
          >
            <BookOpen className="h-4 w-4" /> See more facts
          </Link>
          <button
            type="button"
            onClick={onLike}
            aria-pressed={liked}
            aria-label={liked ? "Unlike this fact" : "Like this fact"}
            className={`no-min-h inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition min-h-[44px] ${
              liked ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-card text-foreground border-border hover:border-destructive/40"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {liked ? "Liked" : "Like"}
          </button>
          <button
            type="button"
            onClick={onShare}
            aria-label="Share this fact"
            className="no-min-h inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold border-2 border-border bg-card hover:bg-secondary min-h-[44px]"
          >
            <Share2 className="h-4 w-4" /> {shared ? "Copied!" : "Share"}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={dismissForDay}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Don&apos;t show again today
          </button>
          <button
            type="button"
            onClick={close}
            className="no-min-h px-5 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 min-h-[40px]"
          >
            Got it
          </button>
        </div>
      </div>
    </A11yDialog>
  );
}
