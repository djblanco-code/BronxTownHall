import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft, MapPin, Phone, Globe, Mail, Shield, Users } from "lucide-react";
import { Section } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

/** Secondary button: 2px ink outline that fills on hover, 44px tall. */
const OUTLINE_BTN = cn(buttonVariants({ variant: "outline" }), "no-min-h h-11 px-4");
const TEXT_LINK =
  "no-min-h inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2";
/** Rows between hairlines; two columns on a laptop. */
const ROW_LIST =
  "divide-y divide-border border-b border-border lg:grid lg:grid-cols-2 lg:gap-x-8 lg:divide-y-0 lg:border-b-0";
const ROW = "flex items-start gap-3 py-4 lg:border-b lg:border-border";

function AllAreasPage() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 pt-4 pb-10">
        <button
          onClick={() => navigate({ to: "/civic" })}
          className="no-min-h inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Back
        </button>
        <header className="mt-1 pb-4">
          <h1 className="text-3xl text-foreground sm:text-4xl">Browse All Areas</h1>
          <p dir="auto" className="mt-1 text-muted-foreground">
            All Bronx Community Boards and Police Precincts.
          </p>
        </header>

        <Section id="all-cb-title" title="Community Boards" ruled className="px-0">
          <ul className={ROW_LIST}>
            {Object.values(COMMUNITY_BOARDS).map((cb) => (
              <li key={cb.id} className={ROW}>
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p dir="auto" className="font-bold text-foreground">
                    {cb.id}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      · {cb.schedule} · {cb.time}
                    </span>
                  </p>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span dir="auto">{cb.address}</span>
                  </p>
                  <p dir="auto" className="mt-1 text-sm text-muted-foreground">
                    Serves ZIPs: {zipsForCb(cb.id).join(", ") || "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <a href={`tel:${cb.phone.replace(/[^0-9]/g, "")}`} className={OUTLINE_BTN}>
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {cb.phone}
                    </a>
                    <a href={`mailto:${cb.email}`} className={TEXT_LINK}>
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      Email
                    </a>
                    <a
                      href={cb.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={TEXT_LINK}
                    >
                      <Globe className="h-4 w-4" aria-hidden="true" />
                      Website
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="all-precincts-title" title="Police Precincts" ruled className="px-0">
          <ul className={ROW_LIST}>
            {Object.entries(PRECINCTS).map(([id, p]) => (
              <li key={id} className={ROW}>
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p dir="auto" className="font-bold text-foreground">
                    {p.name}
                  </p>
                  <p dir="auto" className="text-sm text-muted-foreground">
                    Serves: {p.serves}
                  </p>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span dir="auto">{p.address}</span>
                  </p>
                  <p dir="auto" className="mt-1 text-sm text-muted-foreground">
                    Serves ZIPs: {zipsForPrecinct(id).join(", ") || "—"}
                  </p>
                  <div className="mt-2">
                    <a href={`tel:${p.phone.replace(/[^0-9]/g, "")}`} className={OUTLINE_BTN}>
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {p.phone}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <div className="mt-10">
          <Link to="/civic" className={TEXT_LINK}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            Back to Your Voice in the Bronx
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
