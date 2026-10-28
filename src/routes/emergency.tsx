import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { HOTLINES } from "@/lib/resources-extra";
import { ArrowLeft, Phone, ShieldCheck, WifiOff, MessageSquare, Wifi } from "lucide-react";

export const Route = createFileRoute("/emergency")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Emergency & Crisis Help — The Bronx App" },
      {
        name: "description",
        content:
          "911, 311, 988 and every Bronx crisis hotline in one tap-to-call page that keeps working offline.",
      },
      { property: "og:title", content: "Emergency & Crisis Help — The Bronx App" },
      {
        property: "og:description",
        content: "Tap-to-call emergency and crisis numbers for the Bronx. Works offline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmergencyPage,
});

type Contact = { name: string; desc: string; phone: string; display: string; verified: boolean };

const CRITICAL: Contact[] = [
  {
    name: "Emergency Services",
    desc: "Police, Fire, or Medical emergencies",
    phone: "911",
    display: "911",
    verified: true,
  },
  {
    name: "NYC 311",
    desc: "City services, shelter intake, heat/hot water, non-emergency help",
    phone: "311",
    display: "311",
    verified: true,
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    desc: "Free, confidential support in a mental health crisis",
    phone: "988",
    display: "988",
    verified: true,
  },
  {
    name: "Poison Control",
    desc: "NYC Poison & Drug Information Center",
    phone: "1-800-222-1222",
    display: "1-800-222-1222",
    verified: true,
  },
];

const NYC_SPECIFIC: Contact[] = [
  {
    name: "NYC Well",
    desc: "Mental health support in 200+ languages",
    phone: "1-888-692-9355",
    display: "1-888-NYC-WELL",
    verified: true,
  },
  {
    name: "Safe Horizon",
    desc: "Domestic violence and crime victim support",
    phone: "1-800-621-4673",
    display: "1-800-621-HOPE",
    verified: true,
  },
  {
    name: "NYC Homeless Outreach",
    desc: "Street homelessness outreach team (via 311)",
    phone: "311",
    display: "311",
    verified: true,
  },
  {
    name: "Con Edison Gas Emergency",
    desc: "Report a gas leak or downed power line",
    phone: "1-800-752-6633",
    display: "1-800-75-CONED",
    verified: true,
  },
  {
    name: "NY Child Abuse Hotline",
    desc: "Report suspected child abuse or neglect",
    phone: "1-800-342-3720",
    display: "1-800-342-3720",
    verified: true,
  },
];

function EmergencyPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const textLines = HOTLINES.filter((h) => h.type === "text");
  const otherHotlines = HOTLINES.filter(
    (h) => h.type === "hotline" && !["988", "nyc-well"].includes(h.id),
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <h1 className="text-3xl font-bold text-foreground">Emergency Contacts</h1>
        <p className="text-muted-foreground mt-1">
          Immediate help and essential Bronx services available 24/7.
        </p>

        <div
          className={`mt-4 rounded-2xl px-4 py-3 flex items-center gap-3 border ${online ? "bg-success/15 border-success/30" : "bg-warning/15 border-warning/40"}`}
        >
          {online ? (
            <WifiOff className="h-5 w-5 text-success shrink-0" />
          ) : (
            <Wifi className="h-5 w-5 text-warning shrink-0" />
          )}
          <p className={`text-sm font-semibold ${online ? "text-success" : "text-warning"}`}>
            {online
              ? "This page works offline • Saved to your phone, all numbers dial without internet"
              : "You are offline — this saved page and every number below still work"}
          </p>
        </div>

        <a
          href="tel:911"
          className="no-min-h mt-5 w-full inline-flex items-center justify-center gap-3 py-6 rounded-2xl bg-destructive text-destructive-foreground text-2xl font-bold shadow-2xl hover:bg-destructive/90 transition"
        >
          <Phone className="h-7 w-7" /> DIAL 911 NOW
        </a>

        <Section title="Critical Emergencies" tone="destructive">
          {CRITICAL.map((c) => (
            <ContactCard key={c.name} c={c} tone="destructive" />
          ))}
        </Section>

        <Section title="NYC Crisis & Support Lines" tone="primary">
          {NYC_SPECIFIC.map((c) => (
            <ContactCard key={c.name} c={c} tone="primary" />
          ))}
        </Section>

        {otherHotlines.length > 0 && (
          <Section title="More 24/7 Hotlines" tone="primary">
            {otherHotlines.map((h) => (
              <ContactCard
                key={h.id}
                tone="primary"
                c={{
                  name: h.name,
                  desc: `${h.description} · ${h.available}`,
                  phone: h.number,
                  display: h.number,
                  verified: true,
                }}
              />
            ))}
          </Section>
        )}

        {textLines.length > 0 && (
          <Section title="Crisis Text Lines" tone="primary">
            {textLines.map((h) => (
              <div key={h.id} className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-bold text-foreground">{h.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{h.description}</p>
                <a
                  href={`sms:${h.number}${h.textBody ? `?&body=${encodeURIComponent(h.textBody)}` : ""}`}
                  className="no-min-h mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-primary text-primary-foreground"
                >
                  <MessageSquare className="h-5 w-5" /> Text {h.textBody} to {h.number}
                </a>
              </div>
            ))}
          </Section>
        )}

        <p className="mt-8 text-sm text-muted-foreground text-center">
          Need shelter, food, or legal help right now?{" "}
          <Link to="/urgent" className="text-primary font-semibold hover:underline">
            See all urgent help →
          </Link>
        </p>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "destructive" | "primary";
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2
        className={`text-xs font-bold uppercase tracking-wider mb-3 ${tone === "destructive" ? "text-destructive" : "text-primary"}`}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ContactCard({ c, tone }: { c: Contact; tone: "destructive" | "primary" }) {
  const btn =
    tone === "destructive"
      ? "bg-destructive text-destructive-foreground"
      : "bg-primary text-primary-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-bold text-foreground">{c.name}</h3>
        {c.verified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success">
            <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
      <a
        href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
        className={`no-min-h mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold ${btn}`}
      >
        <Phone className="h-5 w-5" />{" "}
        {c.name === "Emergency Services" ? "DIAL 911" : `Call ${c.display}`}
      </a>
    </div>
  );
}
