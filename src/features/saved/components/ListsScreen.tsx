import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Globe, ListPlus, Lock, Share2, Trash2 } from "lucide-react";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n-context";
import { createList, deleteList, fetchMyLists, type List } from "../lib/lists";
import { copyShareLink } from "../lib/share";
import { BACK_LINK, ICON_BUTTON, PRIMARY_BUTTON } from "./styles";

/** A signed-in resident's own lists: make one, share one, delete one. */
export function ListsScreen() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    setState("loading");
    fetchMyLists()
      .then((l) => {
        setLists(l);
        setState("idle");
      })
      .catch(() => setState("error"));
  }, [user]);
  useEffect(load, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createList({ name: name.trim(), is_public: isPublic });
      setName("");
      setIsPublic(false);
      load();
      toast.success(t("saved.listCreated"));
    } catch {
      toast.error(t("saved.error"));
    }
  };

  const handleDelete = async (l: List) => {
    if (!confirm(t("saved.confirmDelete", { name: l.name }))) return;
    try {
      await deleteList(l.id);
      toast.success(t("saved.deleted"));
    } catch {
      toast.error(t("saved.error"));
    }
    load();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link to="/favorites" className={BACK_LINK}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />{" "}
          {t("saved.favoritesTitle")}
        </Link>
        <PagePhoto slug={"botanical-garden"} />
        <h1 className="text-3xl text-foreground sm:text-4xl">{t("saved.myLists")}</h1>
        <p className="mt-1 mb-6 text-muted-foreground">{t("saved.listsIntro")}</p>

        {authLoading ? (
          <p role="status">{t("saved.loading")}</p>
        ) : !user ? (
          <div className="flex items-start gap-3 border-y border-border py-5">
            <ListPlus
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground">{t("saved.listsSignIn")}</p>
              <Link to="/auth" className={`${PRIMARY_BUTTON} mt-4`}>
                {t("saved.signIn")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleCreate}
              className="mb-8 space-y-3 rounded-md border border-border p-4"
            >
              <h2 className="text-lg font-bold">{t("saved.newList")}</h2>
              <label className="block">
                <span className="sr-only">{t("saved.listName")}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("saved.listNamePlaceholder")}
                  dir="auto"
                  className="h-11 w-full rounded-md border border-border bg-background px-3 focus-visible:border-primary focus-visible:outline-none"
                  required
                  maxLength={100}
                />
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-primary"
                />
                {t("saved.makePublic")}
              </label>
              <button type="submit" className={PRIMARY_BUTTON}>
                {t("saved.createList")}
              </button>
            </form>

            {state === "loading" ? (
              <p role="status">{t("saved.loading")}</p>
            ) : state === "error" ? (
              <EmptyState
                title={t("saved.loadError")}
                action={
                  <button onClick={load} className="font-bold text-primary underline">
                    {t("saved.retry")}
                  </button>
                }
              />
            ) : lists.length === 0 ? (
              <EmptyState icon={ListPlus} title={t("saved.noLists")} />
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {lists.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 py-2">
                    <div className="min-w-0 flex-1 py-1">
                      <Link
                        to="/lists/$id"
                        params={{ id: l.id }}
                        dir="auto"
                        className="no-min-h block truncate font-bold text-foreground hover:underline"
                      >
                        {l.name}
                      </Link>
                      <p className="label-caps mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                        {l.is_public ? (
                          <>
                            <Globe className="h-3.5 w-3.5" aria-hidden="true" /> {t("saved.shared")}
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {t("saved.private")}
                          </>
                        )}
                      </p>
                    </div>
                    {l.is_public && (
                      <button
                        aria-label={t("saved.copyLink")}
                        title={t("saved.copyLink")}
                        onClick={() => copyShareLink(l.share_slug, t)}
                        className={ICON_BUTTON}
                      >
                        <Share2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      aria-label={t("saved.deleteList", { name: l.name })}
                      title={t("saved.deleteList", { name: l.name })}
                      onClick={() => handleDelete(l)}
                      className={ICON_BUTTON}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
