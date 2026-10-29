import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Cloud, ListPlus, Smartphone, Star } from "lucide-react";
import { AppShell } from "@/features/shell";
import { ResourceCard } from "@/features/resources";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n-context";
import { usePersonalization } from "@/lib/personalization";
import { RESOURCES } from "@/lib/data";
import { isNonSpecificAddress } from "@/lib/address";
import { useResourceMeta } from "@/lib/resource-meta";
import { useLiveDistances } from "@/lib/live-location";
import { BACK_LINK, PRIMARY_BUTTON } from "./styles";

/** The Saved tab: starred places, where they're kept, and a way to lists. */
export function FavoritesScreen() {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites } = usePersonalization();
  const resMeta = useResourceMeta();
  const distanceFor = useLiveDistances(
    useMemo(
      () =>
        favorites.map((id) => RESOURCES.find((r) => r.id === id)?.address ?? "").filter(Boolean),
      [favorites],
    ),
  );
  const items = (
    favorites.map((id) => RESOURCES.find((r) => r.id === id)).filter(Boolean) as typeof RESOURCES
  ).map((r) =>
    isNonSpecificAddress(r.address) ? r : { ...r, distance: distanceFor(r.address, r.distance) },
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <button onClick={() => navigate({ to: "/" })} className={BACK_LINK}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("back")}
        </button>
        <h1 className="text-3xl text-foreground sm:text-4xl">{t("saved.favoritesTitle")}</h1>
        <p className="mt-1 text-muted-foreground">
          {items.length === 1
            ? t("saved.countOne")
            : t("saved.countMany", { n: items.length.toLocaleString(lang) })}
        </p>

        {/* Where these are kept, so nobody is surprised on a new phone. */}
        <p className="mt-3 mb-6 flex items-start gap-2 text-sm text-muted-foreground">
          {user ? (
            <>
              <Cloud className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("saved.syncedNote")}
            </>
          ) : (
            <>
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {t("saved.localNote")}{" "}
                <Link to="/auth" className="font-bold text-primary underline underline-offset-4">
                  {t("saved.signIn")}
                </Link>
              </span>
            </>
          )}
        </p>

        {items.length === 0 ? (
          <div className="flex items-start gap-3 border-y border-border py-5">
            <Star className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground">{t("saved.emptyTitle")}</p>
              <p className="mt-1 text-muted-foreground">{t("saved.emptyBody")}</p>
              <Link to="/search" className={`${PRIMARY_BUTTON} mt-4`}>
                {t("saved.browse")}
              </Link>
            </div>
          </div>
        ) : (
          <ul>
            {items.map((r) => (
              <li key={r.id}>
                <ResourceCard resource={r} meta={resMeta[r.id]} showCategory />
              </li>
            ))}
          </ul>
        )}

        <Link
          to="/lists"
          className="no-min-h group mt-6 flex items-center gap-3 border-y border-border py-4"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ListPlus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-foreground group-hover:underline">
              {t("saved.myLists")}
            </span>
            <span className="block text-sm text-muted-foreground">{t("saved.listsIntro")}</span>
          </span>
          <ChevronRight
            className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180"
            aria-hidden="true"
          />
        </Link>
      </div>
    </AppShell>
  );
}
