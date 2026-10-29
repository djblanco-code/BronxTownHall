import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Globe, Lock, Printer, Share2, Trash2 } from "lucide-react";
import { AppShell } from "@/features/shell";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/lib/i18n-context";
import {
  fetchListWithItems,
  removeFromList,
  updateList,
  type List,
  type ListItem,
} from "../lib/lists";
import { copyShareLink } from "../lib/share";
import { ListingRow, listingName } from "./ListingRow";
import { BACK_LINK, ICON_BUTTON, SECONDARY_BUTTON } from "./styles";

/** One of the resident's own lists, with sharing, printing and removing. */
export function ListDetailScreen({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<{ list: List; items: ListItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchListWithItems(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(load, [load]);

  const back = (
    <Link to="/lists" className={`print-hide ${BACK_LINK}`}>
      <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("saved.allLists")}
    </Link>
  );

  if (loading || !data) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-6">
          {back}
          {loading ? (
            <p role="status">{t("saved.loading")}</p>
          ) : (
            <>
              <h1 className="text-3xl text-foreground sm:text-4xl">{t("saved.myLists")}</h1>
              <EmptyState className="mt-6" title={t("saved.notFound")} />
            </>
          )}
        </div>
      </AppShell>
    );
  }
  const { list, items } = data;

  const togglePublic = async () => {
    try {
      await updateList(list.id, { is_public: !list.is_public });
      toast.success(list.is_public ? t("saved.nowPrivate") : t("saved.nowPublic"));
    } catch {
      toast.error(t("saved.error"));
    }
    load();
  };

  return (
    <AppShell>
      <div className="print-area mx-auto max-w-5xl px-4 py-6">
        {back}
        <h1 dir="auto" className="text-3xl text-foreground sm:text-4xl">
          {list.name}
        </h1>
        <p className="label-caps mt-1 flex items-center gap-1.5 text-muted-foreground">
          {list.is_public ? (
            <>
              <Globe className="h-3.5 w-3.5" aria-hidden="true" /> {t("saved.shared")}
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {t("saved.private")}
            </>
          )}
        </p>
        {list.description && (
          <p dir="auto" className="mt-1 text-muted-foreground">
            {list.description}
          </p>
        )}

        <div className="print-hide mt-4 mb-6 flex flex-wrap gap-2">
          <button onClick={togglePublic} className={SECONDARY_BUTTON}>
            {list.is_public ? t("saved.stopSharing") : t("saved.shareByLink")}
          </button>
          {list.is_public && (
            <button onClick={() => copyShareLink(list.share_slug, t)} className={SECONDARY_BUTTON}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> {t("saved.copyLink")}
            </button>
          )}
          <button onClick={() => window.print()} className={SECONDARY_BUTTON}>
            <Printer className="h-4 w-4" aria-hidden="true" /> {t("saved.print")}
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState title={t("saved.listEmpty")} />
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {items.map((it) => (
              <ListingRow
                key={it.id}
                resourceId={it.resource_id}
                action={
                  <button
                    aria-label={t("saved.remove", { name: listingName(it.resource_id, lang) })}
                    className={`print-hide ${ICON_BUTTON}`}
                    onClick={async () => {
                      try {
                        await removeFromList(list.id, it.resource_id);
                        toast.success(t("saved.removed"));
                      } catch {
                        toast.error(t("saved.error"));
                      }
                      load();
                    }}
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                }
              />
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
