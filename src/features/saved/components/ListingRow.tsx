import { Link } from "@tanstack/react-router";
import { RESOURCES } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import type { Lang } from "@/lib/i18n";

/**
 * One place in a list: name, address and phone from our own listing record.
 * A listing that was removed since it was saved still shows, so it can be
 * taken off the list.
 */
export function ListingRow({
  resourceId,
  action,
}: {
  resourceId: string;
  action?: React.ReactNode;
}) {
  const { lang, t } = useI18n();
  const r = RESOURCES.find((x) => x.id === resourceId);
  return (
    <li className="flex items-center gap-2 py-3">
      <div className="min-w-0 flex-1">
        {r ? (
          <>
            <Link
              to="/resource/$id"
              params={{ id: r.id }}
              className="no-min-h font-bold text-foreground hover:underline"
            >
              {r.name[lang]}
            </Link>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <bdi>{r.address}</bdi>
              {r.phone && (
                <>
                  {" · "}
                  <a href={`tel:${r.phone}`} dir="ltr" className="hover:underline">
                    {r.phone}
                  </a>
                </>
              )}
            </p>
            <p className="text-sm text-muted-foreground">{r.hours[lang]}</p>
          </>
        ) : (
          <p className="text-muted-foreground">{t("saved.unavailable")}</p>
        )}
      </div>
      {action}
    </li>
  );
}

/** The listing's name for labels like "Remove …". */
export function listingName(resourceId: string, lang: Lang) {
  return RESOURCES.find((x) => x.id === resourceId)?.name[lang] ?? resourceId;
}
