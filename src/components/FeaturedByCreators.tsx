import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { featuredBy, type Creator } from "@/lib/creators";
import { Quote } from "lucide-react";

/**
 * "Featured by" line on a listing. A creator's pick is a personal
 * recommendation and is shown separately from our verification badge.
 */
export function FeaturedByCreators({ targetId }: { targetId: string }) {
  const [rows, setRows] = useState<{ creator: Creator; note: string | null }[]>([]);

  useEffect(() => {
    let cancelled = false;
    featuredBy(targetId).then((r) => {
      if (!cancelled) setRows(r);
    });
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  if (rows.length === 0) return null;

  return (
    <div className="mt-3 rounded-2xl border border-border bg-secondary/50 p-3">
      {rows.map(({ creator, note }) => (
        <p key={creator.id} className="text-sm">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Quote className="h-3.5 w-3.5" /> Featured by{" "}
            <Link
              to="/creators/$handle"
              params={{ handle: creator.handle }}
              className="no-min-h text-primary hover:underline"
            >
              {creator.display_name}
            </Link>
          </span>
          {note && <span className="block text-muted-foreground mt-0.5">&ldquo;{note}&rdquo;</span>}
        </p>
      ))}
    </div>
  );
}
