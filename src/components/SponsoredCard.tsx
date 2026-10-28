import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { loadPlacement, type SponsoredPlacement } from "@/lib/ads";

/**
 * One sponsored card per category page, maximum. It carries a "Sponsored"
 * label exactly where real listings carry their verification badge, and it can
 * never display a trust badge — paying does not make a listing verified.
 */
export function SponsoredCard({ category }: { category: string }) {
  const [ad, setAd] = useState<SponsoredPlacement | null>(null);

  useEffect(() => {
    let alive = true;
    setAd(null);
    void loadPlacement("category_card", category).then((p) => {
      if (alive) setAd(p);
    });
    return () => {
      alive = false;
    };
  }, [category]);

  if (!ad) return null;

  return (
    <li>
      <div className="rounded-2xl border-2 border-dashed border-muted-foreground/50 bg-secondary/50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{ad.headline}</p>
            {ad.body && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{ad.body}</p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-foreground text-background text-xs font-bold uppercase tracking-wide">
                Sponsored
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Paid placement by {ad.sponsor_name}
              </span>
            </div>
            {ad.cta_url && (
              <a
                href={ad.cta_url}
                target="_blank"
                rel="noreferrer nofollow sponsored"
                className="no-min-h mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-foreground/70 text-sm font-semibold hover:bg-foreground hover:text-background transition"
              >
                {ad.cta_label || "Learn more"} <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
