import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Ticket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate } from "@/lib/event-windows";
import { VerifiedPill } from "@/components/VerifiedPill";
import type { VerificationStatus } from "@/lib/verification";
import { trackEventViewed } from "@/lib/track-event";
import { loadDirectory } from "@/lib/bronx-resources";
import { useI18n } from "@/lib/i18n-context";

type Row = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  event_type: string;
  event_date: string;
  event_end_date: string | null;
  event_time: string | null;
  location: string | null;
  neighborhood: string | null;
  is_free: boolean;
  cost: string | null;
  source: string | null;
  verification_status: string | null;
  last_verified: string | null;
};

/**
 * "Happening near you" — the discovery surface. This is the part of the app a
 * plain directory cannot do: it changes week to week, so there is a reason to
 * come back.
 */
export function HappeningNear({ neighborhood }: { neighborhood?: string | null }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data }, directory] = await Promise.all([
        supabase
          .from("events")
          .select("id,title,description,category,event_type,event_date,event_time,location,neighborhood,is_free,cost,source,verification_status,last_verified")
          .eq("approval_status", "approved")
          .gte("event_date", today)
          .order("event_date", { ascending: true })
          .limit(60),
        loadDirectory(),
      ]);
      const submitted = ((data as Omit<Row, "event_end_date">[]) ?? []).map((event) => ({ ...event, event_end_date: null }));
      const imported = directory
        .filter((resource) => resource.resource_category === "community_events" && resource.event_date && (resource.event_end_date ?? resource.event_date) >= today)
        .map<Row>((resource) => ({
          id: `bx-${resource.id}`,
          title: resource.resource_name || resource.organization_name,
          description: resource.description,
          category: resource.resource_subcategory,
          event_type: "other",
          event_date: resource.event_date as string,
          event_end_date: resource.event_end_date ?? null,
          event_time: resource.event_time ?? null,
          location: resource.address,
          neighborhood: resource.neighborhood,
          is_free: true,
          cost: null,
          source: null,
          verification_status: "needs_verification",
          last_verified: null,
        }));
      if (alive) setRows([...submitted, ...imported].sort((a, b) => a.event_date.localeCompare(b.event_date)));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    let list = rows;
    if (neighborhood) {
      const local = list.filter((r) => r.neighborhood === neighborhood);
      if (local.length >= 2) list = local;
    }
    return list.slice(0, 3);
  }, [rows, neighborhood]);

  return (
    <section className="max-w-5xl mx-auto px-4 mt-5" aria-label={t("interface.upcomingEvents")}>
      <div className="flex items-end justify-between gap-2 mb-2">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          {t("interface.upcomingEvents")}
          {neighborhood && <span className="text-xs font-medium text-muted-foreground">· {neighborhood}</span>}
        </h2>
        <Link to="/events" className="no-min-h text-sm font-semibold text-primary hover:underline">
          {t("interface.allEvents")} →
        </Link>
      </div>

      {rows === null ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("interface.loadingEvents")}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">{t("interface.noEvents")}</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {filtered.map((e) => (
            <Link
              key={e.id}
              to="/events"
              onClick={() => trackEventViewed({ eventId: e.id, category: e.category ?? undefined, date: e.event_date })}
              className="no-min-h min-w-0 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition flex flex-col"
            >
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {formatEventDate(e.event_date)}{e.event_end_date ? `–${formatEventDate(e.event_end_date)}` : ""}
                  {e.event_time ? ` · ${e.event_time}` : ""}
                </span>
                {e.is_free && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                    <Ticket className="h-3.5 w-3.5" aria-hidden /> {t("interface.free")}
                  </span>
                )}
              </div>
              <p className="font-bold text-foreground text-base leading-tight">{e.title}</p>
              {(e.location || e.neighborhood) && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{[e.location, e.neighborhood].filter(Boolean).join(" · ")}</span>
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <VerifiedPill
                  compact
                  category="events"
                  status={(e.verification_status as VerificationStatus) ?? "needs_verification"}
                  lastVerified={e.last_verified}
                  source={e.source}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
