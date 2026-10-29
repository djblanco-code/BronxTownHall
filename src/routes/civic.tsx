import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { OfficialUpdatesFeed } from "@/components/OfficialUpdatesFeed";
import { useI18n } from "@/lib/i18n-context";
import { SpeakButton } from "@/components/SpeakButton";
import { Section } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BadgeAlert,
  CalendarDays,
  CalendarPlus,
  ClipboardCheck,
  House,
  Megaphone,
  User,
  Users,
  Bell,
  Phone,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Scale,
  Shield,
  ShieldAlert,
  MapPin,
  MessageSquare,
  Locate,
  Vote,
  AlertTriangle,
  ChevronRight,
  Volume2,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BOROUGH_WIDE,
  COMMUNITY_BOARDS,
  PRECINCTS,
  CIVIC_ZIP_KEY,
  ZIP_MAP,
  officialsForZip,
  REPORT_ISSUES,
  VOTER_LINKS,
  buildIcs,
  downloadIcs,
  type Official,
} from "@/lib/civic-data";

export const Route = createFileRoute("/civic")({
  staticData: { sitemap: true },
  component: CivicPage,
  head: () => ({
    meta: [
      { title: "Your Voice in the Bronx — Find Your Officials & Community Board" },
      {
        name: "description",
        content:
          "Enter your Bronx ZIP code to find your City Council member, State Senator, Assembly member, Congress member, Community Board, and Police Precinct.",
      },
    ],
  }),
});

const ZIP_KEY = CIVIC_ZIP_KEY;

/** Secondary button: 2px ink outline that fills on hover, 44px tall. */
const OUTLINE_BTN = cn(buttonVariants({ variant: "outline" }), "no-min-h h-11 px-4");
/** The one solid button on the page (Find, or Send Email in the contact dialog). */
const PRIMARY_BTN = cn(buttonVariants(), "no-min-h h-11 px-5");
/** Contact details shown as underlined links, still a 44px tap target. */
const TEXT_LINK =
  "no-min-h inline-flex min-h-11 max-w-full items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2";
/** Rows between hairlines; two columns on a laptop. */
const ROW_LIST =
  "divide-y divide-border border-b border-border lg:grid lg:grid-cols-2 lg:gap-x-8 lg:divide-y-0 lg:border-b-0";
const ROW = "py-4 lg:border-b lg:border-border";

/** Line icons for the report-an-issue and voter rows (the data carries emoji we don't show). */
const ISSUE_ICONS: Record<string, LucideIcon> = {
  "Pothole, streetlight, sanitation": Wrench,
  "Housing violation": House,
  "Noise complaint": Volume2,
  "Safety concern (non-emergency)": ShieldAlert,
  "Police misconduct": BadgeAlert,
  "Crime victim assistance": Scale,
};
const VOTER_ICONS: Record<string, LucideIcon> = {
  "Register to Vote": Vote,
  "Check Registration Status": ClipboardCheck,
  "Find Your Polling Place": MapPin,
  "Upcoming Elections": CalendarDays,
};

function PhoneLink({ phone }: { phone: string }) {
  const tel = phone.replace(/[^0-9+]/g, "");
  return (
    <a href={`tel:${tel}`} className={OUTLINE_BTN}>
      <Phone className="h-4 w-4" aria-hidden="true" /> {phone}
    </a>
  );
}

function LinkBtn({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
      <Icon className="h-4 w-4 shrink-0" />{" "}
      <span dir="auto" className="min-w-0 [overflow-wrap:anywhere]">
        {children}
      </span>
    </a>
  );
}

/** A row's leading line icon, aligned with the label line. */
function RowIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <Icon className={cn("mt-0.5 h-5 w-5 shrink-0 text-primary", className)} aria-hidden="true" />
  );
}

