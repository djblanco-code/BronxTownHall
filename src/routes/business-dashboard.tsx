import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { Business, DayHours, getCurrentBusiness, setSession } from "@/lib/business";
import { LogOut, ExternalLink, Star, Check, Clock, Camera, BarChart3, Megaphone, Share2 } from "lucide-react";

export const Route = createFileRoute("/business-dashboard")({
  staticData: { sitemap: false }, component: DashboardPage });

function DashboardPage() {
  const nav = useNavigate();
  const [biz, setBiz] = useState<Business | null>(null);

  useEffect(() => {
    const b = getCurrentBusiness();
    if (!b) { nav({ to: "/business-login" }); return; }
    setBiz(b);
  }, [nav]);

  if (!biz) return null;

  const logout = () => { setSession(null); nav({ to: "/" }); };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {biz.name}
              {biz.verified && <Check className="h-6 w-6 text-success bg-success/15 rounded-full p-1" aria-label="Verified" />}
            </h1>
            <p className="text-sm text-muted-foreground">
              Appears in: <span className="font-semibold capitalize">{biz.category}</span> → {biz.subcategory} · Status: <StatusPill status={biz.status} />
            </p>
          </div>
          <button onClick={logout} className="no-min-h inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>

        <div className={`rounded-2xl p-5 ${biz.tier === "premium" ? "bg-gradient-to-r from-warning/20 to-primary/20 border border-warning" : "bg-secondary/40 border border-border"}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {biz.tier === "premium" && <Star className="h-5 w-5 text-warning" fill="currentColor" />}
              <div>
                <p className="font-bold">{biz.tier === "premium" ? "You're on the Premium Plan" : "You're on the Free Plan"}</p>
                <p className="text-sm text-muted-foreground">
                  {biz.tier === "premium" ? "Premium features are coming soon." : "Upgrade to unlock photos, analytics, and promotions."}
                </p>
              </div>
            </div>
            {biz.tier !== "premium" && (
              <span className="text-sm font-semibold text-muted-foreground">Premium upgrade coming soon</span>
            )}
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-xl font-bold">Your Business</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <ReadOnlyField label="Name" value={biz.name} />
            <ReadOnlyField label="Phone" value={biz.phone || "—"} />
            <ReadOnlyField label="Address" value={biz.address || "—"} />
            <ReadOnlyField label="Category" value={<span className="capitalize">{biz.category}</span>} />
            <ReadOnlyField label="Subcategory" value={biz.subcategory} />
            <ReadOnlyField label="Tier" value={<span className="capitalize">{biz.tier}</span>} />
            <ReadOnlyField label="Verified" value={biz.verified ? "Yes" : "Pending"} />
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium mb-1">Description</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{biz.description || "No description provided."}</p>
          </div>
          <div className="pt-2">
            <p className="text-sm font-medium mb-1">Hours</p>
            {biz.hours ? (
              <ul className="text-sm text-muted-foreground space-y-0.5">
                {Object.entries(biz.hours).map(([day, hours]) => (
                  <li key={day} className="capitalize">{day}: {formatHours(hours)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No hours provided.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Coming Soon</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <ComingSoonItem icon={<Camera className="h-5 w-5" />} title="Photos & Videos" desc="Upload storefront photos and short-form video to showcase your business." />
            <ComingSoonItem icon={<BarChart3 className="h-5 w-5" />} title="Analytics Dashboard" desc="Track views, calls, directions, and conversion trends over time." />
            <ComingSoonItem icon={<Megaphone className="h-5 w-5" />} title="Promotions & Events" desc="Create events, offers, and announcements for your listing." />
            <ComingSoonItem icon={<Share2 className="h-5 w-5" />} title="Social Sync" desc="Post once and syndicate to Facebook, Instagram, X, and WhatsApp." />
          </div>
        </section>

        <section className="rounded-2xl border-2 border-dashed border-muted-foreground/40 bg-secondary/40 p-5">
          <h2 className="text-lg font-bold flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Want more reach?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We offer one modest homepage banner and clearly-labeled sponsored cards inside relevant categories. Tell us
            what you're after and we'll follow up with options and pricing.
          </p>
          <Link to="/advertise" className="no-min-h mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
            Advertise with us
          </Link>
        </section>



        <div className="flex flex-wrap gap-3">
          <Link
            to="/category/$cat"
            params={{ cat: biz.category === "faith" || biz.category === "other" ? "events" : biz.category }}
            className="no-min-h inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-secondary"
          >
            <ExternalLink className="h-4 w-4" /> View My Listing
          </Link>
          <Link to="/business-update" className="no-min-h inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
            Post an Update
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = status === "live" ? "bg-success/15 text-success" : "bg-warning/15 text-warning";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{status === "live" ? "Live" : "Pending Review"}</span>;
}

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function formatHours(hours: DayHours) {
  if (!hours.open) return "Closed";
  return `${hours.from} – ${hours.to}`;
}

function ComingSoonItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4 flex gap-3 items-start">
      <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">{icon}</div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
      </div>
    </div>
  );
}
