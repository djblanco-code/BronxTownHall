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
    <li className="border-b border-border py-3">
      <div className="rounded-md border border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-foreground">{ad.headline}</p>
            {ad.body && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{ad.body}</p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="label-caps inline-flex items-center rounded-sm bg-foreground px-1.5 py-0.5 text-background">
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
                className="no-min-h mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border px-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
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
