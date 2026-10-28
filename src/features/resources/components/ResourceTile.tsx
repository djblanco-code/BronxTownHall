import { Link } from "@tanstack/react-router";
import { CATEGORIES, type Resource } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { LANGS } from "@/lib/i18n";
import { formatClock, useNycTime } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";
import { openingLine } from "../lib/opening-line";

/**
 * A listing as a small tile for swipeable rows on Home ("Open tonight",
 * "Picked for you"). Lists of listings use `ResourceCard`.
 */
export function ResourceTile({ resource: r }: { resource: Resource }) {
  const { t, lang } = useI18n();
  const category = CATEGORIES.find((c) => c.id === r.category);

  return (
    <Link
      to="/resource/$id"
      params={{ id: r.id }}
      className="no-min-h flex w-full flex-col rounded-2xl border border-border bg-card p-3 transition hover:border-primary hover:shadow-md"
    >
      <span className="flex items-center gap-2">
        {category && (
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xl"
            style={{ backgroundColor: category.color }}
          >
            {category.emoji}
          </span>
        )}
        <span className="min-w-0 truncate text-xs text-muted-foreground">
          {category ? t(category.labelKey) : null}
          {r.distance >= 0 && (
            <>
              {" · "}
              {r.distance} {t("miles")}
            </>
          )}
        </span>
      </span>
      <span className="mt-2 line-clamp-2 font-semibold text-foreground">{r.name[lang]}</span>
      <span className="mt-auto truncate pt-1 text-xs text-muted-foreground">{r.neighborhood}</span>
      <OpeningStatusLine hours={r.hours.en} className="mt-1" />
    </Link>
  );
}

/** "Open until 8 PM" in green, "Opens at 3 PM" in grey, or nothing when the hours can't be read. */
export function OpeningStatusLine({ hours, className }: { hours: string; className?: string }) {
  const { t, lang } = useI18n();
  const now = useNycTime();
  const line = now ? openingLine(hours, now) : null;
  if (!line) return null;
  const locale = LANGS.find((l) => l.code === lang)?.bcp47;
  const text =
    "time" in line
      ? t(`resources.${line.key}`, { time: formatClock(line.time, locale) })
      : t(`resources.${line.key}`);
  return (
    <span
      className={cn(
        "block truncate text-xs font-semibold",
        line.open ? "text-success" : "text-muted-foreground",
        className,
      )}
    >
      {text}
    </span>
  );
}
