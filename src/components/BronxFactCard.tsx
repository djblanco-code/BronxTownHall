import { Link } from "@tanstack/react-router";
import { Heart, Share2, Sparkles, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { factOfTheDay, getLikedFacts, toggleLikedFact, type BronxFact } from "@/lib/bronx-facts";

export function BronxFactCard({
  fact: forced,
  compact = false,
}: {
  fact?: BronxFact;
  compact?: boolean;
}) {
  const [fact, setFact] = useState<BronxFact | null>(forced ?? null);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    // Compute on client to avoid SSR/locale hydration mismatch.
    const f = forced ?? factOfTheDay();
    setFact(f);
    setLiked(getLikedFacts().includes(f.id));
  }, [forced]);

  if (!fact) {
    return (
      <div
        className={`rounded-2xl border-2 border-border bg-card ${compact ? "p-4" : "p-5 sm:p-6"} animate-pulse min-h-[140px]`}
        aria-hidden
      />
    );
  }

  const onLike = () => {
    const next = toggleLikedFact(fact.id);
    setLiked(next.includes(fact.id));
  };
  const onShare = async () => {
    const text = `Did you know? ${fact.fact} — via Bronx Town Hall`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Bronx Fact of the Day", text });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <section
      aria-labelledby="bronx-fact-heading"
      className={`relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-md ${compact ? "p-4" : "p-5 sm:p-6"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
          <Sparkles className="h-4 w-4" aria-hidden /> Bronx Fact of the Day
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
          {fact.category}
        </span>
      </div>
      <h2
        id="bronx-fact-heading"
        className={`font-bold text-foreground leading-snug ${compact ? "text-base" : "text-lg sm:text-xl"}`}
      >
        Did you know?
      </h2>
      <p className={`mt-2 text-foreground/90 ${compact ? "text-sm" : "text-base sm:text-lg"}`}>
        {fact.fact}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          to="/facts"
          className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-fill text-primary-fill-foreground text-sm font-semibold hover:opacity-90 transition min-h-[40px]"
        >
          <BookOpen className="h-4 w-4" /> See more facts
        </Link>
        <button
          type="button"
          onClick={onLike}
          aria-pressed={liked}
          aria-label={liked ? "Unlike this fact" : "Like this fact"}
          className={`no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border-2 transition min-h-[40px] ${
            liked
              ? "bg-destructive/15 text-destructive border-destructive/30"
              : "bg-card text-foreground border-border hover:border-destructive/40"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {liked ? "Liked" : "Like"}
        </button>
        <button
          type="button"
          onClick={onShare}
          aria-label="Share this fact"
          className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border-2 border-border bg-card hover:bg-secondary min-h-[40px]"
        >
          <Share2 className="h-4 w-4" /> {shared ? "Copied!" : "Share"}
        </button>
      </div>
    </section>
  );
}
