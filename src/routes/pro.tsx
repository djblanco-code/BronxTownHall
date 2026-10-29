import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchMyProProfile,
  upsertProProfile,
  fetchMyReferrals,
  updateReferralStatus,
  deleteReferral,
  type ProProfile,
  type Referral,
} from "@/lib/cloud-pro";
import { RESOURCES } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { toast } from "sonner";
import { Briefcase, Download, Trash2, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/pro")({
  staticData: { sitemap: false },
  component: ProPortal,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Professional Portal — The Bronx App" },
      {
        name: "description",
        content: "Caseworker dashboard for non-profit and government agency staff.",
      },
    ],
  }),
});

function ProPortal() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useI18n();
  const [profile, setProfile] = useState<ProProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [orgName, setOrgName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [orgType, setOrgType] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user) return;
    fetchMyProProfile().then((p) => {
      setProfile(p);
      if (p) {
        setOrgName(p.org_name);
        setRoleTitle(p.role_title ?? "");
        setOrgType(p.org_type ?? "");
        setBio(p.bio ?? "");
      }
    });
    fetchMyReferrals()
      .then(setReferrals)
      .catch(() => {});
  };
  useEffect(load, [user]);

  if (authLoading)
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-10">Loading…</div>
      </AppShell>
    );

  if (!user) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Professional Portal</h1>
          <p className="text-muted-foreground mb-4">
            For non-profit and government caseworkers. Sign in to register.
          </p>
          <Link
            to="/auth"
            className="inline-block px-5 py-3 rounded-xl bg-primary-fill text-primary-fill-foreground font-semibold"
          >
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setSaving(true);
    try {
      const next = await upsertProProfile({
        org_name: orgName.trim(),
        role_title: roleTitle.trim() || null,
        org_type: orgType.trim() || null,
        bio: bio.trim() || null,
      });
      setProfile(next);
      toast.success(
        profile ? "Profile updated" : "Pro profile created. An admin will review for verification.",
      );
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Referred at", "Resource", "Client label", "Status", "Note"],
      ...referrals.map((r) => {
        const res = RESOURCES.find((x) => x.id === r.resource_id);
        return [
          r.referred_at,
          res?.name[lang] ?? r.resource_id,
          r.client_label ?? "",
          r.status,
          (r.note ?? "").replace(/\n/g, " "),
        ];
      }),
    ];
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "referrals.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-7 w-7" /> Professional Portal
          </h1>
          <p className="text-muted-foreground">
            {profile
              ? `${profile.org_name}`
              : "Register your organization to start tracking referrals."}
          </p>
          {profile?.verified && (
            <p className="mt-1 text-sm inline-flex items-center gap-1 text-success">
              <BadgeCheck className="h-4 w-4" /> Verified by The Bronx App
            </p>
          )}
        </header>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-3">Your professional profile</h2>
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm sm:col-span-2">
              <span className="block font-medium mb-1">Organization name *</span>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                maxLength={120}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </label>
            <label className="text-sm">
              <span className="block font-medium mb-1">Role / title</span>
              <input
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                maxLength={80}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </label>
            <label className="text-sm">
              <span className="block font-medium mb-1">Organization type</span>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">Select…</option>
                <option>Non-profit</option>
                <option>Government agency</option>
                <option>Hospital / clinic</option>
                <option>School</option>
                <option>Faith-based</option>
                <option>Other</option>
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="block font-medium mb-1">Short bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary-fill text-primary-fill-foreground font-semibold disabled:opacity-50"
              >
                {profile ? "Save changes" : "Create profile"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Referrals ({referrals.length})</h2>
            <button
              onClick={exportCsv}
              disabled={referrals.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
          {referrals.length === 0 ? (
            <p className="text-muted-foreground">
              No referrals yet. Open a resource and tap "Log referral" to start tracking.
            </p>
          ) : (
            <ul className="space-y-2">
              {referrals.map((r) => {
                const res = RESOURCES.find((x) => x.id === r.resource_id);
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-border bg-card p-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {res ? res.name[lang] : r.resource_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.referred_at).toLocaleDateString()}{" "}
                        {r.client_label ? `· ${r.client_label}` : ""}
                      </p>
                      {r.note && <p className="text-sm mt-1">{r.note}</p>}
                    </div>
                    <select
                      value={r.status}
                      onChange={async (e) => {
                        await updateReferralStatus(r.id, e.target.value as Referral["status"]);
                        load();
                      }}
                      className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="unsuccessful">Unsuccessful</option>
                    </select>
                    <button
                      onClick={async () => {
                        if (confirm("Delete referral?")) {
                          await deleteReferral(r.id);
                          load();
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-secondary text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
