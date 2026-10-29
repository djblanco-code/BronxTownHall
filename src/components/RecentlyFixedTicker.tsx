import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

type FixedReport = {
  id: string;
  resource_name: string | null;
  resource_id: string;
  resolution_note: string | null;
  resolved_at: string | null;
  created_at: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function useRecentlyFixed(limit = 5) {
  const [items, setItems] = useState<FixedReport[]>([]);
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("resource_reports")
      .select("id, resource_name, resource_id, resolution_note, resolved_at, created_at")
      .eq("status", "fixed")
      .order("resolved_at", { ascending: false, nullsFirst: false })
      .limit(limit)
      .then(({ data }) => {
        if (!cancelled && data) setItems(data as FixedReport[]);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);
  return items;
}

export function RecentlyFixedTicker({ variant = "full" }: { variant?: "full" | "compact" }) {
  const items = useRecentlyFixed(5);
  if (items.length === 0) return null;

  if (variant === "compact") {
    const first = items[0];
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-hidden">
        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-hidden />
        <span className="truncate">
          <span className="font-semibold text-foreground">Recently fixed:</span>{" "}
          {first.resource_name ?? "A listing"}
          {first.resolution_note ? ` (${first.resolution_note})` : ""} —{" "}
          {timeAgo(first.resolved_at ?? first.created_at)}
        </span>
      </div>
    );
  }

  return (
    <section aria-label="Recently fixed listings" className="pt-2">
      <h2 className="text-lg font-bold sm:text-2xl">Recently fixed from community reports</h2>
      <p className="mt-1 mb-2 text-sm text-muted-foreground">
        Every report gets reviewed. Here's the latest {items.length} listings a Community Liaison
        updated after a neighbor flagged them.
      </p>
      <ul className="divide-y divide-border border-y border-border">
        {items.map((r) => (
          <li key={r.id} className="flex items-start gap-3 py-3">
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">
                {r.resource_name ?? "Listing updated"}
                {r.resolution_note ? (
                  <span className="font-normal text-muted-foreground"> — {r.resolution_note}</span>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {timeAgo(r.resolved_at ?? r.created_at)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
