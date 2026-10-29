import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";

export const Route = createFileRoute("/partners")({
  staticData: { sitemap: false },
  component: PartnersPage,
  head: () => ({
    meta: [
      { title: "Partner & Investor Overview — Bronx Town Hall" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "Private overview of Bronx Town Hall for partners, acquirers, and investors.",
      },
      { property: "og:title", content: "Partner & Investor Overview — Bronx Town Hall" },
      {
        property: "og:description",
        content: "Private overview of Bronx Town Hall for partners, acquirers, and investors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PartnersPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl mb-2">For Partners, Acquirers &amp; Investors</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Private overview — shared by invitation. Not linked from the public site.
        </p>

        <section className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
          <p>
            This build is a <strong>functional prototype</strong>, not a live production product. It
            exists to demonstrate the full vision — every module you see is real code on a real
            stack, wired to a real backend. It is intentionally broader than a v1 launch so a buyer
            or operating partner can see the full surface area of the opportunity.
          </p>
          <ul className="list-disc ps-6 space-y-1">
            <li>
              <strong>What&apos;s built:</strong> 48 page routes, 15 resource categories, 200+
              seeded Bronx resources, 5-language i18n (EN · ES · FR · BN · AR), cloud-backed
              auth/RLS, civic data by ZIP (12 Community Boards + 8 precincts), Google Maps +
              transit, natural TTS, business hub, entrepreneur hub, events, alerts,
              admin/moderation.
            </li>
            <li>
              <strong>Market:</strong> 1.4M Bronx residents, ~55% speaking a language other than
              English at home; the same playbook ports to 8.3M New Yorkers and beyond.
            </li>
            <li>
              <strong>Business model:</strong> free forever for residents. Year 1 civic-tech grants
              + donations, Year 2 Premium business listings at $19/mo, Year 3 sponsored placement +
              municipal licensing. No surveillance ads, no selling user data.
            </li>
            <li>
              <strong>What&apos;s stubbed:</strong> real-time 311/DOT feed keys, SendGrid/domain
              email, native iOS/Android wrappers, SMS fallback, and paid Premium billing (Stripe
              scaffolded).
            </li>
            <li>
              <strong>What a buyer inherits:</strong> full source, design system, brand + copy in 5
              languages, Bronx-based founder relationships, and a playbook that ports to other
              boroughs and cities.
            </li>
            <li>
              <strong>The ask:</strong> $250K seed + borough partnership + data access — 12 months
              of build, 2 hires, and verification ops.
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              to="/pitch"
              className="no-min-h px-4 py-2 rounded-full bg-primary-fill text-primary-fill-foreground text-sm font-semibold"
            >
              See the Investor Overview
            </Link>
            <Link
              to="/deck"
              className="no-min-h px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-card"
            >
              Pitch deck
            </Link>
            <Link
              to="/one-pager"
              className="no-min-h px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-card"
            >
              One-pager
            </Link>
            <Link
              to="/data-quality"
              className="no-min-h px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-card"
            >
              Data quality
            </Link>
            <Link
              to="/roadmap"
              className="no-min-h px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-card"
            >
              Roadmap
            </Link>
            <Link
              to="/"
              search={{ tour: "1" }}
              className="no-min-h px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-card"
            >
              Start guided tour
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