function ContactModal({ o, onClose }: { o: Official; onClose: () => void }) {
  const [subject, setSubject] = useState(`Constituent concern — Bronx resident`);
  const [body, setBody] = useState(
    `Dear ${o.name},\n\nI am a resident of the Bronx and I am writing to bring to your attention the following issue:\n\n[Describe your concern here]\n\nAs a constituent, I would appreciate your support in addressing this matter.\n\nThank you for your service to our community.\n\nSincerely,\n[Your name]\n[Your address]\n[Your phone / email]`,
  );
  const mailto = o.email
    ? `mailto:${o.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null;
  const titleId = `contact-${o.name.replace(/\W+/g, "-")}`;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-foreground bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id={titleId}
          dir="auto"
          className="border-b border-border pb-2 text-lg font-bold text-foreground"
        >
          Contact {o.name}
        </h3>
        <p dir="auto" className="label-caps mt-2 text-primary">
          {o.title}
        </p>
        <label className="mt-4 block text-sm font-semibold text-foreground">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          dir="auto"
          className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none"
        />
        <label className="mt-3 block text-sm font-semibold text-foreground">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          dir="auto"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none"
        />
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button onClick={onClose} className={OUTLINE_BTN}>
            Cancel
          </button>
          {o.phone && (
            <a href={`tel:${o.phone.replace(/[^0-9+]/g, "")}`} className={OUTLINE_BTN}>
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          {mailto ? (
            <a href={mailto} className={PRIMARY_BTN}>
              <Mail className="h-4 w-4" />
              Send Email
            </a>
          ) : (
            <span className="self-center text-xs text-muted-foreground">
              No email on file — please call or visit the website.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function OfficialCard({ o, badge }: { o: Official; badge?: string }) {
  const { speak } = useI18n();
  const [openContact, setOpenContact] = useState(false);
  const summary = `${o.title}. ${o.name}${o.party ? `, ${o.party}` : ""}. ${o.helps ?? ""}`;
  return (
    <li className={ROW}>
      <article>
        <div className="flex items-start gap-3">
          <RowIcon icon={User} />
          <div className="min-w-0 flex-1">
            {badge && <p className="label-caps text-primary">{badge}</p>}
            <p
              dir="auto"
              className={badge ? "text-sm text-muted-foreground" : "label-caps text-primary"}
            >
              {o.title}
            </p>
            {/* Names in lists are bold body text; the h3 keeps them navigable by screen reader. */}
            <h3 dir="auto" className="text-base leading-snug font-bold text-foreground">
              {o.name}
              {o.party && (
                <span className="text-sm font-normal text-muted-foreground"> ({o.party})</span>
              )}
            </h3>
            {o.helps && (
              <p dir="auto" className="mt-1 text-sm text-foreground/80">
                {o.helps}
              </p>
            )}
            {o.address && (
              <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span dir="auto">{o.address}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => speak(summary)}
            aria-label="Listen"
            className="no-min-h grid h-11 w-11 shrink-0 place-items-center rounded-md bg-bronx-orange text-bronx-orange-foreground transition hover:brightness-95"
          >
            <Volume2 className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 ps-8">
          {o.phone && <PhoneLink phone={o.phone} />}
          <button onClick={() => setOpenContact(true)} className={OUTLINE_BTN}>
            <MessageSquare className="h-4 w-4" /> Contact
          </button>
        </div>
        {(o.email || o.website || o.instagram || o.twitter) && (
          <div className="mt-1 flex flex-wrap gap-x-4 ps-8">
            {o.email && (
              <LinkBtn href={`mailto:${o.email}`} icon={Mail}>
                {o.email}
              </LinkBtn>
            )}
            {o.website && (
              <LinkBtn href={o.website} icon={Globe}>
                {o.website.replace(/^https?:\/\//, "")}
              </LinkBtn>
            )}
            {o.instagram && (
              <LinkBtn href={`https://instagram.com/${o.instagram}`} icon={Instagram}>
                @{o.instagram}
              </LinkBtn>
            )}
            {o.twitter && (
              <LinkBtn href={`https://twitter.com/${o.twitter}`} icon={Twitter}>
                @{o.twitter}
              </LinkBtn>
            )}
          </div>
        )}

        {openContact && <ContactModal o={o} onClose={() => setOpenContact(false)} />}
      </article>
    </li>
  );
}

function MeetingCalendarButtons({
  title,
  location,
  description,
}: {
  title: string;
  location: string;
  description: string;
}) {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setHours(18, 0, 0, 0);
  const onAdd = () => downloadIcs(title, buildIcs({ title, location, description, date }));
  const onRemind = () => {
    if (typeof window !== "undefined" && "Notification" in window) Notification.requestPermission();
    alert(`We'll remind you 1 day before "${title}".`);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onAdd} className={OUTLINE_BTN}>
        <CalendarPlus className="h-4 w-4" /> Add to Calendar
      </button>
      <button onClick={onRemind} className={OUTLINE_BTN}>
        <Bell className="h-4 w-4" /> Remind Me
      </button>
    </div>
  );
}

