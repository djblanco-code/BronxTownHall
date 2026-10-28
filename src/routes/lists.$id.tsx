import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { fetchListWithItems, removeFromList, updateList, type List, type ListItem } from "@/lib/cloud-lists";
import { RESOURCES } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { toast } from "sonner";
import { ArrowLeft, Printer, Share2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/lists/$id")({
  staticData: { sitemap: false }, component: ListDetail });

function ListDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { lang } = useI18n();
  const [data, setData] = useState<{ list: List; items: ListItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchListWithItems(id).then(setData).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  if (loading) return <AppShell><div className="max-w-3xl mx-auto px-4 py-10">Loading…</div></AppShell>;
  if (!data) return <AppShell><div className="max-w-3xl mx-auto px-4 py-10">List not found.</div></AppShell>;
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

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 print-area">
        <button onClick={() => nav({ to: "/lists" })} className="print-hide inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> All lists
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">{list.name}</h1>
        {list.description && <p className="text-muted-foreground mb-3">{list.description}</p>}

        <div className="print-hide flex flex-wrap gap-2 mb-6">
          <button onClick={togglePublic} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary">
            {list.is_public ? "Make private" : "Make public"}
          </button>
          {list.is_public && (
            <button onClick={copyShareLink} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary inline-flex items-center gap-1.5">
              <Share2 className="h-4 w-4" /> Copy share link
            </button>
          )}
          <button onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary inline-flex items-center gap-1.5">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-muted-foreground">No resources in this list yet. Use "Add to list" on any resource page.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => {
              const r = RESOURCES.find((x) => x.id === it.resource_id);
              if (!r) return null;
              return (
                <li key={it.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link to="/resource/$id" params={{ id: r.id }} className="font-semibold hover:underline">{r.name[lang]}</Link>
                    <p className="text-sm text-muted-foreground">{r.address} · {r.phone}</p>
                  </div>
                  <button className="print-hide p-2 rounded-lg hover:bg-secondary text-destructive" onClick={async () => {
                    await removeFromList(list.id, r.id); toast.success("Removed"); load();
                  }}>
                    <Trash2 className="h-4 w-4" />
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
