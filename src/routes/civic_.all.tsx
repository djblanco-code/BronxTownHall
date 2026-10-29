import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft, MapPin, Phone, Globe, Mail } from "lucide-react";
import { COMMUNITY_BOARDS, PRECINCTS, ZIP_MAP } from "@/lib/civic-data";

export const Route = createFileRoute("/civic_/all")({
  staticData: { sitemap: true },
  component: AllAreasPage,
  head: () => ({
    meta: [
      { title: "Browse All Bronx Community Boards & Precincts" },
      {
        name: "description",
        content:
          "Explore every Bronx Community Board and Police Precinct, with addresses, meeting times, and contact info.",
      },
    ],
  }),
});

function zipsForCb(cbId: string) {
  return Object.entries(ZIP_MAP)
    .filter(([, m]) => m.cb.includes(cbId) || (m.cbPartial ?? []).includes(cbId))
    .map(([z]) => z);
}

function zipsForPrecinct(pId: string) {
  return Object.entries(ZIP_MAP)
    .filter(([, m]) => m.precincts.includes(pId))
    .map(([z]) => z);
}

function AllAreasPage() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/civic" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-foreground">Browse All Areas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All Bronx Community Boards and Police Precincts.
        </p>

        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mt-8 mb-3">
          Community Boards
        </h2>
        <ul className="grid gap-3">
          {Object.values(COMMUNITY_BOARDS).map((cb) => (
            <li key={cb.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-bold text-foreground">
                  {cb.id}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    · {cb.schedule} · {cb.time}
                  </span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                {cb.address}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Serves ZIPs: {zipsForCb(cb.id).join(", ") || "—"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={`tel:${cb.phone.replace(/[^0-9]/g, "")}`}
                  className="no-min-h inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded bg-[#34a853] text-white font-semibold"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {cb.phone}
                </a>
                <a
                  href={`mailto:${cb.email}`}
                  className="no-min-h inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded border border-primary text-primary font-semibold"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
                <a
                  href={cb.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-min-h inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded border border-primary text-primary font-semibold"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mt-8 mb-3">
          Police Precincts
        </h2>
        <ul className="grid gap-3">
          {Object.entries(PRECINCTS).map(([id, p]) => (
            <li key={id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-bold text-foreground">{p.name}</p>
              <p className="text-sm text-muted-foreground">Serves: {p.serves}</p>
              <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                {p.address}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Serves ZIPs: {zipsForPrecinct(id).join(", ") || "—"}
              </p>
              <div className="mt-2">
                <a
                  href={`tel:${p.phone.replace(/[^0-9]/g, "")}`}
                  className="no-min-h inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded bg-[#34a853] text-white font-semibold"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {p.phone}
                </a>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            to="/civic"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
          >
            ← Back to Your Voice in the Bronx
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