function CommunityBoardCard({ id }: { id: string }) {
  const cb = COMMUNITY_BOARDS[id];
  if (!cb) return null;
  return (
    <li className="py-4">
      <div className="flex items-start gap-3">
        <RowIcon icon={Users} />
        <div className="min-w-0 flex-1">
          <p className="label-caps text-primary">Your Community Board</p>
          <h3 className="text-base font-bold text-foreground">
            Community Board {id.replace("CB", "")}
          </h3>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span dir="auto">{cb.address}</span>
          </p>
          <p dir="auto" className="mt-1 text-sm text-foreground">
            {cb.schedule} · {cb.time}
          </p>
          <p dir="auto" className="text-sm text-muted-foreground">
            Public session: {cb.publicSession}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 ps-8">
        <PhoneLink phone={cb.phone} />
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 ps-8">
        <LinkBtn href={`mailto:${cb.email}`} icon={Mail}>
          {cb.email}
        </LinkBtn>
        <LinkBtn href={cb.website} icon={Globe}>
          {cb.website.replace(/^https?:\/\//, "")}
        </LinkBtn>
      </div>
      <div className="mt-2 ps-8">
        <MeetingCalendarButtons
          title={`CB${id.replace("CB", "")} Monthly Meeting`}
          location={cb.address}
          description={`Community Board ${id.replace("CB", "")} monthly meeting — ${cb.schedule} at ${cb.time}.`}
        />
      </div>
    </li>
  );
}

function PrecinctCard({ id }: { id: string }) {
  const p = PRECINCTS[id];
  if (!p) return null;
  return (
    <li className="py-4">
      <div className="flex items-start gap-3">
        <RowIcon icon={Shield} />
        <div className="min-w-0 flex-1">
          <p className="label-caps text-primary">Your Police Precinct</p>
          <h3 dir="auto" className="text-base font-bold text-foreground">
            {p.name}
          </h3>
          <p dir="auto" className="text-sm text-muted-foreground">
            Serves: {p.serves}
          </p>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span dir="auto">{p.address}</span>
          </p>
          <p dir="auto" className="mt-1 text-sm text-muted-foreground">
            Next community council meeting: {p.nextMeeting}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 ps-8">
        <PhoneLink phone={p.phone} />
      </div>
      <div className="mt-2 ps-8">
        <MeetingCalendarButtons
          title={`${p.name} Community Council Meeting`}
          location={p.address}
          description={`Community council meeting at ${p.name}. Call ${p.phone} for date.`}
        />
      </div>
    </li>
  );
}

export function CivicPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [zipInput, setZipInput] = useState("");
  const [zip, setZip] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Load saved ZIP on mount (client-only to avoid hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ZIP_KEY);
      if (saved && ZIP_MAP[saved]) {
        setZip(saved);
        setZipInput(saved);
      }
    } catch {
      /* storage unavailable: start without a saved zip */
    }
  }, []);

  const setAndSaveZip = (z: string) => {
    setZip(z);
    try {
      localStorage.setItem(ZIP_KEY, z);
    } catch {
      /* storage unavailable: keep the zip for this visit only */
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipInput && ZIP_MAP[zipInput]) setAndSaveZip(zipInput);
    else alert("Enter a valid Bronx ZIP code (e.g., 10462).");
  };

  const useMyLocation = async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Location is not available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18&addressdetails=1`,
          );
          const j = await r.json();
          const z = j?.address?.postcode;
          if (z && ZIP_MAP[z]) {
            setZipInput(z);
            setAndSaveZip(z);
          } else
            alert(
              `Your ZIP (${z ?? "unknown"}) isn't in the Bronx area we cover. Please enter it manually.`,
            );
        } catch {
          alert("Could not look up your ZIP code. Please enter it manually.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        alert("Location permission denied.");
      },
      { timeout: 8000 },
    );
  };

  const mapping = zip ? ZIP_MAP[zip] : null;
  const off = zip ? officialsForZip(zip) : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 pt-4 pb-10">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("back")}
        </button>

        <header className="mt-1 flex items-start gap-3 border-b-[3px] border-double border-foreground pb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Your Voice in the Bronx
            </h1>
            <p dir="auto" className="mt-1 text-muted-foreground">
              Find your local officials, Community Board, and Police Precinct.
            </p>
          </div>
          <SpeakButton
            text="Your Voice in the Bronx. Enter your zip code to find your local officials, community board, and police precinct."
            label={t("listen")}
          />
        </header>

        <OfficialUpdatesFeed />

        {/* ZIP input: the one boxed group on the page */}
        <form
          onSubmit={submit}
          className="mt-8 max-w-2xl rounded-md border border-border bg-card p-4"
        >
          <label className="mb-3 block text-sm font-semibold text-foreground">
            Enter your Bronx zip code to find your local officials, Community Board, and Police
            Precinct
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className={OUTLINE_BTN}
            >
              <Locate className="h-4 w-4" />
              {locating ? "Locating…" : "Use My Location"}
            </button>
            <div className="flex min-w-0 flex-1 gap-2">
              <input
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                placeholder="e.g. 10462"
                inputMode="numeric"
                maxLength={5}
                className="h-11 w-full min-w-0 flex-1 rounded-md border-2 border-foreground bg-background px-4 text-base text-foreground focus-visible:border-primary focus-visible:outline-none"
                aria-label="Bronx zip code"
              />
              <button type="submit" className={PRIMARY_BTN}>
                Find
              </button>
            </div>
          </div>
          {zip && (
            <p className="mt-3 text-sm text-foreground">
              <span className="font-semibold">Showing results for:</span> {zip}
            </p>
          )}
          <div className="mt-1">
            <Link to="/civic/all" className={TEXT_LINK}>
              See Other Areas <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </form>

        {!zip && (
          <p dir="auto" className="mt-4 max-w-2xl text-sm text-muted-foreground">
            Enter your ZIP above to see your Community Board, Police Precinct, City Council member,
            State Senator, Assembly member, and U.S. Representative.
          </p>
        )}

        {zip && mapping && off && (
          <>
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
              <Section id="civic-cb-title" title="Your Community Board" ruled className="px-0">
                <ul className="divide-y divide-border border-b border-border">
                  {mapping.cb.map((id) => (
                    <CommunityBoardCard key={id} id={id} />
                  ))}
                </ul>
                {mapping.cbPartial && mapping.cbPartial.length > 0 && (
                  <p dir="auto" className="mt-2 text-xs text-muted-foreground italic">
                    Your area may also be served by:{" "}
                    {mapping.cbPartial.map((c) => `CB${c.replace("CB", "")}`).join(", ")}.
                  </p>
                )}
              </Section>

              <Section
                id="civic-precinct-title"
                title="Your Police Precinct"
                ruled
                className="px-0"
              >
                <ul className="divide-y divide-border border-b border-border">
                  {mapping.precincts.map((id) => (
                    <PrecinctCard key={id} id={id} />
                  ))}
                </ul>
              </Section>
            </div>

            <Section
              id="civic-officials-title"
              title="Your Elected Officials"
              ruled
              className="px-0"
            >
              <ul className={ROW_LIST}>
                {off.council.map((o) => (
                  <OfficialCard key={o.name} o={o} badge="City Council" />
                ))}
                {off.assembly.map((o) => (
                  <OfficialCard key={o.name} o={o} badge="State Assembly" />
                ))}
                {off.senate.map((o) => (
                  <OfficialCard key={o.name} o={o} badge="State Senate" />
                ))}
                {off.house.map((o) => (
                  <OfficialCard key={o.name} o={o} badge="U.S. Representative" />
                ))}
              </ul>
              {off.council.length + off.assembly.length + off.senate.length + off.house.length ===
                0 && (
                <p className="py-3 text-sm text-muted-foreground">
                  No district-level officials found for this ZIP.
                </p>
              )}
            </Section>
          </>
        )}

        <Section id="civic-borough-title" title="Borough-Wide Officials" ruled className="px-0">
          <ul className={ROW_LIST}>
            {BOROUGH_WIDE.map((o) => (
              <OfficialCard key={o.name} o={o} />
            ))}
          </ul>
        </Section>

        <Section id="civic-report-title" title="Report an Issue" ruled className="px-0">
          <ul className={ROW_LIST}>
            {REPORT_ISSUES.map((r) => {
              const Icon = ISSUE_ICONS[r.label] ?? Megaphone;
              return (
                <li key={r.label} className={cn(ROW, "flex items-start gap-3")}>
                  <RowIcon icon={Icon} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{r.label}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 rtl:rotate-180"
                        aria-hidden="true"
                      />
                      <span dir="auto">{r.to}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a href={`tel:${r.phone.replace(/[^0-9]/g, "")}`} className={OUTLINE_BTN}>
                        Call {r.phone}
                      </a>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={TEXT_LINK}
                      >
                        Website
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
            <li className={cn(ROW, "flex items-start gap-3")}>
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <p dir="auto" className="text-sm text-foreground">
                <span className="font-bold text-destructive">Emergency?</span> Always call{" "}
                <a
                  href="tel:911"
                  className="font-bold text-destructive underline underline-offset-4"
                >
                  911
                </a>
                .
              </p>
            </li>
          </ul>
        </Section>

        <Section id="civic-voter-title" title="Voter Resources" ruled className="px-0">
          <ul className={ROW_LIST}>
            {VOTER_LINKS.map((v) => {
              const Icon = VOTER_ICONS[v.label] ?? Vote;
              return (
                <li key={v.label} className="lg:border-b lg:border-border">
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-min-h group flex min-h-11 items-center gap-3 py-3"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="flex-1 font-bold text-foreground group-hover:underline">
                      {v.label}
                    </span>
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </Section>

        <div className="mt-10 flex justify-center">
          <Link to="/civic/all" className={OUTLINE_BTN}>
            See Other Areas
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
