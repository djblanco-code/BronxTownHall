import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ACCOUNT_TYPES,
  CALL_FIELDS,
  CATEGORY_LABELS,
  DESK_FIELDS,
  FIELD_LABELS,
  confirmFields,
  daysSince,
  loadAllOrgs,
  loadContacts,
  needsRecheck,
  setOrgStatus,
  setPremium,
  updateOwnOrg,
  type AccountType,
  type OrgAccount,
  type OrgContact,
} from "@/lib/org-accounts";
import { StatusBadge } from "@/components/OrgStatusBadge";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, Loader2, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";

type Filter = {
  type: "all" | AccountType;
  category: string;
  view: "pending" | "verified" | "recheck" | "all";
};

export function AdminOrgReviewPanel() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<OrgAccount[]>([]);
  const [contacts, setContacts] = useState<Record<string, OrgContact>>({});
  const [busy, setBusy] = useState(true);
  const [f, setF] = useState<Filter>({ type: "all", category: "all", view: "pending" });

  const refresh = useCallback(async () => {
    setBusy(true);
    const list = await loadAllOrgs();
    setOrgs(list);
    setContacts(await loadContacts(list.map((o) => o.id)));
    setBusy(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rows = useMemo(() => {
    return orgs
      .filter((o) => (f.type === "all" ? true : o.account_type === f.type))
      .filter((o) => (f.category === "all" ? true : o.category === f.category))
      .filter((o) =>
        f.view === "all"
          ? true
          : f.view === "pending"
            ? o.status === "pending_review"
            : f.view === "verified"
              ? o.status === "verified"
              : needsRecheck(o),
      )
      .sort((a, b) => {
        if (a.priority_review !== b.priority_review) return a.priority_review ? -1 : 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // oldest first
      });
  }, [orgs, f]);

  const categories = useMemo(
    () => Array.from(new Set(orgs.map((o) => o.category).filter(Boolean))) as string[],
    [orgs],
  );

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  const select = "px-3 py-2 rounded-lg border border-border bg-background text-sm";

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Organization listings</h2>
          <p className="text-sm text-muted-foreground">
            Self-reported submissions from businesses, community organizations and government
            offices. Oldest first; government offices are flagged for priority review.
          </p>
        </div>
        <button
          onClick={() => void refresh()}
          className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-border text-sm font-semibold hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className={select}
          value={f.view}
          onChange={(e) => setF({ ...f, view: e.target.value as Filter["view"] })}
        >
          <option value="pending">Pending review</option>
          <option value="verified">Verified</option>
          <option value="recheck">Due for a re-check</option>
          <option value="all">All listings</option>
        </select>
        <select
          className={select}
          value={f.type}
          onChange={(e) => setF({ ...f, type: e.target.value as Filter["type"] })}
        >
          <option value="all">All account types</option>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className={select}
          value={f.category}
          onChange={(e) => setF({ ...f, category: e.target.value })}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c] ?? c}
            </option>
          ))}
        </select>
        <span className="self-center text-sm text-muted-foreground">
          {rows.length} listing{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {busy && (
        <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      )}

      <div className="space-y-3">
        {rows.map((o) => {
          const c = contacts[o.id];
          const age = daysSince(o.created_at) ?? 0;
          const sinceVerified = daysSince(o.verified_at);
          return (
            <article key={o.id} className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-bold">
                    {o.org_name}
                    {o.priority_review && (
                      <span className="ms-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        <Star className="h-3.5 w-3.5" /> Priority
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ACCOUNT_TYPES.find((t) => t.id === o.account_type)?.label}
                    {o.category ? ` · ${CATEGORY_LABELS[o.category] ?? o.category}` : ""} ·
                    submitted {age} day{age === 1 ? "" : "s"} ago
                    {sinceVerified !== null &&
                      ` · last verified ${sinceVerified} day${sinceVerified === 1 ? "" : "s"} ago`}
                  </p>
                </div>
                <StatusBadge org={o} />
              </div>

              {needsRecheck(o) && (
                <p className="text-xs font-semibold text-warning-foreground inline-flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Due for a re-check for this category.
                </p>
              )}

              <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <dt className="inline font-semibold">Public phone: </dt>
                  <dd className="inline">{o.public_phone ?? "—"}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Address: </dt>
                  <dd className="inline">
                    {o.has_physical_location ? (o.address ?? "—") : "No physical location"}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Contact: </dt>
                  <dd className="inline">
                    {c
                      ? `${c.contact_name}${c.contact_role ? ` (${c.contact_role})` : ""} · ${c.contact_email}${c.contact_phone ? ` · ${c.contact_phone}` : ""}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Hours: </dt>
                  <dd className="inline">
                    {o.hours_mode === "schedule"
                      ? Object.entries(o.hours ?? {})
                          .filter(([, v]) => v)
                          .map(([d, v]) => `${d} ${v}`)
                          .join(", ") || "—"
                      : o.hours_mode === "call"
                        ? "Call for hours"
                        : "By appointment"}
                  </dd>
                </div>
                {o.nonprofit_status && (
                  <div>
                    <dt className="inline font-semibold">501(c)(3): </dt>
                    <dd className="inline">{o.nonprofit_status}</dd>
                  </div>
                )}
                {o.office_name && (
                  <div>
                    <dt className="inline font-semibold">Office: </dt>
                    <dd className="inline">
                      {o.office_name}
                      {o.district ? ` · ${o.district}` : ""}
                    </dd>
                  </div>
                )}
                {o.tier_interest && (
                  <div>
                    <dt className="inline font-semibold">Plan interest: </dt>
                    <dd className="inline">{o.tier_interest.replace("_", " ")}</dd>
                  </div>
                )}
              </dl>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Confirm without a call
                </p>
                <FieldRow
                  fields={DESK_FIELDS}
                  org={o}
                  onConfirm={(fields) =>
                    act(() => confirmFields(o, fields, user!.id), "Fields confirmed.")
                  }
                />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">
                  Needs a call or a visit
                </p>
                <FieldRow
                  fields={CALL_FIELDS}
                  org={o}
                  onConfirm={(fields) =>
                    act(() => confirmFields(o, fields, user!.id), "Fields confirmed.")
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() =>
                    act(() => setOrgStatus(o.id, "verified", user!.id), "Marked verified.")
                  }
                  className="no-min-h px-3 py-1.5 rounded-lg bg-primary-fill text-primary-fill-foreground text-sm font-semibold"
                >
                  Mark verified
                </button>
                <button
                  onClick={() =>
                    act(
                      () => setOrgStatus(o.id, "needs_changes", user!.id),
                      "Sent back for changes.",
                    )
                  }
                  className="no-min-h px-3 py-1.5 rounded-lg border-2 border-border text-sm font-semibold hover:bg-secondary"
                >
                  Needs changes
                </button>
                <button
                  onClick={() =>
                    act(() => setOrgStatus(o.id, "pending_review", user!.id), "Back to pending.")
                  }
                  className="no-min-h px-3 py-1.5 rounded-lg border-2 border-border text-sm font-semibold hover:bg-secondary"
                >
                  Back to pending
                </button>
                <button
                  onClick={() =>
                    act(
                      () => updateOwnOrg(o.id, { published: !o.published }),
                      o.published ? "Hidden from residents." : "Visible to residents.",
                    )
                  }
                  className="no-min-h px-3 py-1.5 rounded-lg border-2 border-border text-sm font-semibold hover:bg-secondary"
                >
                  {o.published ? "Hide listing" : "Show listing"}
                </button>
                {o.account_type === "business" && (
                  <button
                    onClick={() =>
                      act(
                        () => setPremium(o.id, !o.premium),
                        o.premium ? "Premium turned off." : "Premium turned on.",
                      )
                    }
                    className="no-min-h px-3 py-1.5 rounded-lg border-2 border-border text-sm font-semibold hover:bg-secondary"
                  >
                    {o.premium ? "Turn off Premium" : "Turn on Premium"}
                  </button>
                )}
              </div>

              <label className="block">
                <span className="text-xs font-semibold">
                  Admin note (shown to the organization if you ask for changes)
                </span>
                <textarea
                  rows={2}
                  defaultValue={o.admin_notes ?? ""}
                  onBlur={(e) => {
                    if (e.target.value !== (o.admin_notes ?? ""))
                      void act(
                        () => updateOwnOrg(o.id, { admin_notes: e.target.value }),
                        "Note saved.",
                      );
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </label>
            </article>
          );
        })}
        {!busy && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing here right now.</p>
        )}
      </div>
    </section>
  );
}

function FieldRow({
  fields,
  org,
  onConfirm,
}: {
  fields: readonly string[];
  org: OrgAccount;
  onConfirm: (f: string[]) => void;
}) {
  const [sel, setSel] = useState<string[]>([]);
  const done = org.verified_fields ?? {};
  return (
    <div className="flex flex-wrap items-center gap-2">
      {fields.map((f) => {
        const confirmed = Boolean(done[f]);
        const on = sel.includes(f);
        return (
          <button
            key={f}
            type="button"
            disabled={confirmed}
            aria-pressed={on}
            onClick={() => setSel(on ? sel.filter((x) => x !== f) : [...sel, f])}
            className={`no-min-h rounded-full px-2.5 py-1 text-xs font-semibold border-2 ${confirmed ? "border-success/40 bg-success/15 text-success" : on ? "border-primary bg-primary-fill text-primary-fill-foreground" : "border-border"}`}
          >
            {FIELD_LABELS[f] ?? f}
            {confirmed ? " ✓" : ""}
          </button>
        );
      })}
      {sel.length > 0 && (
        <button
          onClick={() => {
            onConfirm(sel);
            setSel([]);
          }}
          className="no-min-h px-3 py-1 rounded-lg bg-primary-fill text-primary-fill-foreground text-xs font-semibold"
        >
          Confirm {sel.length}
        </button>
      )}
    </div>
  );
}
