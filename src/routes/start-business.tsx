import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ROADMAP, GRANTS, ADVISORS, STORIES, LIBRARY } from "@/lib/entrepreneur-data";
import { EntrepreneurLeadForm } from "@/components/EntrepreneurLeadForm";
import { ArrowLeft, ExternalLink, Phone, MapPin, Rocket, Sparkles, Calendar } from "lucide-react";

export const Route = createFileRoute("/start-business")({
  staticData: { sitemap: false },
  // Out of the first version (docs/product-scope.md); hidden, not deleted.
  beforeLoad: () => {
    throw redirect({ to: "/portal" });
  },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Start a Business in The Bronx — Bronx Town Hall" },
      {
        name: "description",
        content:
          "Free roadmap, Bronx-specific grants, mentors, and workshops for aspiring Bronx entrepreneurs. From idea to launch.",
      },
      { property: "og:title", content: "Start a Business in The Bronx" },
      {
        property: "og:description",
        content: "Bronx grants, free advisors, and a step-by-step pathway from idea to launch.",
      },
    ],
  }),
  component: StartBusinessPage,
});

function StartBusinessPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">
        <Link
          to="/"
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-br from-primary via-primary to-accent text-primary-fill-foreground p-6 sm:p-10 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center shrink-0">
              <Rocket className="h-7 w-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80">
                Bronx Entrepreneur Hub
              </p>
              <h1 className="text-3xl sm:text-4xl mt-1">Start a Business in The Bronx</h1>
              <p className="mt-2 text-sm sm:text-base opacity-95 max-w-2xl">
                A step-by-step roadmap, Bronx-only grants, and free advisors — so your idea doesn't
                stay just an idea.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="#grants"
                  className="no-min-h px-4 py-2 rounded-full bg-white text-primary font-semibold text-sm hover:opacity-90"
                >
                  See grants
                </a>
                <a
                  href="#tell-us"
                  className="no-min-h px-4 py-2 rounded-full border-2 border-white/60 text-white font-semibold text-sm hover:bg-white/10"
                >
                  Talk to a mentor
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section aria-labelledby="roadmap-heading">
          <h2 id="roadmap-heading" className="text-2xl font-bold mb-1">
            Your roadmap
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Idea → Plan → Fund → Launch → Grow. We're with you the whole way.
          </p>
          <ol className="grid md:grid-cols-5 gap-3">
            {ROADMAP.map((step, i) => (
              <li
                key={step.key}
                className="rounded-2xl border-2 border-border bg-card p-4 flex flex-col"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold grid place-items-center text-sm"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="text-2xl" aria-hidden>
                    {step.emoji}
                  </span>
                  <h3 className="font-bold">{step.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{step.summary}</p>
                <ul className="mt-3 space-y-1.5 text-xs">
                  {step.checklist.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="text-primary shrink-0">□</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        {/* Grants */}
        <section id="grants" aria-labelledby="grants-heading">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 id="grants-heading" className="text-2xl font-bold">
                Grants for Bronx entrepreneurs
              </h2>
              <p className="text-sm text-muted-foreground">
                Free money — grants first, loans second. Always confirm current eligibility on the
                grantor's site.
              </p>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {GRANTS.map((g) => (
              <li
                key={g.id}
                className="rounded-2xl border-2 border-border bg-card p-4 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">{g.name}</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-success/15 text-success shrink-0">
                    {g.amount}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{g.eligibility}</p>
                <p className="text-xs mt-2 inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" aria-hidden /> Deadline: {g.deadline}
                </p>
                <a
                  href={g.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="no-min-h mt-3 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary hover:underline"
                >
                  Apply <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Advisors */}
        <section aria-labelledby="advisors-heading">
          <h2 id="advisors-heading" className="text-2xl font-bold mb-1">
            Free Bronx advisors & mentors
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            All of these are free. Book a session — they'll help you write a plan, pick a legal
            structure, and apply for money.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {ADVISORS.map((a) => (
              <li key={a.id} className="rounded-2xl border-2 border-border bg-card p-4">
                <h3 className="font-bold">{a.name}</h3>
                <p className="text-sm mt-1">{a.what}</p>
                <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {a.address}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`tel:${a.phone.replace(/[^0-9+]/g, "")}`}
                    data-call-now
                    className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-fill text-primary-fill-foreground text-sm font-semibold min-h-[44px]"
                  >
                    <Phone className="h-4 w-4" aria-hidden /> {a.phone}
                  </a>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-2 border-border text-sm font-semibold hover:border-primary min-h-[44px]"
                  >
                    Website <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Events */}
        <section
          aria-labelledby="events-heading"
          className="rounded-2xl border-2 border-border bg-card p-5"
        >
          <h2 id="events-heading" className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" aria-hidden /> Workshops & pitch nights
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse upcoming Bronx business workshops, pitch competitions, and networking events.
          </p>
          <Link
            to="/events"
            className="no-min-h mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90"
          >
            See all events →
          </Link>
        </section>

        {/* Success stories */}
        <section aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-warning" aria-hidden /> Bronx entrepreneurs who made
            it
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Real Bronx founders who started with an idea — just like you.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {STORIES.map((s) => (
              <article
                key={s.id}
                className="rounded-2xl border-2 border-border bg-card p-5 flex flex-col"
              >
                <div className="text-4xl" aria-hidden>
                  {s.emoji}
                </div>
                <h3 className="font-bold mt-2">{s.business}</h3>
                <p className="text-xs text-muted-foreground">
                  {s.founder} · {s.neighborhood}
                </p>
                <blockquote className="mt-3 text-sm italic border-s-4 border-primary ps-3">
                  "{s.quote}"
                </blockquote>
              </article>
            ))}
          </div>
        </section>

        {/* Resource library */}
        <section aria-labelledby="library-heading">
          <h2 id="library-heading" className="text-2xl font-bold mb-4">
            Resource library
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {LIBRARY.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="no-min-h flex items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 hover:border-primary transition"
                >
                  <span className="text-3xl shrink-0" aria-hidden>
                    {l.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold inline-flex items-center gap-1.5">
                      {l.title} <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.description}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Tell us your idea */}
        <section id="tell-us" aria-labelledby="tell-us-heading" className="scroll-mt-20">
          <h2 id="tell-us-heading" className="text-2xl font-bold mb-1">
            Not sure where to start?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send us a few sentences about your idea and we'll match you with the right grant,
            advisor, or program.
          </p>
          <EntrepreneurLeadForm />
        </section>

        {/* Already open CTA */}
        <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-bold">Already open for business?</p>
            <p className="text-sm text-muted-foreground">
              List your Bronx business so neighbors can find you.
            </p>
          </div>
          <Link
            to="/businesses"
            className="no-min-h inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-fill text-primary-fill-foreground font-semibold text-sm hover:opacity-90"
          >
            Browse the directory →
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
