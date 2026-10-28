import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createList, deleteList, fetchMyLists, type List } from "@/lib/cloud-lists";
import { toast } from "sonner";
import { ListPlus, Trash2, Globe, Lock, Share2 } from "lucide-react";

export const Route = createFileRoute("/lists")({
  staticData: { sitemap: false },
  component: ListsPage,
  head: () => ({
    meta: [
      { title: "My Lists — The Bronx App" },
      { name: "description", content: "Create and share custom resource lists." },
    ],
  }),
});

function ListsPage() {
  const { user, loading: authLoading } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    fetchMyLists().then(setLists).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createList({ name: name.trim(), is_public: isPublic });
      setName(""); setIsPublic(false);
      load();
      toast.success("List created");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this list?")) return;
    try { await deleteList(id); load(); toast.success("Deleted"); } catch (e) { toast.error((e as Error).message); }
  };

  if (authLoading) return <AppShell><div className="max-w-3xl mx-auto px-4 py-10">Loading…</div></AppShell>;

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <ListPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">My Lists</h1>
          <p className="text-muted-foreground mb-4">Sign in to create and share resource lists.</p>
          <Link to="/auth" className="inline-block px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Sign in</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">My Lists</h1>
        <p className="text-muted-foreground mb-6">Organize and share collections of resources.</p>

        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-4 mb-6 space-y-3">
          <h2 className="font-semibold">New list</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Food pantries near Fordham"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background" required maxLength={100} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Make public (anyone with the link can view)
          </label>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold">Create list</button>
        </form>

        {loading ? <p>Loading…</p> : lists.length === 0 ? (
          <p className="text-muted-foreground">No lists yet.</p>
        ) : (
          <ul className="space-y-3">
            {lists.map((l) => (
              <li key={l.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link to="/lists/$id" params={{ id: l.id }} className="font-semibold text-foreground hover:underline truncate block">{l.name}</Link>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {l.is_public ? <><Globe className="h-3.5 w-3.5" /> Public</> : <><Lock className="h-3.5 w-3.5" /> Private</>}
                  </p>
                </div>
                {l.is_public && (
                  <button title="Copy share link" onClick={() => {
                    const url = `${window.location.origin}/l/${l.share_slug}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Share link copied");
                  }} className="p-2 rounded-lg hover:bg-secondary"><Share2 className="h-4 w-4" /></button>
                )}
                <button title="Delete" onClick={() => handleDelete(l.id)} className="p-2 rounded-lg hover:bg-secondary text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
