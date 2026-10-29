import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
import {
  SMS_KEYWORDS,
  SMS_SPECIAL_KEYWORDS,
  SMS_NUMBER,
  SMS_CONFIGURED,
  formatSmsNumber,
  buildSmsReply,
} from "@/lib/sms";
import { MessageSquare, Phone, Signal, Check } from "lucide-react";
import { Section } from "@/components/ui/section";

export const Route = createFileRoute("/sms")({
  staticData: { sitemap: true },
  component: SmsPage,
  head: () => ({
    meta: [
      { title: "Text FOOD for Help — Bronx Town Hall by Text Message" },
      {
        name: "description",
        content:
          "No smartphone? No data? Text a keyword like FOOD to get the nearest open Bronx food pantry, clinic, or legal aid by SMS.",
      },
      { property: "og:title", content: "Text FOOD for Help — Bronx Town Hall" },
      {
        property: "og:description",
        content:
          "Get Bronx resources by plain text message. Works on any phone, no app or data needed.",
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
    } catch {
      /* ignore */
    }
    setSent(true);
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 pt-6">
        <PagePhoto slug={"el-train"} />
        <p className="label-caps flex items-center gap-1.5 text-primary">
          <Signal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Works on any phone
        </p>
        <h1 className="mt-2 text-4xl text-foreground sm:text-5xl">
          Text <span className="text-primary">FOOD</span> for help
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          No smartphone, no data, no app. Send one word by text message and get the nearest open
          Bronx pantry, clinic, or legal clinic right back.
        </p>
        <div className="mt-6 rounded-md border border-border p-4">
          {SMS_CONFIGURED ? (
            <>
              <p className="text-sm text-muted-foreground">Text a keyword to</p>
              <a
                href={`sms:${SMS_NUMBER}`}
                className="no-min-h font-display mt-1 block text-3xl font-bold text-foreground hover:underline sm:text-4xl"
              >
                {formatSmsNumber(SMS_NUMBER)}
              </a>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground">Coming soon</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The text line is built and ready — it goes live the day a Bronx number is assigned
                to the pilot.
              </p>
            </>
          )}
        </div>
      </section>

      <Section id="sms-keywords" title="Keywords" ruled className="max-w-3xl">
        <ul className="grid border-b border-border sm:grid-cols-2 sm:gap-x-6">
          {[...SMS_KEYWORDS, ...SMS_SPECIAL_KEYWORDS].map((k) => (
            <li key={k.keyword} className="flex items-start gap-3 border-t border-border py-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="block font-bold text-foreground">Text “{k.keyword}”</span>
                <span className="block text-sm text-muted-foreground">{k.blurb}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Text HELP for emergency hotlines, STOP to opt out. Message and data rates may apply. We
          never share your number.
        </p>
      </Section>

      <Section id="sms-try" title="Try it here" ruled className="max-w-3xl">
        <label htmlFor="sms-demo" className="text-sm font-bold text-foreground">
          Type a keyword to preview the reply
        </label>
        <input
          id="sms-demo"
          value={demo}
          onChange={(e) => setDemo(e.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-border bg-card px-4 text-base uppercase focus-visible:border-primary focus-visible:outline-none"
        />
        <pre className="mt-3 rounded-md bg-secondary p-4 font-sans text-sm whitespace-pre-wrap text-foreground">
          {liveReply ?? buildSmsReply(demo)}
        </pre>
      </Section>

      {!SMS_CONFIGURED && (
        <Section id="sms-notify" title="Tell me when the line is live" ruled className="max-w-3xl">
          {sent ? (
            <p className="inline-flex items-center gap-2 font-semibold text-success">
              <Check className="h-5 w-5" aria-hidden="true" /> Thanks — we'll let you know.
            </p>
          ) : (
            <form onSubmit={notify} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-12 min-w-0 rounded-md border border-border sm:flex-1 bg-background px-4 text-base focus-visible:border-primary focus-visible:outline-none"
              />
              <button className="no-min-h h-12 rounded-md bg-primary-fill px-5 font-semibold text-primary-fill-foreground hover:bg-primary-fill-hover">
                Notify me
              </button>
            </form>
          )}
        </Section>
      )}

      <Section id="sms-why" title="Why text message" ruled className="mb-12 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          Roughly one in five Bronx households has no home broadband, and many neighbors run out of
          data before the end of the month. SMS reaches every phone — flip phones, prepaid plans,
          shared devices — with zero install. It is the most inclusive channel the borough has.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/emergency"
            className="no-min-h inline-flex h-11 items-center gap-2 rounded-md bg-destructive px-4 text-sm font-bold text-destructive-foreground hover:bg-destructive/90"
          >
            <Phone className="h-4 w-4" aria-hidden="true" /> Emergency hotlines
          </Link>
          <Link
            to="/"
            className="no-min-h inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-bold text-foreground hover:bg-secondary"
          >
            Browse the app
          </Link>
        </div>
      </Section>
    </AppShell>
  );
}
