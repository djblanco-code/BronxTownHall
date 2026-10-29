import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { DemoVideo } from "@/components/DemoVideo";
import {
  Heart,
  MapPin,
  Bell,
  Shield,
  Store,
  Rocket,
  Users,
  Globe2,
  MessageSquare,
  Calendar,
  TrendingUp,
  Building2,
  CheckCircle2,
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  Quote,
  Share2,
} from "lucide-react";

export const Route = createFileRoute("/pitch")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "The Bronx App — Investor & Buyer Overview" },
      {
        name: "description",
        content:
          "A functional prototype: a Bronx-first civic + resource + commerce platform. 48 modules, five languages, cloud backend, ready for operator handoff.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "The Bronx App — Overview" },
      {
        property: "og:description",
        content: "A functional prototype of a Bronx-first community platform.",
      },
    ],
  }),
  component: PitchPage,
});

const stats = [
  { label: "Product modules", value: "48", sub: "Working, not mocked" },
  { label: "Languages", value: "5", sub: "EN · ES · FR · BN · AR" },
  { label: "Resource categories", value: "15", sub: "Food, health, legal, jobs, youth…" },
  { label: "Civic districts", value: "12 + 8", sub: "Community Boards + Precincts" },
  { label: "Total addressable pop.", value: "1.4M", sub: "Bronx residents" },
  { label: "Prototype build time", value: "Weeks", sub: "Not years" },
];

const modules = [
  {
    icon: MapPin,
    name: "Resource Directory",
    desc: "Categorized, searchable, filterable. Food, legal, childcare, health, jobs, youth, nature, arts.",
    link: "/",
  },
  {
    icon: Zap,
    name: "Urgent / SOS",
    desc: "One-tap crisis flow with hotlines, live location, and immediate escalation paths.",
    link: "/urgent",
  },
  {
    icon: Shield,
    name: "Civic Command Center",
    desc: "Your Community Board, precinct, and reps by ZIP with pre-filled contact templates & .ics export.",
    link: "/civic",
  },
  {
    icon: Store,
    name: "Business Hub",
    desc: "Free + Premium tiers. Claim, verify, storefront photos, video content, self-serve dashboard.",
    link: "/businesses",
  },
  {
    icon: Rocket,
    name: "Entrepreneur Hub",
    desc: "Roadmap, grants directory, advisors, workshops, and lead capture for aspiring founders.",
    link: "/roadmap",
  },
  {
    icon: Calendar,
    name: "Hyper-Local Events",
    desc: "Community-submitted, moderated, calendar-view & .ics export.",
    link: "/events",
  },
  {
    icon: Bell,
    name: "Alerts & Bronx Buzz",
    desc: "Real-time traffic/DOT + community-reported alerts by ZIP, severity-color-coded.",
    link: "/buzz",
  },
  {
    icon: Globe2,
    name: "Interactive Map + Transit",
    desc: "Google Maps clustering, subway/bus proximity per listing, spreadsheet view.",
    link: "/map",
  },
  {
    icon: MessageSquare,
    name: "Natural TTS",
    desc: 'OpenAI-quality "Listen" buttons on every resource. Web Speech fallback.',
    link: "/",
  },
  {
    icon: Users,
    name: "Org Portal + RBAC",
    desc: "Roles for officials, boards, non-profits, businesses, admins. Moderation queues.",
    link: "/admin",
  },
  {
    icon: Share2,
    name: "Social Sync",
    desc: "Post once, syndicate to Facebook, Instagram, X, and WhatsApp. Staged for partner pilot.",
    link: "/roadmap",
  },
];

const stack = [
  { k: "Framework", v: "TanStack Start v1 + React 19 + Vite 7" },
  { k: "Backend", v: "Supabase (Postgres + Auth + Storage + RLS)" },
  { k: "Styling", v: "Tailwind v4 · design tokens · shadcn/ui" },
  { k: "AI", v: "OpenAI API (TTS, moderation-ready)" },
  { k: "Maps", v: "Google Maps JS API · clustering · heatmap" },
  { k: "Deploy", v: "Cloudflare Workers (edge) · zero-config" },
  { k: "A11y", v: "WCAG 2.2 AA · focus trap · reduced motion · simplified mode" },
  { k: "i18n", v: "Full 5-language runtime switching" },
];

