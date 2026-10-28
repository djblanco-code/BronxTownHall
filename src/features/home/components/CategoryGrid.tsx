import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { CategoryMeta } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { Section, SectionAction } from "@/components/ui/section";

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
    <Section
      id="home-categories-title"
      title={t("interface.browseCategory")}
      className="mt-6"
      action={
        more.length > 0 && (
          <SectionAction
            aria-expanded={showAll}
            aria-controls="category-grid"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? t("home.showFewer") : t("home.seeAll")}
          </SectionAction>
        )
      }
    >
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
    </Section>
  );
}
