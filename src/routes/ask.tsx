import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
import { VerifiedPill } from "@/components/VerifiedPill";
import { askQuestion, type AskResult } from "@/lib/ask.functions";
import { useI18n } from "@/lib/i18n-context";
import type { VerificationStatus } from "@/lib/verification";
import { Loader2, Phone, MapPin, Clock, AlertTriangle, Search } from "lucide-react";

export const Route = createFileRoute("/ask")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Ask a Question — Bronx Town Hall" },
      {
        name: "description",
        content:
          "Ask in plain words and get answers drawn only from Bronx Town Hall's own listings, with each listing's verification status.",
      },
      { property: "og:title", content: "Ask a Question — Bronx Town Hall" },
      {
        property: "og:description",
        content: "Answers come only from Bronx Town Hall listings — never guesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AskPage,
});

const EXAMPLES = [
  "Where can I get free legal help near Fordham Road?",
  "Is there a food pantry open on Sundays?",
  "Job training for young adults",
];
const ADVICE_CATS = new Set(["legal", "health"]);

function AskPage() {
  const ask = useServerFn(askQuestion);
  const { lang } = useI18n();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<AskResult | null>(null);

  const submit = async (text: string) => {
    if (text.trim().length < 2 || busy) return;
    setBusy(true);
    setRes(null);
    try {
      setRes(await ask({ data: { question: text.trim(), lang } }));
    } catch {
      setRes({ kind: "error", message: "Sorry, something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <PagePhoto slug={"hostos"} />
        <h1 className="text-3xl text-foreground sm:text-4xl">Ask a question</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Answers come only from listings in Bronx Town Hall. If we don't have it, we'll tell you.
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(q);
          }}
        >
          <label htmlFor="ask-q" className="sr-only">
            Your question
          </label>
          <input
            id="ask-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={400}
            placeholder="e.g. Is there a food pantry open on Sundays?"
            className="h-12 min-w-0 flex-1 rounded-md border border-border bg-card px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-12 shrink-0 rounded-md bg-primary-fill px-5 font-bold text-primary-fill-foreground transition-colors hover:bg-primary-fill-hover disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Searching" /> : "Ask"}
          </button>
        </form>
        {!res && !busy && (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {EXAMPLES.map((e) => (
              <li key={e}>
                <button
                  onClick={() => {
                    setQ(e);
                    submit(e);
                  }}
                  className="no-min-h flex min-h-[44px] w-full items-center gap-3 py-2.5 text-start text-sm font-semibold text-primary hover:underline"
                >
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  {e}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div id="ask-answer" aria-live="polite" className="mt-6">
          {busy && (
            <p className="text-sm text-muted-foreground">Searching Bronx Town Hall listings…</p>
          )}
          {res?.kind === "error" && <p className="text-sm text-destructive">{res.message}</p>}
          {res?.kind === "out_of_scope" && (
            <p className="border-y border-border py-4">
              I can help you find Bronx resources like food, health, legal aid, jobs, childcare, and
              events. What are you looking for?
            </p>
          )}
          {res?.kind === "no_match" && (
            <div className="border-y border-border py-4">
              <p>
                I couldn't find a verified match for that in Bronx Town Hall yet. Here's how to
                search manually:
              </p>
              <p className="mt-2 flex gap-3 flex-wrap">
                {res.category && (
                  <Link
                    to="/category/$cat"
                    params={{ cat: res.category }}
                    className="font-semibold text-primary underline"
                  >
                    Browse this category
                  </Link>
                )}
                <Link to="/search" search={{ q }} className="font-semibold text-primary underline">
                  Search all listings
                </Link>
              </p>
            </div>
          )}
          {res?.kind === "matches" && (
            <div>
              <p className="pt-2 font-bold">
                Here{" "}
                {res.matches.length === 1 ? "is 1 listing" : `are ${res.matches.length} listings`}{" "}
                from Bronx Town Hall that may match:
              </p>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {res.matches.map((m) => (
                  <li key={m.id} className="py-3">
                    <Link
                      to="/resource/$id"
                      params={{ id: m.id }}
                      className="font-bold text-foreground underline-offset-2 hover:underline"
                    >
                      {m.name}
                    </Link>
                    <div className="mt-1">
                      <VerifiedPill
                        status={m.status as VerificationStatus}
                        lastVerified={m.lastVerified}
                        category={m.category}
                        compact
                      />
                    </div>
                    {m.address && (
                      <p className="text-sm mt-2 flex gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        {m.address}
                      </p>
                    )}
                    {m.hours && (
                      <p className="text-sm mt-1 flex gap-1.5">
                        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        {m.hours}
                      </p>
                    )}
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="text-sm mt-1 flex gap-1.5 text-primary">
                        <Phone className="h-4 w-4 shrink-0" aria-hidden />
                        {m.phone}
                      </a>
                    )}
                    {ADVICE_CATS.has(m.category) && (
                      <p className="text-xs mt-2 flex gap-1.5 text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                        This is not legal or medical advice. For your specific situation, please
                        contact {m.name} directly or consult a licensed professional.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Hours and details can change — please call ahead.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
