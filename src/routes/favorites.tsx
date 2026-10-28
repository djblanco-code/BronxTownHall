import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FavoriteStar } from "@/components/FavoriteStar";
import { useI18n } from "@/lib/i18n-context";
import { usePersonalization } from "@/lib/personalization";
import { CATEGORIES, RESOURCES } from "@/lib/data";
import { ArrowLeft, Star } from "lucide-react";
import { isNonSpecificAddress, LOCATION_VARIES_LABEL } from "@/lib/address";
import { VerifiedPill } from "@/components/VerifiedPill";
import { useResourceMeta } from "@/lib/resource-meta";
import { DirectionsLink } from "@/components/DirectionsLink";
import { useLiveDistances } from "@/lib/live-location";
import { useMemo } from "react";

export const Route = createFileRoute("/favorites")({
  staticData: { sitemap: false }, component: FavoritesPage });

function FavoritesPage() {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { favorites } = usePersonalization();
  const resMeta = useResourceMeta();
  const distanceFor = useLiveDistances(useMemo(() => favorites.map((id) => RESOURCES.find((r) => r.id === id)?.address ?? "").filter(Boolean), [favorites]));
  const items = (favorites.map((id) => RESOURCES.find((r) => r.id === id)).filter(Boolean) as typeof RESOURCES)
    .map((r) => (isNonSpecificAddress(r.address) ? r : { ...r, distance: distanceFor(r.address, r.distance) }));

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => navigate({ to: "/" })} className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Star className="h-7 w-7 fill-warning text-warning" /> My Favorites
        </h1>
        <p className="text-muted-foreground mb-6">{items.length} saved {items.length === 1 ? "resource" : "resources"}</p>

        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground">You haven't saved any favorites yet.</p>
            <p className="text-muted-foreground mt-1">Tap the star on any resource to save it here.</p>
            <Link to="/" className="no-min-h inline-block mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">Browse resources</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((r) => {
              const cat = CATEGORIES.find((c) => c.id === r.category);
              return (
                <li key={r.id}>
                  <div className="flex items-stretch gap-2">
                    <Link to="/resource/$id" params={{ id: r.id }} className="no-min-h flex-1 min-h-[80px] flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-md transition">
                      <div className="h-12 w-12 rounded-xl grid place-items-center text-2xl shrink-0" style={{ backgroundColor: cat?.color }}>{cat?.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{r.name[lang]}</p>
                        <p className="text-sm text-muted-foreground truncate">{cat ? t(cat.labelKey) : r.category} · {isNonSpecificAddress(r.address) ? LOCATION_VARIES_LABEL : `${r.distance} ${t("miles")}`}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <VerifiedPill
                            status={resMeta[r.id]?.verification_status ?? "needs_verification"}
                            lastVerified={resMeta[r.id]?.last_verified ?? null}
                            verifyEveryDays={resMeta[r.id]?.verify_every_days}
                            source={resMeta[r.id]?.source ?? undefined}
                            category={r.category}
                            compact
                          />
                        </div>
                      </div>
                    </Link>
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <FavoriteStar id={r.id} size="lg" />
                      {!isNonSpecificAddress(r.address) && <DirectionsLink address={r.address} label={`Get directions to ${r.name[lang]}`} iconOnly className="no-min-h h-10 w-10 justify-center rounded-full border border-border bg-card hover:bg-secondary hover:no-underline" />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
