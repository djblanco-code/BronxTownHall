import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
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
    fetchMyLists()
      .then(setLists)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createList({ name: name.trim(), is_public: isPublic });
      setName("");
      setIsPublic(false);
      load();
      toast.success("List created");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this list?")) return;
    try {
      await deleteList(id);
      load();
      toast.success("Deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (authLoading)
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-10">Loading…</div>
      </AppShell>
    );

  if (!user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-3xl text-foreground sm:text-4xl">My Lists</h1>
          <div className="mt-6 flex items-start gap-3 border-y border-border py-5">
            <ListPlus
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground">Sign in to create and share resource lists.</p>
              <Link
                to="/auth"
                className="no-min-h mt-4 inline-flex h-11 items-center rounded-md bg-primary-fill px-5 font-semibold text-primary-fill-foreground hover:bg-primary-fill-hover"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-3xl text-foreground sm:text-4xl">My Lists</h1>
        <p className="mt-1 mb-6 text-muted-foreground">
          Organize and share collections of resources.
        </p>

        <form
          onSubmit={handleCreate}
          className="mb-8 space-y-3 rounded-md border border-border p-4"
        >
          <h2 className="text-lg font-bold">New list</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Food pantries near Fordham"
            className="h-11 w-full rounded-md border border-border bg-background px-3 focus-visible:border-primary focus-visible:outline-none"
            required
            maxLength={100}
          />
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-primary"
            />
            Make public (anyone with the link can view)
          </label>
          <button
            type="submit"
            className="no-min-h h-11 rounded-md bg-primary-fill px-5 font-semibold text-primary-fill-foreground hover:bg-primary-fill-hover"
          >
            Create list
          </button>
        </form>

        {loading ? (
          <p>Loading…</p>
        ) : lists.length === 0 ? (
          <p className="border-y border-border py-4 text-muted-foreground">No lists yet.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {lists.map((l) => (
              <li key={l.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1 py-1">
                  <Link
                    to="/lists/$id"
                    params={{ id: l.id }}
                    className="no-min-h block truncate font-bold text-foreground hover:underline"
                  >
                    {l.name}
                  </Link>
                  <p className="label-caps mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                    {l.is_public ? (
                      <>
                        <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Private
                      </>
                    )}
                  </p>
                </div>
                {l.is_public && (
                  <button
                    title="Copy share link"
                    aria-label="Copy share link"
                    onClick={() => {
                      const url = `${window.location.origin}/l/${l.share_slug}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Share link copied");
                    }}
                    className="no-min-h grid h-11 w-11 shrink-0 place-items-center rounded-md text-foreground hover:bg-secondary"
                  >
                    <Share2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
                <button
                  title="Delete"
                  aria-label="Delete"
                  onClick={() => handleDelete(l.id)}
                  className="no-min-h grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
