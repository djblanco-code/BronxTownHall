import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { OfficialUpdatesFeed } from "@/components/OfficialUpdatesFeed";
import { useI18n } from "@/lib/i18n-context";
import { SpeakButton } from "@/components/SpeakButton";
import {
  ArrowLeft,
  CalendarPlus,
  Megaphone,
  User,
  Bell,
  Phone,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Shield,
  MapPin,
  MessageSquare,
  Locate,
  Vote,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  BOROUGH_WIDE,
  COMMUNITY_BOARDS,
  PRECINCTS,
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

const ZIP_KEY = "bronx_voice_zip";

function PhoneLink({ phone }: { phone: string }) {
  const tel = phone.replace(/[^0-9+]/g, "");
  return (
    <a
      href={`tel:${tel}`}
      className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#34a853] text-white text-sm font-semibold hover:opacity-90 transition"
    >
      <Phone className="h-4 w-4" /> {phone}
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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition break-all"
    >
      <Icon className="h-4 w-4 shrink-0" /> <span className="truncate">{children}</span>
    </a>
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
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl max-w-lg w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-lg">Contact {o.name}</h3>
        <p className="text-xs text-muted-foreground">{o.title}</p>
        <label className="block text-sm font-semibold mt-4">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <label className="block text-sm font-semibold mt-3">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            onClick={onClose}
            className="no-min-h px-4 py-2 rounded-lg border border-border text-sm font-semibold"
          >
            Cancel
          </button>
          {o.phone && (
            <a
              href={`tel:${o.phone.replace(/[^0-9+]/g, "")}`}
              className="no-min-h px-4 py-2 rounded-lg bg-[#34a853] text-white text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          {mailto ? (
            <a
              href={mailto}
              className="no-min-h px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </a>
          ) : (
            <span className="text-xs text-muted-foreground self-center">
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
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground shrink-0">
          <User className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          {badge && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent">{badge}</p>
          )}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {o.title}
          </p>
          <h3 className="font-bold text-lg text-foreground leading-tight">
            {o.name}
            {o.party && (
              <span className="text-sm font-normal text-muted-foreground"> ({o.party})</span>
            )}
          </h3>
          {o.helps && <p className="text-sm text-foreground/80 mt-2">{o.helps}</p>}
        </div>
        <button
          onClick={() => speak(summary)}
          aria-label="Listen"
          className="no-min-h h-9 w-9 grid place-items-center rounded-full border border-border text-foreground hover:bg-secondary shrink-0"
        >
          🔊
        </button>
      </div>

      {o.address && (
        <p className="mt-3 text-sm text-muted-foreground flex items-start gap-1.5">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {o.address}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {o.phone && <PhoneLink phone={o.phone} />}
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
        <button
          onClick={() => setOpenContact(true)}
          className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition"
        >
          <MessageSquare className="h-4 w-4" /> Contact
        </button>
      </div>

      {openContact && <ContactModal o={o} onClose={() => setOpenContact(false)} />}
    </article>
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
      <button
        onClick={onAdd}
        className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary text-primary text-sm font-semibold"
      >
        <CalendarPlus className="h-4 w-4" /> Add to Calendar
      </button>
      <button
        onClick={onRemind}
        className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-accent text-accent text-sm font-semibold"
      >
        <Bell className="h-4 w-4" /> Remind Me
      </button>
    </div>
  );
}

function CommunityBoardCard({ id }: { id: string }) {
  const cb = COMMUNITY_BOARDS[id];
  if (!cb) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-accent">Your Community Board</p>
      <h3 className="font-bold text-lg text-foreground mt-1">
        Community Board {id.replace("CB", "")}
      </h3>
      <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-2">
        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
        {cb.address}
      </p>
      <p className="text-sm text-foreground mt-1">
        {cb.schedule} · {cb.time}
      </p>
      <p className="text-xs text-muted-foreground">✅ Public session: {cb.publicSession}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <PhoneLink phone={cb.phone} />
        <LinkBtn href={`mailto:${cb.email}`} icon={Mail}>
          {cb.email}
        </LinkBtn>
        <LinkBtn href={cb.website} icon={Globe}>
          {cb.website.replace(/^https?:\/\//, "")}
        </LinkBtn>
      </div>
      <div className="mt-3">
        <MeetingCalendarButtons
          title={`CB${id.replace("CB", "")} Monthly Meeting`}
          location={cb.address}
          description={`Community Board ${id.replace("CB", "")} monthly meeting — ${cb.schedule} at ${cb.time}.`}
        />
      </div>
    </div>
  );
}

function PrecinctCard({ id }: { id: string }) {
  const p = PRECINCTS[id];
  if (!p) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1">
        <Shield className="h-3.5 w-3.5" />
        Your Police Precinct
      </p>
      <h3 className="font-bold text-lg text-foreground mt-1">{p.name}</h3>
      <p className="text-sm text-muted-foreground">Serves: {p.serves}</p>
      <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1">
        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
        {p.address}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Next community council meeting: {p.nextMeeting}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <PhoneLink phone={p.phone} />
      </div>
      <div className="mt-3">
        <MeetingCalendarButtons
          title={`${p.name} Community Council Meeting`}
          location={p.address}
          description={`Community council meeting at ${p.name}. Call ${p.phone} for date.`}
        />
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mt-8 mb-3 border-t border-border pt-6">
      {children}
    </h2>
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
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <div className="flex items-center gap-2">
          <Vote className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Your Voice in the Bronx</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Find your local officials, Community Board, and Police Precinct.
        </p>
        <div className="mt-2">
          <SpeakButton
            text="Your Voice in the Bronx. Enter your zip code to find your local officials, community board, and police precinct."
            label={t("listen")}
          />
        </div>

        <div className="mt-6">
          <OfficialUpdatesFeed />
        </div>

        {/* ZIP input */}
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card p-5">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Enter your Bronx zip code to find your local officials, Community Board, and Police
            Precinct
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="no-min-h inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-primary text-primary text-sm font-semibold disabled:opacity-50"
            >
              <Locate className="h-4 w-4" />
              {locating ? "Locating…" : "Use My Location"}
            </button>
            <input
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
              placeholder="e.g. 10462"
              inputMode="numeric"
              maxLength={5}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-base"
              aria-label="Bronx zip code"
            />
            <button
              type="submit"
              className="no-min-h px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
            >
              Find
            </button>
          </div>
          {zip && (
            <p className="mt-3 text-sm text-foreground">
              <span className="font-semibold">Showing results for:</span> {zip}
            </p>
          )}
          <div className="mt-3">
            <Link
              to="/civic/all"
              className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
            >
              🌎 See Other Areas <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </form>

        {!zip && (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
            Enter your ZIP above to see your Community Board, Police Precinct, City Council member,
            State Senator, Assembly member, and U.S. Representative.
          </div>
        )}

        {zip && mapping && off && (
          <>
            <SectionHeader>Your Community Board</SectionHeader>
            <div className="grid gap-3">
              {mapping.cb.map((id) => (
                <CommunityBoardCard key={id} id={id} />
              ))}
              {mapping.cbPartial && mapping.cbPartial.length > 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Your area may also be served by:{" "}
                  {mapping.cbPartial.map((c) => `CB${c.replace("CB", "")}`).join(", ")}.
                </p>
              )}
            </div>

            <SectionHeader>Your Police Precinct</SectionHeader>
            <div className="grid gap-3">
              {mapping.precincts.map((id) => (
                <PrecinctCard key={id} id={id} />
              ))}
            </div>

            <SectionHeader>Your Elected Officials</SectionHeader>
            <div className="grid gap-3">
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
              {off.council.length + off.assembly.length + off.senate.length + off.house.length ===
                0 && (
                <p className="text-sm text-muted-foreground">
                  No district-level officials found for this ZIP.
                </p>
              )}
            </div>
          </>
        )}

        <SectionHeader>Borough-Wide Officials</SectionHeader>
        <div className="grid gap-3">
          {BOROUGH_WIDE.map((o) => (
            <OfficialCard key={o.name} o={o} />
          ))}
        </div>

        <SectionHeader>Report an Issue</SectionHeader>
        <ul className="grid gap-2">
          {REPORT_ISSUES.map((r) => (
            <li
              key={r.label}
              className="rounded-xl border border-border bg-card p-4 flex items-start gap-3"
            >
              <span className="text-xl shrink-0" aria-hidden>
                {r.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{r.label}</p>
                <p className="text-sm text-muted-foreground">→ {r.to}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <a
                  href={`tel:${r.phone.replace(/[^0-9]/g, "")}`}
                  className="no-min-h text-xs px-2 py-1.5 rounded bg-[#34a853] text-white font-semibold"
                >
                  Call {r.phone}
                </a>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-min-h text-xs px-2 py-1.5 rounded border border-primary text-primary font-semibold text-center"
                >
                  Website
                </a>
              </div>
            </li>
          ))}
          <li className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-bold">Emergency?</span> Always call{" "}
              <a href="tel:911" className="underline font-bold">
                911
              </a>
              .
            </p>
          </li>
        </ul>

        <SectionHeader>Voter Resources</SectionHeader>
        <ul className="grid sm:grid-cols-2 gap-2">
          {VOTER_LINKS.map((v) => (
            <li key={v.label}>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:bg-secondary/50 transition"
              >
                <span className="text-2xl" aria-hidden>
                  {v.icon}
                </span>
                <span className="font-semibold text-foreground flex-1">{v.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link
            to="/civic/all"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
          >
            🌎 See Other Areas
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
