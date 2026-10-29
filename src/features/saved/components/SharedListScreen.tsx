import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { AppShell } from "@/features/shell";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/lib/i18n-context";
import { fetchListBySlug, type SharedList } from "../lib/lists";
import { ListingRow } from "./ListingRow";
import { SECONDARY_BUTTON } from "./styles";

/** A list someone shared by link. Anyone can open it; it shows no owner. */
export function SharedListScreen({ slug }: { slug: string }) {
  const { t } = useI18n();
  const [list, setList] = useState<SharedList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListBySlug(slug)
      .then(setList)
      .catch(() => setList(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <AppShell>
      <div className="print-area mx-auto max-w-5xl px-4 py-6">
        {loading ? (
          <p role="status">{t("saved.loading")}</p>
        ) : !list ? (
          <>
            <h1 className="text-3xl text-foreground sm:text-4xl">{t("saved.myLists")}</h1>
            <EmptyState className="mt-6" title={t("saved.sharedNotFound")} />
          </>
        ) : (
          <>
            <h1 dir="auto" className="text-3xl text-foreground sm:text-4xl">
              {list.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{t("saved.sharedFrom")}</p>
            {list.description && (
              <p dir="auto" className="mt-1 text-muted-foreground">
                {list.description}
              </p>
            )}
            <button
              onClick={() => window.print()}
              className={`print-hide mt-4 mb-6 ${SECONDARY_BUTTON}`}
            >
              <Printer className="h-4 w-4" aria-hidden="true" /> {t("saved.print")}
            </button>
            {list.items.length === 0 ? (
              <EmptyState title={t("saved.listEmpty")} />
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {list.items.map((it) => (
                  <ListingRow key={it.resource_id} resourceId={it.resource_id} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
