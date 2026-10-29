import { useCallback, useEffect, useState } from "react";
import { Check, Inbox, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type PendingEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  address: string | null;
  is_free: boolean;
  cost: string | null;
  contact: string | null;
  website: string | null;
  created_at: string;
};

type Submitter = { id: string; submitted_by: string | null; submitted_email: string | null };

type Request = {
  id: string;
  need: string;
  category: string | null;
  neighborhood: string | null;
  note: string | null;
  status: "open" | "in_review" | "fulfilled" | "rejected";
  created_at: string;
};

/**
 * What residents sent in and staff still need to look at: submitted events
 * (they promise review) and suggestions or requests for resources. Approving
 * an event publishes it on Events; it stays "not yet verified" until checked.
 */
export function AdminReviewQueuePanel() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [submitters, setSubmitters] = useState<Record<string, Submitter>>({});
  const [requests, setRequests] = useState<Request[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const refresh = useCallback(async () => {
    setState("loading");
    const [ev, who, req] = await Promise.all([
      supabase
        .from("events")
        .select(
          "id,title,description,event_date,event_time,location,address,is_free,cost,contact,website,created_at",
        )
        .eq("approval_status", "pending")
        .order("created_at", { ascending: true })
        .limit(100),
      supabase.rpc("admin_event_submissions"),
      supabase
        .from("resource_requests")
        .select("id,need,category,neighborhood,note,status,created_at")
        .in("status", ["open", "in_review"])
        .order("created_at", { ascending: true })
        .limit(200),
    ]);
    if (ev.error || req.error) {
      setState("error");
      return;
    }
    setEvents((ev.data ?? []) as PendingEvent[]);
    setSubmitters(Object.fromEntries(((who.data ?? []) as Submitter[]).map((s) => [s.id, s])));
    setRequests((req.data ?? []) as Request[]);
    setState("ready");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const decideEvent = async (id: string, approval_status: "approved" | "rejected") => {
    const { data, error } = await supabase
      .from("events")
      .update({ approval_status })
      .eq("id", id)
      .select("id");
    if (error || !data?.length) toast.error("Couldn't update that event. Try again.");
    else toast.success(approval_status === "approved" ? "Published on Events" : "Rejected");
    void refresh();
  };

  const decideRequest = async (id: string, status: Request["status"]) => {
    const { data, error } = await supabase
      .from("resource_requests")
      .update({ status })
      .eq("id", id)
      .select("id");
    if (error || !data?.length) toast.error("Couldn't update that request. Try again.");
    void refresh();
  };

  return (
    <section aria-labelledby="review-queue-title" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="review-queue-title" className="flex items-center gap-2 text-2xl font-bold">
          <Inbox className="h-6 w-6 text-primary" aria-hidden="true" /> Review queue
        </h2>
        <button
          onClick={() => void refresh()}
          className="no-min-h inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-bold hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
        </button>
      </div>

      {state === "loading" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="text-sm text-destructive">
          Couldn't load the queue. Check your connection and refresh.
        </p>
      )}

      {state === "ready" && (
        <>
          <div>
            <h3 className="font-bold">Submitted events ({events.length})</h3>
            {events.length === 0 ? (
              <p className="border-y border-border py-3 text-sm text-muted-foreground">
                Nothing waiting.
              </p>
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {events.map((e) => {
                  const who = submitters[e.id];
                  return (
                    <li key={e.id} className="space-y-1 py-3">
                      <p className="font-bold" dir="auto">
                        {e.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {e.event_date}
                        {e.event_time ? ` · ${e.event_time}` : ""}
                        {e.location ? ` · ${e.location}` : ""}
                        {e.address ? ` · ${e.address}` : ""}
                        {e.is_free ? " · Free" : e.cost ? ` · ${e.cost}` : ""}
                      </p>
                      {e.description && (
                        <p className="text-sm" dir="auto">
                          {e.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {[e.contact, e.website].filter(Boolean).join(" · ")}
                        {who?.submitted_by || who?.submitted_email
                          ? ` · Sent by ${[who.submitted_by, who.submitted_email].filter(Boolean).join(", ")}`
                          : ""}{" "}
                        · {new Date(e.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => void decideEvent(e.id, "approved")}
                          className={APPROVE}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" /> Publish
                        </button>
                        <button
                          onClick={() => void decideEvent(e.id, "rejected")}
                          className={REJECT}
                        >
                          <X className="h-4 w-4" aria-hidden="true" /> Reject
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-bold">Suggestions and requests ({requests.length})</h3>
            <p className="text-sm text-muted-foreground">
              From "Suggest a resource", "Suggest an edit" and "Request a resource". Add or fix the
              listing, then mark it done.
            </p>
            {requests.length === 0 ? (
              <p className="border-y border-border py-3 text-sm text-muted-foreground">
                Nothing waiting.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {requests.map((r) => (
                  <li key={r.id} className="space-y-1 py-3">
                    <p className="font-bold" dir="auto">
                      {r.need}
                      {r.status === "in_review" && (
                        <span className="ms-2 text-xs font-semibold text-primary">In review</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[r.category, r.neighborhood].filter(Boolean).join(" · ")}
                      {r.category || r.neighborhood ? " · " : ""}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    {r.note && (
                      <p className="whitespace-pre-line text-sm" dir="auto">
                        {r.note}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => void decideRequest(r.id, "fulfilled")}
                        className={APPROVE}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" /> Done
                      </button>
                      {r.status === "open" && (
                        <button
                          onClick={() => void decideRequest(r.id, "in_review")}
                          className={REJECT}
                        >
                          Looking into it
                        </button>
                      )}
                      <button
                        onClick={() => void decideRequest(r.id, "rejected")}
                        className={REJECT}
                      >
                        <X className="h-4 w-4" aria-hidden="true" /> Not adding
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}

const APPROVE =
  "no-min-h inline-flex min-h-11 items-center gap-1.5 rounded-md bg-primary-fill px-4 text-sm font-bold text-primary-fill-foreground hover:bg-primary-fill-hover";
const REJECT =
  "no-min-h inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-4 text-sm font-bold text-foreground hover:bg-secondary";
