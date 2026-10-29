import { useEffect, useState } from "react";
import { Bell, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/data";
import {
  createAlert,
  deleteAlert,
  headlineIssue,
  loadAllAlerts,
  setAlertPublished,
  type AlertKind,
  type PolicyAlert,
} from "@/lib/policy-alerts";

const input =
  "w-full px-3 py-2 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary text-sm";

export function AdminPolicyAlertPanel() {
  const [alerts, setAlerts] = useState<PolicyAlert[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    category: (CATEGORIES[0]?.id ?? "food") as Category,
    kind: "policy" as AlertKind,
    headline: "",
    detail: "",
    source_url: "",
    source_label: "",
    deadline_date: "",
    expires_at: "",
  });

  const refresh = () =>
    loadAllAlerts()
      .then(setAlerts)
      .catch((e) => setErr(String(e.message ?? e)));
  useEffect(() => {
    void refresh();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const issue = headlineIssue(form.headline);
    if (issue) {
      setErr(issue);
      return;
    }
    setErr("");
    setBusy(true);
    try {
      await createAlert({
        category: form.category,
        kind: form.kind,
        headline: form.headline.trim(),
        detail: form.detail,
        source_url: form.source_url,
        source_label: form.source_label,
        deadline_date: form.deadline_date || null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      });
      setForm({
        ...form,
        headline: "",
        detail: "",
        source_url: "",
        source_label: "",
        deadline_date: "",
        expires_at: "",
      });
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save alert.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4">
      <h2 className="font-bold inline-flex items-center gap-2 mb-1">
        <Bell className="h-5 w-5 text-primary" aria-hidden /> Policy &amp; Deadline Alerts
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        One-sentence headlines only. Detail and the official source go behind “Read more”.
      </p>

      <form onSubmit={submit} className="space-y-2 mb-5">
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Category</span>
            <select
              className={input}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Type</span>
            <select
              className={input}
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as AlertKind })}
            >
              <option value="policy">Policy / eligibility change</option>
              <option value="deadline">Deadline / renewal reminder</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">
            Headline (max 160 characters, one sentence)
          </span>
          <input
            className={input}
            maxLength={160}
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="3-K income eligibility threshold changed"
          />
          <span className="text-xs text-muted-foreground">{form.headline.length}/160</span>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">
            Detail (shown under “Read more”)
          </span>
          <textarea
            className={`${input} min-h-[90px]`}
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Official source URL</span>
            <input
              className={input}
              type="url"
              value={form.source_url}
              onChange={(e) => setForm({ ...form, source_url: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Source label</span>
            <input
              className={input}
              value={form.source_label}
              onChange={(e) => setForm({ ...form, source_label: e.target.value })}
              placeholder="NYC DOE"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">
              Deadline date (optional)
            </span>
            <input
              className={input}
              type="date"
              value={form.deadline_date}
              onChange={(e) => setForm({ ...form, deadline_date: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">
              Hide after (optional)
            </span>
            <input
              className={input}
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </label>
        </div>

        {err && (
          <p role="alert" className="text-sm text-destructive">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="no-min-h inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-fill text-primary-fill-foreground font-semibold disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save as draft
        </button>
      </form>

      <div className="space-y-2">
        {alerts.length === 0 && <p className="text-sm text-muted-foreground">No alerts yet.</p>}
        {alerts.map((a) => (
          <div key={a.id} className="rounded-xl border border-border p-3 flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold text-sm">{a.headline}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {a.category} · {a.kind}
                {a.deadline_date ? ` · due ${a.deadline_date}` : ""} ·{" "}
                {a.published ? "Published" : "Draft"}
              </p>
            </div>
            <button
              onClick={() => setAlertPublished(a.id, !a.published).then(refresh)}
              className="no-min-h inline-flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border-2 border-border hover:border-primary"
            >
              {a.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {a.published ? "Unpublish" : "Publish"}
            </button>
            <button
              onClick={() => {
                if (confirm("Delete this alert?")) void deleteAlert(a.id).then(refresh);
              }}
              aria-label="Delete alert"
              className="no-min-h p-1.5 rounded-lg border-2 border-border hover:border-destructive"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
