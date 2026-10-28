import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { CategoryMeta } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";

/**
 * Compact icon grid: four across on phones, so eight categories fit in two
 * rows above the fold. The rest open in place.
 */
export function CategoryGrid({
  featured,
  more,
}: {
  featured: CategoryMeta[];
  more: CategoryMeta[];
}) {
  const { t } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? [...featured, ...more] : featured;

  return (
    <section aria-labelledby="home-categories-title" className="mx-auto mt-6 max-w-5xl px-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 id="home-categories-title" className="text-lg font-bold text-foreground sm:text-2xl">
          {t("interface.browseCategory")}
        </h2>
        {more.length > 0 && (
          <button
            type="button"
            aria-expanded={showAll}
            aria-controls="category-grid"
            onClick={() => setShowAll((v) => !v)}
            className="no-min-h simplified-exempt shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            {showAll ? t("home.showFewer") : t("home.seeAll")}
          </button>
        )}
      </div>
      <ul id="category-grid" className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-8">
        {shown.map((c) => {
          const linkProps =
            c.id === "government"
              ? { to: "/civic" as const }
              : { to: "/category/$cat" as const, params: { cat: c.id } };
          return (
            <li key={c.id}>
              <Link
                {...linkProps}
                className="no-min-h group flex flex-col items-center gap-1.5 text-center"
              >
                <span
                  aria-hidden="true"
                  className="grid aspect-square w-full max-w-16 place-items-center rounded-2xl text-2xl shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md"
                  style={{ backgroundColor: c.color }}
                >
                  {c.emoji}
                </span>
                <span className="text-xs font-semibold leading-tight text-foreground">
                  {t(c.labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
