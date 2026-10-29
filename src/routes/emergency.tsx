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
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("back")}
        </button>

        <h1 className="text-3xl font-bold text-destructive sm:text-4xl">Emergency Contacts</h1>
        <p className="mt-1 text-muted-foreground">
          Immediate help and essential Bronx services available 24/7.
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-md border border-border px-4 py-3">
          {online ? (
            <WifiOff className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <Wifi className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          )}
          <p className="text-sm font-semibold text-foreground">
            {online
              ? "This page works offline • Saved to your phone, all numbers dial without internet"
              : "You are offline — this saved page and every number below still work"}
          </p>
        </div>

        <a
          href="tel:911"
          className="no-min-h mt-5 inline-flex min-h-20 w-full items-center justify-center gap-3 rounded-md bg-destructive px-4 py-5 text-2xl font-bold text-destructive-foreground hover:bg-destructive/90"
        >
          <Phone className="h-7 w-7 shrink-0" aria-hidden="true" /> DIAL 911 NOW
        </a>

        <ContactGroup id="emergency-critical" title="Critical Emergencies" tone="destructive">
          {CRITICAL.map((c) => (
            <ContactRow key={c.name} c={c} tone="destructive" />
          ))}
        </ContactGroup>

        <ContactGroup id="emergency-nyc" title="NYC Crisis & Support Lines" tone="primary">
          {NYC_SPECIFIC.map((c) => (
            <ContactRow key={c.name} c={c} tone="primary" />
          ))}
        </ContactGroup>

        {otherHotlines.length > 0 && (
          <ContactGroup id="emergency-more" title="More 24/7 Hotlines" tone="primary">
            {otherHotlines.map((h) => (
              <ContactRow
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
          </ContactGroup>
        )}

        {textLines.length > 0 && (
          <ContactGroup id="emergency-text" title="Crisis Text Lines" tone="primary">
            {textLines.map((h) => (
              <li key={h.id} className="py-4">
                <h3 className="font-bold text-foreground">{h.name}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{h.description}</p>
                <a
                  href={`sms:${h.number}${h.textBody ? `?&body=${encodeURIComponent(h.textBody)}` : ""}`}
                  className={`${CALL_BUTTON} bg-primary-fill text-primary-fill-foreground hover:bg-primary-fill-hover`}
                >
                  <MessageSquare className="h-5 w-5 shrink-0" aria-hidden="true" /> Text{" "}
                  {h.textBody} to {h.number}
                </a>
              </li>
            ))}
          </ContactGroup>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need shelter, food, or legal help right now?{" "}
          <Link to="/urgent" className="font-bold text-primary underline underline-offset-4">
            See all urgent help →
          </Link>
        </p>
      </div>
    </AppShell>
  );
}

/** A large, solid call or text button: full width on phones. */
const CALL_BUTTON =
  "no-min-h mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 py-2 text-center font-bold sm:w-auto";

/** A group of numbers under a heavy rule: red for emergencies, ink for the rest. */
function ContactGroup({
  id,
  title,
  tone,
  children,
}: {
  id: string;
  title: string;
  tone: "destructive" | "primary";
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2
        id={id}
        className={`border-t-[3px] pt-2 text-lg font-bold sm:text-2xl ${tone === "destructive" ? "border-destructive text-destructive" : "border-foreground text-foreground"}`}
      >
        {title}
      </h2>
      <ul className="divide-y divide-border border-b border-border">{children}</ul>
    </section>
  );
}

function ContactRow({ c, tone }: { c: Contact; tone: "destructive" | "primary" }) {
  const btn =
    tone === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "bg-primary-fill text-primary-fill-foreground hover:bg-primary-fill-hover";
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <h3 className="font-bold text-foreground">{c.name}</h3>
        {c.verified && (
          <span className="label-caps inline-flex items-center gap-1 text-success">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> VERIFIED
          </span>
        )}
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">{c.desc}</p>
      <a href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`} className={`${CALL_BUTTON} ${btn}`}>
        <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />{" "}
        {c.name === "Emergency Services" ? "DIAL 911" : `Call ${c.display}`}
      </a>
    </li>
  );
}
