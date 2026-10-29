import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { factOfTheDay, type BronxFact } from "@/lib/bronx-facts";

/**
 * The quiet end of Home: today's Bronx fact as one short card and a way to
 * report something missing or wrong. Kept small so it never competes with
 * finding help.
 */
export function HomeExtras({ onFeedback }: { onFeedback: () => void }) {
  const { t } = useI18n();
  const [fact, setFact] = useState<BronxFact | null>(null);
  // Picked on the client so the server and browser agree on the day.
  useEffect(() => setFact(factOfTheDay()), []);

  return (
    <section className="mx-auto mt-10 grid max-w-5xl gap-3 px-4 sm:grid-cols-2">
      <div className="flex min-h-20 items-start gap-3 rounded-2xl bg-secondary p-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t("home.didYouKnow")}</p>
          <p className="text-sm text-muted-foreground">{fact?.fact}</p>
          <Link
            to="/facts"
            className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
          >
            {t("home.moreFacts")}
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4">
        <MessageCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t("home.feedbackTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("home.feedbackBody")}</p>
        </div>
        <button
          type="button"
          onClick={onFeedback}
          className="no-min-h h-10 shrink-0 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-background"
        >
          {t("home.feedbackCta")}
        </button>
      </div>
    </section>
  );
}
