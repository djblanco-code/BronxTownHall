import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useEffect, useState } from "react";
import {
  fetchListWithItems,
  removeFromList,
  updateList,
  type List,
  type ListItem,
} from "@/lib/cloud-lists";
import { RESOURCES } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { toast } from "sonner";
import { ArrowLeft, Printer, Share2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/lists_/$id")({
  staticData: { sitemap: false },
  component: ListDetail,
});

function ListDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { lang } = useI18n();
  const [data, setData] = useState<{ list: List; items: ListItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchListWithItems(id)
      .then(setData)
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  if (loading)
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-10">Loading…</div>
      </AppShell>
    );
  if (!data)
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-10">List not found.</div>
      </AppShell>
    );
  const { list, items } = data;

  const togglePublic = async () => {
    await updateList(list.id, { is_public: !list.is_public });
    toast.success(list.is_public ? "List set to private" : "List is now public");
    load();
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/l/${list.share_slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  const secondary =
    "no-min-h inline-flex h-11 items-center gap-1.5 rounded-md border-2 border-foreground px-4 text-sm font-bold text-foreground hover:bg-foreground hover:text-background";

  return (
    <AppShell>
      <div className="print-area mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={() => nav({ to: "/lists" })}
          className="print-hide no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> All lists
        </button>
        <h1 dir="auto" className="text-3xl font-bold text-foreground sm:text-4xl">
          {list.name}
        </h1>
        {list.description && (
          <p dir="auto" className="mt-1 text-muted-foreground">
            {list.description}
          </p>
        )}

        <div className="print-hide mt-4 mb-6 flex flex-wrap gap-2">
          <button onClick={togglePublic} className={secondary}>
            {list.is_public ? "Make private" : "Make public"}
          </button>
          {list.is_public && (
            <button onClick={copyShareLink} className={secondary}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> Copy share link
            </button>
          )}
          <button onClick={() => window.print()} className={secondary}>
            <Printer className="h-4 w-4" aria-hidden="true" /> Print
          </button>
        </div>

        {items.length === 0 ? (
          <p className="border-y border-border py-4 text-muted-foreground">
            No resources in this list yet. Use "Add to list" on any resource page.
          </p>
        ) : (
          <ul className="divide-y divide-border border-t-[3px] border-b border-t-foreground border-b-border">
            {items.map((it) => {
              const r = RESOURCES.find((x) => x.id === it.resource_id);
              if (!r) return null;
              return (
                <li key={it.id} className="flex items-center gap-2 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/resource/$id"
                      params={{ id: r.id }}
                      className="no-min-h font-bold text-foreground hover:underline"
                    >
                      {r.name[lang]}
                    </Link>
                    <p dir="auto" className="mt-0.5 text-sm text-muted-foreground">
                      {r.address} · {r.phone}
                    </p>
                  </div>
                  <button
                    aria-label="Delete"
                    className="print-hide no-min-h grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                    onClick={async () => {
                      await removeFromList(list.id, r.id);
                      toast.success("Removed");
                      load();
                    }}
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
