import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ResourceCard } from "@/features/resources";
import { useI18n } from "@/lib/i18n-context";
import { usePersonalization } from "@/lib/personalization";
import { RESOURCES } from "@/lib/data";
import { ArrowLeft, Star } from "lucide-react";
import { isNonSpecificAddress } from "@/lib/address";
import { useResourceMeta } from "@/lib/resource-meta";
import { useLiveDistances } from "@/lib/live-location";
import { useMemo } from "react";

export const Route = createFileRoute("/favorites")({
  staticData: { sitemap: false },
  component: FavoritesPage,
});

function FavoritesPage() {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
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
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("back")}
        </button>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">My Favorites</h1>
        <p className="mt-1 mb-6 text-muted-foreground">
          {items.length} saved {items.length === 1 ? "resource" : "resources"}
        </p>

        {items.length === 0 ? (
          <div className="flex items-start gap-3 border-y border-border py-5">
            <Star className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground">You haven't saved any favorites yet.</p>
              <p className="mt-1 text-muted-foreground">
                Tap the star on any resource to save it here.
              </p>
              <Link
                to="/"
                className="no-min-h mt-4 inline-flex h-11 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Browse resources
              </Link>
            </div>
          </div>
        ) : (
          <ul className="">
            {items.map((r) => (
              <li key={r.id}>
                <ResourceCard resource={r} meta={resMeta[r.id]} showCategory />
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
