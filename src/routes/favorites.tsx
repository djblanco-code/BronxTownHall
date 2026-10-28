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
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Star className="h-7 w-7 fill-warning text-warning" /> My Favorites
        </h1>
        <p className="text-muted-foreground mb-6">
          {items.length} saved {items.length === 1 ? "resource" : "resources"}
        </p>

        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground">You haven't saved any favorites yet.</p>
            <p className="text-muted-foreground mt-1">
              Tap the star on any resource to save it here.
            </p>
            <Link
              to="/"
              className="no-min-h inline-block mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              Browse resources
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
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
