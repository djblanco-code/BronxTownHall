import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import { factOfTheDay, type BronxFact } from "@/lib/bronx-facts";

/** Today's Bronx fact as a soft pull-quote card, between the lists and Town Hall. */
export function FactOfTheDay() {
  const { t } = useI18n();
  const [fact, setFact] = useState<BronxFact | null>(null);
  // Picked on the client so the server and browser agree on the day.
  useEffect(() => setFact(factOfTheDay()), []);

  return (
    <section className="mx-auto mt-8 max-w-5xl px-4">
      <figure className="m-0 rounded-2xl bg-secondary p-5">
        <figcaption className="label-caps text-muted-foreground">{t("home.didYouKnow")}</figcaption>
        <span
          aria-hidden="true"
          className="font-display -mb-3 block h-10 text-6xl leading-none text-bronx-orange"
        >
          “
        </span>
        <blockquote className="font-display m-0 min-h-14 text-xl leading-snug font-bold text-foreground">
          {fact?.fact}
        </blockquote>
        <Link
          to="/facts"
          className="mt-2 inline-block text-sm font-bold text-primary hover:underline"
        >
          {t("home.moreFacts")}
        </Link>
      </figure>
    </section>
  );
}
