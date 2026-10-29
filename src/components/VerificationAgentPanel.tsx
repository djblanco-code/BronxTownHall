import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, BadgeCheck, Bot, Loader2, RefreshCw } from "lucide-react";

type VerificationRow = {
  resource_id: string;
  resource_name: string | null;
  category: string | null;
  verified: boolean;
  verification_issues: string[] | null;
  checked_at: string;
};

type JobState = {
  status: string;
  last_run_at: string | null;
  last_error: string | null;
  processed_last_run: number;
};

export function VerificationAgentPanel() {
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [job, setJob] = useState<JobState | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: v }, { data: j }] = await Promise.all([
      supabase
        .from("resource_verifications")
        .select("resource_id,resource_name,category,verified,verification_issues,checked_at")
        .order("checked_at", { ascending: false })
        .limit(200),
      supabase
        .from("verification_job_state")
        .select("status,last_run_at,last_error,processed_last_run")
        .eq("id", "resource-verifier")
        .maybeSingle(),
    ]);
    setRows((v as VerificationRow[] | null) ?? []);
    setJob((j as JobState | null) ?? null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runNow = async () => {
    setRunning(true);
    setMessage(null);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const res = await fetch("/api/public/verify-resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ batch_size: 10 }),
      });
      if (res.status === 401) throw new Error("Sign in as an admin to run checks.");
      const body = (await res.json()) as { processed?: number; skipped?: string; error?: string };
      setMessage(
        body.error
          ? `Error: ${body.error}`
          : body.skipped
            ? `Skipped: ${body.skipped}`
            : `Checked ${body.processed ?? 0} resource(s).`,
      );
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(false);
    }
  };

  const flagged = rows.filter((r) => !r.verified);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold inline-flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" aria-hidden /> AI Verification Agent
        </h2>
        <button
          onClick={runNow}
          disabled={running}
          className="px-3 py-1.5 rounded-lg bg-primary-fill text-primary-fill-foreground text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden />
          )}
          {running ? "Checking…" : "Run check now"}
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Weekly agent re-checks each resource older than 30 days: phone number format, address on the
        map, and a Google listing cross-check. Runs in bounded batches of 10.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Checked" value={rows.length} />
        <Stat label="Passing" value={rows.length - flagged.length} />
        <Stat label="Flagged" value={flagged.length} />
      </div>

      <p className="text-xs text-muted-foreground">
        Status: <span className="font-semibold">{job?.status ?? "idle"}</span>
        {job?.last_run_at && (
          <>
            {" "}
            · Last run {new Date(job.last_run_at).toLocaleString()} ({job.processed_last_run}{" "}
            checked)
          </>
        )}
        {job?.last_error && <span className="text-destructive"> · {job.last_error}</span>}
      </p>
      {message && <p className="text-xs font-medium">{message}</p>}

      {flagged.length > 0 ? (
        <ul className="space-y-2">
          {flagged.slice(0, 25).map((r) => (
            <li key={r.resource_id} className="py-2 border-b border-border last:border-0">
              <p className="text-sm font-semibold inline-flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
                {r.resource_name ?? r.resource_id}
                {r.category && (
                  <span className="text-xs text-muted-foreground font-normal">· {r.category}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {(r.verification_issues ?? []).join(" · ") || "Unknown issue"}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
          <BadgeCheck className="h-4 w-4 text-success" aria-hidden /> No flagged resources.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
