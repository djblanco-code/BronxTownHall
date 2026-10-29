import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import { factOfTheDay, type BronxFact } from "@/lib/bronx-facts";

/**
 * The quiet end of Home: today's Bronx fact as a pull quote, and a line for
 * reporting something missing or wrong. No boxes, so it never competes with
 * finding help.
 */
export function HomeExtras({ onFeedback }: { onFeedback: () => void }) {
  const { t } = useI18n();
  const [fact, setFact] = useState<BronxFact | null>(null);
  // Picked on the client so the server and browser agree on the day.
  useEffect(() => setFact(factOfTheDay()), []);

  return (
    <section className="mx-auto mt-10 grid max-w-5xl gap-8 px-4 sm:grid-cols-2">
      <figure className="m-0">
        <figcaption className="label-caps text-muted-foreground">{t("home.didYouKnow")}</figcaption>
        <span
          aria-hidden="true"
          className="font-display -mb-2 block h-10 text-7xl leading-none text-bronx-orange"
        >
          “
        </span>
        <blockquote className="font-display m-0 min-h-14 text-xl leading-snug font-bold text-foreground">
          {fact?.fact}
        </blockquote>
        <Link
          to="/facts"
          className="mt-2 inline-block text-sm font-bold text-primary underline underline-offset-4"
        >
          {t("home.moreFacts")}
        </Link>
      </figure>
      <div className="border-t border-border pt-4 sm:border-t-0 sm:pt-0">
        <p className="font-bold text-foreground">{t("home.feedbackTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("home.feedbackBody")}</p>
        <button
          type="button"
          onClick={onFeedback}
          className="no-min-h mt-3 h-11 rounded-md border-2 border-foreground px-4 text-sm font-bold text-foreground hover:bg-foreground hover:text-background"
        >
          {t("home.feedbackCta")}
        </button>
      </div>
    </section>
  );
}
