import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CATEGORIES, type Resource } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { OpeningStatusLine } from "./ResourceTile";

/**
 * A listing as one row of a grouped list (Home's "Open tonight"): category
 * mark, name, where, and whether it's open. Wrap rows in a `<ul>` with
 * `divide-y`.
 */
export function ResourceRow({ resource: r }: { resource: Resource }) {
  const { t, lang } = useI18n();
  const category = CATEGORIES.find((c) => c.id === r.category);
  const where = [
    category ? t(category.labelKey) : null,
    r.neighborhood,
    r.distance >= 0 ? `${r.distance} ${t("miles")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Link
        to="/resource/$id"
        params={{ id: r.id }}
        className="no-min-h flex items-center gap-3 px-3 py-3 transition hover:bg-secondary/60"
      >
        {category && (
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
            style={{ backgroundColor: `color-mix(in oklch, ${category.color} 16%, transparent)` }}
          >
            {category.emoji}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground">{r.name[lang]}</span>
          <span className="block truncate text-xs text-muted-foreground">{where}</span>
          <OpeningStatusLine hours={r.hours.en} className="mt-0.5" />
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
