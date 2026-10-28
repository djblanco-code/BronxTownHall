import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import {
  Rocket,
  Film,
  Share2,
  BarChart3,
  ArrowLeft,
  Clock,
  Mail,
  Sparkles,
  WandSparkles,
  MessageSquareText,
  UsersRound,
  Megaphone,
  MonitorSmartphone,
  Handshake,
  HeartPulse,
  Landmark,
} from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "What's Coming — The Bronx App" },
      {
        name: "description",
        content:
          "Upcoming features for The Bronx App, from business tools and community picks to messaging, advertising, and kiosk access.",
      },
      { property: "og:title", content: "What's Coming to The Bronx App" },
      {
        property: "og:description",
        content: "See the roadmap for upcoming Bronx App features and pilot opportunities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoadmapPage,
});

const ROADMAP_ITEMS = [
  {
    id: "entrepreneur-hub",
    title: "Entrepreneur Hub",
    description:
      "A dedicated space for Bronx small-business owners: step-by-step roadmaps, Bronx-only grants, free advisors, and mentor matching.",
    status: "Coming Soon",
    icon: Rocket,
    partnerNote: "Pilot opportunity with a future borough or government partner",
  },
  {
    id: "business-video",
    title: "Business Video Upload",
    description:
      "Let business owners share 30-second stories (up to 75 MB) to introduce themselves, show their space, and build trust with neighbors.",
    status: "Coming Soon",
    icon: Film,
    partnerNote: "Premium feature — pilot opportunity with a future borough or government partner",
  },
  {
    id: "social-sync",
    title: "Social Sync",
    description:
      "Post events and updates to Facebook, Instagram, X (Twitter), and WhatsApp at once — so officials and business owners reach every channel.",
    status: "Coming Soon",
    icon: Share2,
    partnerNote: "Great for Community Boards & local orgs",
  },
  {
    id: "business-analytics",
    title: "Business Analytics Dashboard",
    description:
      "Real view/call/save counters for business owners, plus neighborhood demand insights to justify premium placement.",
    status: "Coming Soon",
    icon: BarChart3,
    partnerNote: "Will justify the Premium $19/mo tier",
  },
  {
    id: "ai-flyers-captions",
    title: "AI-Generated Flyers & Captions",
    description:
      "Generate a flyer and social caption for your event or promotion in seconds — no design skills needed.",
    status: "Coming Soon",
    icon: WandSparkles,
    partnerNote:
      "Premium feature — built for business owners who don't have time to learn design tools",
  },
  {
    id: "sms-business-messaging",
    title: "SMS Reminders & Business Messaging",
    description:
      "Text updates directly to residents who've opted into your category — sent under a recognizable 'The Bronx App' sender name, not a random number.",
    status: "Coming Soon",
    icon: MessageSquareText,
    partnerNote: "Premium feature — pilot opportunity with a future borough or government partner",
  },
  {
    id: "community-picks",
    title: "Community Picks",
    description:
      "Local creators and influencers get their own page to share their favorite Bronx spots and events — like a storefront for what they already love.",
    status: "Coming Soon",
    icon: UsersRound,
    partnerNote: "Built in partnership with, not in competition with, Bronx content creators",
  },
  {
    id: "advertising-sponsored-placement",
    title: "Advertising & Sponsored Placement",
    description:
      "Homepage banner space and sponsored listing cards for Bronx businesses and organizations who want extra visibility.",
    status: "Coming Soon",
    icon: Megaphone,
    partnerNote:
      "Additional revenue stream — pilot opportunity with a future borough or government partner",
  },
  {
    id: "linknyc-kiosk-integration",
    title: "LinkNYC Kiosk Integration",
    description:
      "Access The Bronx App directly from LinkNYC kiosks across the borough — no smartphone required.",
    status: "Coming Soon",
    icon: MonitorSmartphone,
    partnerNote:
      "Long-term infrastructure goal — pilot opportunity with a future borough or government partner",
  },
  {
    id: "peer-collaboration-board",
    title: "Peer Collaboration Board",
    description:
      "A space for Bronx business owners to find each other — share event costs, split venue space, or team up on a project.",
    status: "Coming Soon",
    icon: Handshake,
    partnerNote: "Still gathering feedback from business owners before building",
  },
  {
    id: "self-employed-insurance-guidance",
    title: "Self-Employed Insurance Guidance",
    description:
      "Straightforward, Bronx-specific guidance on where self-employed residents typically go for affordable health and life insurance.",
    status: "Coming Soon",
    icon: HeartPulse,
    partnerNote: "Educational content, not a searchable data field — still in planning",
  },
  {
    id: "business-grant-loan-alerts",
    title: "Grant & Loan Alerts for Businesses",
    description: "Get notified when a new Bronx-specific business grant or loan program opens.",
    status: "Coming Soon",
    icon: Landmark,
    partnerNote: "Will reuse the resident alerts system once that's built",
  },
];

function RoadmapPage() {
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
        <section className="rounded-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground p-6 sm:p-10 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center shrink-0">
              <Clock className="h-7 w-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80">
                Product Roadmap
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold mt-1">What's Coming to Hyperlocal</h1>
              <p className="mt-2 text-sm sm:text-base opacity-95 max-w-2xl">
                Features that are designed but not yet live. Each one is a candidate for a pilot
                with a future borough or government partner and local partners.
              </p>
            </div>
          </div>
        </section>

        {/* Roadmap grid */}
        <section aria-label="Upcoming features">
          <div className="grid md:grid-cols-2 gap-4">
            {ROADMAP_ITEMS.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border-2 border-border bg-card p-5 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                    <item.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-bold">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.partnerNote && (
                      <p className="mt-3 text-xs font-medium text-primary flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        {item.partnerNote}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Partner CTA */}
        <section className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Want to co-design a pilot?</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                These features are staged for partner input. If you're with a borough president's
                office, a Community Board, a council member's office, or a local business
                organization, we'd love to shape the first release together.
              </p>
            </div>
            <Link
              to="/contact"
              className="no-min-h inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow hover:opacity-90 shrink-0"
            >
              <Mail className="h-4 w-4" /> Contact us
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
