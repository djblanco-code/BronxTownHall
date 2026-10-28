import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Megaphone, Power, RefreshCw, Trash2 } from "lucide-react";
import {
  createPlacement,
  deletePlacement,
  interestLabel,
  loadAdInquiries,
  loadAllPlacements,
  setInquiryStatus,
  setPlacementActive,
  type AdInquiry,
  type AdPlacement,
  type SponsoredPlacement,
} from "@/lib/ads";
import { CATEGORIES } from "@/lib/data";

const inp = "px-3 py-2 rounded-lg border border-border bg-background text-sm w-full";

export function AdminAdPanel() {
  const [inquiries, setInquiries] = useState<AdInquiry[]>([]);
  const [placements, setPlacements] = useState<SponsoredPlacement[]>([]);
  const [busy, setBusy] = useState(true);
  const [placement, setPlacement] = useState<AdPlacement>("homepage_banner");

  const refresh = useCallback(async () => {
    setBusy(true);
    const [i, p] = await Promise.all([loadAdInquiries(), loadAllPlacements()]);
    setInquiries(i);
    setPlacements(p);
    setBusy(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    await act(
      () =>
        createPlacement({
          placement,
          category: placement === "category_card" ? String(fd.get("category") || "") || null : null,
          sponsor_name: String(fd.get("sponsor_name") || "").trim(),
          headline: String(fd.get("headline") || "").trim(),
          body: String(fd.get("body") || "").trim() || null,
          cta_label: String(fd.get("cta_label") || "").trim() || null,
          cta_url: String(fd.get("cta_url") || "").trim() || null,
        }).then(() => form.reset()),
      "Placement created (off by default)",
    );
  }

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" aria-hidden /> Advertising
          </h2>
          <p className="text-sm text-muted-foreground">
            Inquiries from businesses, and manual on/off control of sponsored placements. Ads are
            contextual only — no user data is used to choose them.
          </p>
        </div>
        <button
          onClick={() => void refresh()}
          className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-border text-sm font-semibold hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {busy && (
        <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      )}

      <div>
        <h3 className="font-bold mb-2">Ad inquiries ({inquiries.length})</h3>
        {inquiries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No inquiries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground text-start">
                <tr>
                  <th className="text-start py-2 pe-3">Business</th>
                  <th className="text-start py-2 pe-3">Contact</th>
                  <th className="text-start py-2 pe-3">Interest</th>
                  <th className="text-start py-2 pe-3">Budget</th>
                  <th className="text-start py-2 pe-3">Submitted</th>
                  <th className="text-start py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((q) => (
                  <tr key={q.id} className="border-t border-border align-top">
                    <td className="py-2 pe-3 font-semibold">
                      {q.org_name}
                      {q.message && (
                        <p className="font-normal text-xs text-muted-foreground mt-0.5 max-w-xs">
                          {q.message}
                        </p>
                      )}
                    </td>
                    <td className="py-2 pe-3">
                      {q.contact_name}
                      <br />
                      <a
                        href={`mailto:${q.contact_email}`}
                        className="text-primary hover:underline text-xs"
                      >
                        {q.contact_email}
                      </a>
                    </td>
                    <td className="py-2 pe-3">{interestLabel(q.interest)}</td>
                    <td className="py-2 pe-3">{q.budget_range || "—"}</td>
                    <td className="py-2 pe-3 whitespace-nowrap">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <select
                        value={q.status}
                        onChange={(e) =>
                          void act(
                            () => setInquiryStatus(q.id, e.target.value as AdInquiry["status"]),
                            "Status updated",
                          )
                        }
                        className="px-2 py-1 rounded-lg border border-border bg-background text-xs"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="font-bold mb-2">Sponsored placements ({placements.length})</h3>
        <ul className="space-y-2 mb-4">
          {placements.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-border p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold">{p.headline}</p>
                <p className="text-xs text-muted-foreground">
                  {p.sponsor_name} ·{" "}
                  {p.placement === "homepage_banner"
                    ? "Homepage banner"
                    : `Category card · ${p.category}`}
                  {" · "}
                  <span
                    className={p.active ? "text-success font-semibold" : "text-muted-foreground"}
                  >
                    {p.active ? "Live" : "Off"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    void act(
                      () => setPlacementActive(p.id, !p.active),
                      p.active ? "Turned off" : "Turned on",
                    )
                  }
                  className="no-min-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-border text-xs font-semibold hover:bg-secondary"
                >
                  <Power className="h-3.5 w-3.5" /> {p.active ? "Turn off" : "Turn on"}
                </button>
                <button
                  onClick={() => void act(() => deletePlacement(p.id), "Deleted")}
                  aria-label={`Delete ${p.headline}`}
                  className="no-min-h inline-flex items-center px-2.5 py-1.5 rounded-lg border-2 border-destructive/40 text-destructive text-xs font-semibold hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {placements.length === 0 && (
            <li className="text-sm text-muted-foreground">No placements yet.</li>
          )}
        </ul>

        <form onSubmit={onCreate} className="rounded-xl border border-border p-3 space-y-3">
          <p className="font-semibold text-sm">Add a placement</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-muted-foreground">
              Placement
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value as AdPlacement)}
                className={inp}
              >
                <option value="homepage_banner">Homepage banner</option>
                <option value="category_card">Category card</option>
              </select>
            </label>
            {placement === "category_card" && (
              <label className="block text-xs font-semibold text-muted-foreground">
                Category
                <select name="category" className={inp} defaultValue="food">
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-xs font-semibold text-muted-foreground">
              Sponsor name
              <input name="sponsor_name" required maxLength={160} className={inp} />
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Headline
              <input name="headline" required maxLength={160} className={inp} />
            </label>
            <label className="block text-xs font-semibold text-muted-foreground sm:col-span-2">
              Body
              <input name="body" maxLength={300} className={inp} />
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Link label
              <input name="cta_label" maxLength={40} placeholder="Learn more" className={inp} />
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Link URL
              <input name="cta_url" type="url" maxLength={500} className={inp} />
            </label>
          </div>
          <button
            type="submit"
            className="no-min-h px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            Create (starts off)
          </button>
        </form>
      </div>
    </section>
  );
}
