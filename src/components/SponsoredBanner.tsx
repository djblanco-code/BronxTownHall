import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { loadPlacement, type SponsoredPlacement } from "@/lib/ads";

/**
 * A single, modest homepage banner. Not a carousel, never a pop-up, and chosen
 * without reading anything about the visitor.
 */
export function SponsoredBanner() {
  const [ad, setAd] = useState<SponsoredPlacement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadPlacement("homepage_banner")
      .then((p) => {
        if (alive) {
          setAd(p);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // House ad shown until a real sponsor is active. Same container and the
  // same "Sponsored" label, so swapping in a paid sponsor is a content swap.
  const isHouse = !ad;
  const sponsorName = ad?.sponsor_name ?? "The Bronx App";
  const headline = ad?.headline ?? "Your business could be here";
  const body = ad?.body ?? "Reach Bronx residents looking for food, jobs, health care, and more.";
  const ctaLabel = ad?.cta_label ?? "Advertise with us";

  if (!loaded) return null;

  return (
    <aside aria-label="Sponsored message" className="max-w-5xl mx-auto px-4 mt-8">
      <div className="rounded-xl border border-dashed border-muted-foreground/50 bg-secondary/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-foreground text-background text-xs font-bold uppercase tracking-wide">
              Sponsored
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{sponsorName}</span>
          </div>
          <p className="font-bold text-foreground mt-1.5">{headline}</p>
          {body && <p className="text-sm text-muted-foreground mt-0.5">{body}</p>}
        </div>
        {isHouse ? (
          <Link
            to="/advertise"
            className="no-min-h inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-foreground/70 text-sm font-semibold hover:bg-foreground hover:text-background transition shrink-0"
          >
            {ctaLabel} <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        ) : ad.cta_url ? (
          <a
            href={ad.cta_url}
            target="_blank"
            rel="noreferrer nofollow sponsored"
            className="no-min-h inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-foreground/70 text-sm font-semibold hover:bg-foreground hover:text-background transition shrink-0"
          >
            {ctaLabel} <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {isHouse
          ? "This space is available for a local sponsor. Not chosen using your data."
          : "Paid placement. Not a verified resource and not chosen using your data."}
      </p>
    </aside>
  );
}
