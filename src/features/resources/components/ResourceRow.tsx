import { Link } from "@tanstack/react-router";
import { CATEGORIES, type Resource } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { CATEGORY_ICONS } from "../lib/category-icons";
import { OpeningStatusLine } from "./ResourceTile";

/**
 * A listing as one row of a ruled list (Home's "Open tonight"): a line icon
 * and a small capitals label in the category's color, then the name and
 * whether it's open. Wrap rows in a `<ul>` with `divide-y`.
 */
export function ResourceRow({ resource: r }: { resource: Resource }) {
  const { t, lang } = useI18n();
  const category = CATEGORIES.find((c) => c.id === r.category);
  const Icon = CATEGORY_ICONS[r.category];
  const label = [
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
        className="no-min-h group flex items-start gap-3 py-3"
        style={category ? { color: category.color } : undefined}
      >
        <Icon className="mt-4 h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="label-caps block truncate">{label}</span>
          <span className="block font-bold text-foreground group-hover:underline">
            {r.name[lang]}
          </span>
          <OpeningStatusLine hours={r.hours.en} className="mt-0.5" />
        </span>
      </Link>
    </li>
  );
}
