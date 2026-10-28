import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { ArrowLeft, Search, Bell, AlertTriangle, Phone } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/buzz")({
  staticData: { sitemap: true },
  component: BuzzPage,
});

type AlertCat = "Emergency" | "Food" | "Health" | "Event";
type Alert = {
  id: string;
  cat: AlertCat;
  title: string;
  body: string;
  ago: string;
  urgent: boolean;
  zip: string;
  isEvent?: boolean;
};

const ALERTS: Alert[] = [
  { id: "a1", cat: "Emergency", urgent: true, title: "Air Quality Alert", body: "High smoke levels detected. Seniors and those with asthma are advised to stay indoors.", ago: "10m ago", zip: "10451" },
  { id: "a2", cat: "Food", urgent: true, title: "Mobile Food Pantry", body: "Free groceries available today at St. Mary's Park starting at 2:00 PM. No ID required.", ago: "2h ago", zip: "10455", isEvent: true },
  { id: "a3", cat: "Health", urgent: false, title: "Free Flu Shots Saturday", body: "BronxCare offering free flu shots Saturday 10am–4pm at Selwyn Ave clinic.", ago: "6h ago", zip: "10457", isEvent: true },
  { id: "a4", cat: "Event", urgent: false, title: "Community Board 4 Meeting", body: "Monthly meeting Tuesday 6:30pm. Speak directly to local leaders.", ago: "1d ago", zip: "10457", isEvent: true },
  { id: "a5", cat: "Food", urgent: false, title: "POTS Hot Meals Extended", body: "POTS Community Kitchen now open until 4pm daily.", ago: "2d ago", zip: "10458" },
];

const ZIPS = ["10451","10452","10453","10454","10455","10456","10457","10458","10459","10460","10461","10462","10463","10464","10465","10466","10467","10468","10469","10470","10471","10472","10473","10474","10475"];

function BuzzPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [zip, setZip] = useState("10451");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | AlertCat>("All");

  const filtered = useMemo(() => {
    return ALERTS.filter((a) =>
      (filter === "All" || a.cat === filter) &&
      (q === "" || (a.title + a.body).toLowerCase().includes(q.toLowerCase()))
    );
  }, [q, filter]);

  const urgent = filtered.filter((a) => a.urgent);
  const recent = filtered.filter((a) => !a.urgent);

  const remindMe = (title: string) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
    alert(`We will remind you 1 hour before "${title}".`);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => navigate({ to: "/" })} className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("buzz")}</h1>
            <p className="text-muted-foreground mt-1">
              Updates for ZIP{" "}
              <select
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="no-min-h ml-1 px-2 py-1 rounded-lg border border-border bg-card font-semibold text-foreground"
              >
                {ZIPS.map((z) => <option key={z}>{z}</option>)}
              </select>
            </p>
          </div>
        </div>

        <div className="mt-5 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search alerts..."
            className="w-full ps-10 pe-4 py-3 rounded-2xl border-2 border-border bg-card focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {(["All", "Emergency", "Food", "Health"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`no-min-h px-4 py-2 rounded-full text-sm font-medium border transition ${
                filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {urgent.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-destructive mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Urgent Updates
            </h2>
            <div className="space-y-3">
              {urgent.map((a) => <AlertCard key={a.id} a={a} urgent onRemind={remindMe} />)}
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent Updates</h2>
            <div className="space-y-3">
              {recent.map((a) => <AlertCard key={a.id} a={a} onRemind={remindMe} />)}
            </div>
          </section>
        )}

        <a
          href="tel:311"
          className="no-min-h mt-8 w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90"
        >
          <Phone className="h-5 w-5" /> GET ASSISTANCE
        </a>
      </div>
    </AppShell>
  );
}

function AlertCard({ a, urgent, onRemind }: { a: Alert; urgent?: boolean; onRemind: (t: string) => void }) {
  const catColor: Record<AlertCat, string> = {
    Emergency: "bg-destructive/15 text-destructive",
    Food: "bg-cat-food/20 text-foreground",
    Health: "bg-success/15 text-success",
    Event: "bg-accent/15 text-accent",
  };
  return (
    <div className={`rounded-2xl border p-4 ${urgent ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${catColor[a.cat]}`}>{a.cat}</span>
        <span className="text-xs text-muted-foreground">{a.ago}</span>
      </div>
      <h3 className="font-bold text-foreground mt-2">{a.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="no-min-h px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
          View Details
        </button>
        {a.isEvent && (
          <button onClick={() => onRemind(a.title)} className="no-min-h inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/10">
            <Bell className="h-4 w-4" /> Remind Me
          </button>
        )}
      </div>
    </div>
  );
}
