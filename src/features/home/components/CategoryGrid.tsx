import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { CategoryMeta } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { Section, SectionAction } from "@/components/ui/section";

/**
 * Category tiles: two across on phones, four on wider screens, each a soft
 * tinted mark and a label. The rest open in place.
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
      <ul id="category-grid" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {shown.map((c) => {
          const linkProps =
            c.id === "government"
              ? { to: "/civic" as const }
              : { to: "/category/$cat" as const, params: { cat: c.id } };
          return (
            <li key={c.id}>
              <Link
                {...linkProps}
                className="no-min-h group flex h-14 items-center gap-3 rounded-2xl border border-border bg-card ps-2 pe-3 transition hover:border-primary hover:shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl transition group-hover:scale-105"
                  style={{ backgroundColor: `color-mix(in oklch, ${c.color} 16%, transparent)` }}
                >
                  {c.emoji}
                </span>
                <span className="min-w-0 truncate text-sm font-semibold text-foreground">
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