const revenueLines = [
  {
    name: "Premium Business",
    price: "$19/mo",
    notes: "Verified badge, photos, videos, analytics, priority placement.",
  },
  {
    name: "Featured Placement",
    price: "CPM / flat",
    notes: "Homepage & category-top sponsored slots.",
  },
  {
    name: "Civic Partnerships",
    price: "Annual",
    notes: "Non-profits & city agencies for verified listings + newsletter reach.",
  },
  {
    name: "Entrepreneur Services",
    price: "Referral",
    notes: "Grant advisors, workshops, incorporation partners.",
  },
  {
    name: "Data & Insights",
    price: "License",
    notes: "Anonymized resource-demand data for policy/foundation buyers.",
  },
];

function PitchPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-16">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent text-primary-fill-foreground p-8 sm:p-14">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/15 text-xs font-semibold mb-5 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Functional Prototype · For Acquirer / Operator
              Review
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] mb-4">The Bronx App</h1>
            <p className="text-xl sm:text-2xl font-medium opacity-95 mb-8">
              A borough-first civic, resource, and commerce platform — built as a working product,
              not a slide deck.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                search={{ tour: "1" }}
                className="no-min-h inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary-foreground text-primary font-bold text-sm shadow-lg hover:opacity-90"
              >
                <Play className="h-4 w-4" /> Start guided tour
              </Link>
              <Link
                to="/"
                className="no-min-h inline-flex items-center gap-2 px-5 py-3 rounded-full border-2 border-primary-foreground/40 font-semibold text-sm hover:bg-primary-foreground/10"
              >
                Explore free-form <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <Heart
            className="hidden sm:block absolute -right-8 -bottom-8 h-64 w-64 opacity-10"
            fill="currentColor"
          />
        </section>

        {/* DEMO VIDEO */}
        <DemoVideo />

        {/* TESTIMONIALS / SOCIAL PROOF */}
        <section className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
            <Quote className="h-7 w-7 text-primary" /> What Bronx Residents Are Saying
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <blockquote className="rounded-2xl border border-border bg-card p-6">
              <Quote className="h-6 w-6 text-primary/40 mb-3" />
              <p className="text-lg font-medium leading-relaxed mb-4">
                “This app would have saved me hours of searching when I needed help. I walked 50
                minutes to a clinic that didn't exist anymore. Hyperlocal would have told me it was
                closed.”
              </p>
              <footer className="text-sm text-muted-foreground">
                —{" "}
                <cite className="font-semibold text-foreground not-italic">
                  Alex, Bronx resident
                </cite>
              </footer>
            </blockquote>
            <blockquote className="rounded-2xl border border-border bg-card p-6">
              <Quote className="h-6 w-6 text-primary/40 mb-3" />
              <p className="text-lg font-medium leading-relaxed mb-4">
                “A lot of resources are hidden. If you don't have community, you don't know what's
                actually going on. This app would make everything visible.”
              </p>
              <footer className="text-sm text-muted-foreground">
                —{" "}
                <cite className="font-semibold text-foreground not-italic">
                  Sashay, Bronx educator
                </cite>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* THE PITCH */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-3xl font-bold">The one-line pitch</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              1.4 million Bronx residents lose hours every week hunting for the food pantry that's
              actually open, the clinic that takes their insurance, the community board meeting they
              didn't know about, and the local business they'd love to support.{" "}
              <strong className="text-foreground">
                The Bronx App is the first product that puts all of it in one place — in five
                languages, on one map, with one tap to help.
              </strong>
            </p>
          </div>
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Why now
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Post-pandemic
                resource fatigue
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> NYC Open Data +
                311 APIs mature
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> No borough-native
                competitor
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> AI makes
                multilingual maintenance cheap
              </li>
            </ul>
          </div>
        </section>

        {/* UPDATES SINCE LAST REVIEW — response to critique */}
        <section className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
            Updates since last product review
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Trust, focus, and a Bronx-rooted identity.
          </h2>
          <p className="text-muted-foreground mb-5 max-w-3xl">
            A ruthless review told us to stop leading with taxonomy and start leading with the
            moment of need. We rebuilt around three ideas: solve one problem in 30 seconds, prove
            freshness on every card, and look unmistakably like the Bronx — not another
            indigo-gradient SaaS.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase text-primary mb-1">Home rebuilt</div>
              <p className="font-semibold mb-1">"Open Now Near You"</p>
              <p className="text-sm text-muted-foreground">
                Three live cards with Call, native-map Directions, and distance. Everything else
                moves below the fold.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase text-primary mb-1">Trust layer</div>
              <p className="font-semibold mb-1">Verified pill + Report</p>
              <p className="text-sm text-muted-foreground">
                Every listing shows how fresh it is. Any user can flag broken info — three reports
                auto-hide.
              </p>
              <Link
                to="/data-quality"
                className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
              >
                See data-quality report →
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase text-primary mb-1">Visual identity</div>
              <p className="font-semibold mb-1">Bronx-rooted palette</p>
              <p className="text-sm text-muted-foreground">
                Subway cobalt, brownstone terracotta, park green — no generic startup gradients.
              </p>
            </div>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Kept intentionally: multi-platform social sync (officials post to one channel not
            another), 5-language support, TTS/Simplified View — the app serves everyone the BP
            represents.
          </p>
        </section>

        {/* STATS */}
        <section>
          <h2 className="text-3xl font-bold mb-6">What's already built</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                <div className="text-4xl font-black text-primary mb-1">{s.value}</div>
                <div className="font-semibold text-sm">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* MODULES */}
        <section>
          <h2 className="text-3xl font-bold mb-2">Product surface</h2>
          <p className="text-muted-foreground mb-6">
            Every module below is live in this prototype — click through to try it.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => (
              <Link
                key={m.name}
                to={m.link}
                className="no-min-h group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-md transition"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="font-bold mb-1 group-hover:text-primary">{m.name}</div>
                <div className="text-sm text-muted-foreground leading-snug">{m.desc}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition">
                  Try it <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* DIFFERENTIATION */}
        <section className="rounded-3xl bg-secondary p-8 sm:p-10">
          <h2 className="text-3xl font-bold mb-6">Why this wins</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-bold mb-2">vs. NYC 311</div>
              <p className="text-muted-foreground">
                311 is government-owned, single-purpose, and English-first. We're multilingual,
                community-owned, and cover resources 311 has no visibility into.
              </p>
            </div>
            <div>
              <div className="font-bold mb-2">vs. Nextdoor</div>
              <p className="text-muted-foreground">
                Nextdoor is a feed. We're an index — trust-tagged, verified, categorized, and
                non-toxic by design.
              </p>
            </div>
            <div>
              <div className="font-bold mb-2">vs. Yelp / Google</div>
              <p className="text-muted-foreground">
                Neither surfaces free civic resources, community boards, or halal/kosher/Medicaid
                filters. And neither speaks Bengali.
              </p>
            </div>
            <div>
              <div className="font-bold mb-2">vs. NYC.gov portals</div>
              <p className="text-muted-foreground">
                Portals are static and per-agency. We aggregate across food, health, legal, jobs,
                civic, events, and business — with map and voice.
              </p>
            </div>
          </div>
        </section>

        {/* REVENUE */}
        <section>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" /> Revenue architecture
          </h2>
          <p className="text-muted-foreground mb-6">
            Multi-line, mission-aligned. Every line already has UI/UX in the prototype.
          </p>
          <div className="rounded-2xl border border-border overflow-hidden">
            {revenueLines.map((r, i) => (
              <div
                key={r.name}
                className={`grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_2fr] gap-4 p-4 items-center ${i > 0 ? "border-t border-border" : ""} bg-card`}
              >
                <div className="font-bold">{r.name}</div>
                <div className="text-primary font-mono font-semibold text-sm">{r.price}</div>
                <div className="text-sm text-muted-foreground col-span-2 sm:col-span-1">
                  {r.notes}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STACK */}
        <section>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" /> Technical takeover
          </h2>
          <p className="text-muted-foreground mb-6">
            Standard, well-documented stack. Your team inherits it in a week.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {stack.map((s) => (
              <div key={s.k} className="flex gap-3 p-4 rounded-xl border border-border bg-card">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground w-24 shrink-0">
                  {s.k}
                </div>
                <div className="text-sm">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HANDOFF */}
        <section className="rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border p-8 sm:p-10">
          <h2 className="text-3xl font-bold mb-4">What you'd be acquiring</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <ul className="space-y-2">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Full source code +
                design system
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Working Supabase
                schema + RLS policies
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> 48 page routes,
                RBAC, moderation queues
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Brand, name,
                domain-ready copy in 5 languages
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Complete product
                spec + this pitch page
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Founder
                relationships in-borough (transferable)
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Category insight —
                years of research encoded
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Playbook to
                replicate in Brooklyn, Queens, etc.
              </li>
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="no-min-h inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-fill text-primary-fill-foreground font-bold text-sm shadow hover:opacity-90"
            >
              Talk to the founder <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="no-min-h inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-border font-semibold text-sm hover:bg-card"
            >
              Read the full story
            </Link>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground pb-8">
          This is a functional prototype. Content and data on this build are demonstrative.
          Everything shown is buildable, and most of it already is.
        </p>
      </div>
    </AppShell>
  );
}
