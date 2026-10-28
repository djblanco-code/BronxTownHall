import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/features/shell";
import { SMS_KEYWORDS, SMS_SPECIAL_KEYWORDS, SMS_NUMBER, SMS_CONFIGURED, formatSmsNumber, buildSmsReply } from "@/lib/sms";
import { MessageSquare, Phone, Signal, Check } from "lucide-react";

export const Route = createFileRoute("/sms")({
  staticData: { sitemap: true },
  component: SmsPage,
  head: () => ({
    meta: [
      { title: "Text FOOD for Help — The Bronx App by Text Message" },
      {
        name: "description",
        content:
          "No smartphone? No data? Text a keyword like FOOD to get the nearest open Bronx food pantry, clinic, or legal aid by SMS.",
      },
      { property: "og:title", content: "Text FOOD for Help — The Bronx App" },
      {
        property: "og:description",
        content: "Get Bronx resources by plain text message. Works on any phone, no app or data needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function SmsPage() {
  const [liveReply, setLiveReply] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [demo, setDemo] = useState("FOOD");

  useEffect(() => {
    let active = true;
    setLiveReply(null);
    const t = setTimeout(() => {
      fetch(`/api/public/sms?Body=${encodeURIComponent(demo)}`)
        .then((r) => (r.ok ? r.text() : null))
        .then((text) => {
          if (active && text) setLiveReply(text);
        })
        .catch(() => {});
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [demo]);



  const notify = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("bronx.smsNotify", email);
    } catch { /* ignore */ }
    setSent(true);
  };

  return (
    <AppShell>
      <section className="bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wide">
            <Signal className="h-3.5 w-3.5" /> Works on any phone
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Text <span className="text-primary">FOOD</span> for help
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            No smartphone, no data, no app. Send one word by text message and get the nearest
            open Bronx pantry, clinic, or legal clinic right back.
          </p>
          <div className="mt-6 rounded-2xl border-2 border-primary/40 bg-card p-5 shadow-sm">
            {SMS_CONFIGURED ? (
              <>
                <p className="text-sm text-muted-foreground">Text a keyword to</p>
                <a
                  href={`sms:${SMS_NUMBER}`}
                  className="no-min-h block text-3xl sm:text-4xl font-bold text-foreground mt-1 hover:underline"
                >
                  {formatSmsNumber(SMS_NUMBER)}
                </a>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-foreground">Coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The text line is built and ready — it goes live the day a Bronx number is
                  assigned to the pilot.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Keywords</h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {[...SMS_KEYWORDS, ...SMS_SPECIAL_KEYWORDS].map((k) => (
            <li key={k.keyword} className="rounded-2xl border-2 border-border bg-card p-4 flex items-start gap-3">
              <span className="shrink-0 h-10 w-10 rounded-full bg-primary/15 text-primary grid place-items-center">
                <MessageSquare className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-bold text-foreground">Text “{k.keyword}”</span>
                <span className="block text-sm text-muted-foreground">{k.blurb}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          Text HELP for emergency hotlines, STOP to opt out. Message and data rates may apply.
          We never share your number.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 mt-10">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Try it here</h2>
        <div className="rounded-2xl border-2 border-border bg-card p-4">
          <label htmlFor="sms-demo" className="text-sm font-semibold text-foreground">
            Type a keyword to preview the reply
          </label>
          <input
            id="sms-demo"
            value={demo}
            onChange={(e) => setDemo(e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary uppercase"
          />
          <pre className="mt-3 whitespace-pre-wrap text-sm bg-secondary rounded-xl p-4 text-foreground font-sans">
            {liveReply ?? buildSmsReply(demo)}
          </pre>
        </div>
      </section>

      {!SMS_CONFIGURED && (
        <section className="max-w-3xl mx-auto px-4 mt-10">
          <div className="rounded-2xl border-2 border-border bg-card p-5">
            <h2 className="text-lg font-bold text-foreground">Tell me when the line is live</h2>
            {sent ? (
              <p className="mt-2 inline-flex items-center gap-2 text-success font-semibold">
                <Check className="h-5 w-5" /> Thanks — we'll let you know.
              </p>
            ) : (
              <form onSubmit={notify} className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary"
                />
                <button className="no-min-h px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold min-h-[48px]">
                  Notify me
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-4 mt-10 mb-12">
        <div className="rounded-2xl border-2 border-border bg-secondary p-5">
          <h2 className="text-lg font-bold text-foreground">Why text message</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Roughly one in five Bronx households has no home broadband, and many neighbors run
            out of data before the end of the month. SMS reaches every phone — flip phones,
            prepaid plans, shared devices — with zero install. It is the most inclusive channel
            the borough has.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/emergency" className="no-min-h inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm">
              <Phone className="h-4 w-4" /> Emergency hotlines
            </Link>
            <Link to="/" className="no-min-h inline-flex items-center px-4 py-2.5 rounded-full border-2 border-border bg-card font-semibold text-sm text-foreground">
              Browse the app
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
