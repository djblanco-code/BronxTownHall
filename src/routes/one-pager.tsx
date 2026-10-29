import { createFileRoute } from "@tanstack/react-router";
import { Printer, Share2, Presentation, Mail } from "lucide-react";

export const Route = createFileRoute("/one-pager")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Bronx Town Hall — One-Pager" },
      {
        name: "description",
        content:
          "One-page overview of Bronx Town Hall: problem, solution, differentiator, market, business model, traction, team, and ask.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnePager,
});

const C = { primary: "#1a5276", secondary: "#1e8449", accent: "#d35400" };

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid">
      <h2
        className="mb-2 text-sm font-black uppercase tracking-widest"
        style={{ color, fontFamily: "'Archivo Black'" }}
      >
        {title}
      </h2>
      <div className="text-sm text-slate-800 leading-relaxed">{children}</div>
    </section>
  );
}

function OnePager() {
  const share = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) await navigator.share({ title: "Bronx Town Hall — One-Pager", url });
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }
    } catch {
      /* noop */
    }
  };
  const print = () => window.print();

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      {/* Toolbar (hidden on print) */}
      <div className="mx-auto mb-4 flex max-w-[8.5in] items-center justify-between px-4 print:hidden">
        <a href="/" className="text-sm text-slate-600 hover:underline">
          ← Home
        </a>
        <div className="flex gap-2">
          <a
            href="/deck"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            <Presentation className="h-4 w-4" /> Open Deck
          </a>
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            onClick={print}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white"
            style={{ background: C.primary }}
          >
            <Printer className="h-4 w-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Page — sized for US Letter */}
      <div className="mx-auto max-w-[8.5in] bg-white shadow-lg print:shadow-none">
        {/* Header */}
        <header
          className="flex items-start justify-between p-8"
          style={{
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
            color: "white",
          }}
        >
          <div>
            <div className="flex items-center gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-lg bg-white text-2xl font-black"
                style={{ color: C.primary, fontFamily: "'Archivo Black'" }}
                aria-hidden
              >
                B
              </div>
              <div>
                <div
                  className="text-2xl font-black leading-tight"
                  style={{ fontFamily: "'Archivo Black'" }}
                >
                  Bronx Town Hall
                </div>
                <div className="text-sm opacity-90">Your Bronx. Your Resources. Your Voice.</div>
              </div>
            </div>
          </div>
          <div className="text-right text-xs opacity-90">
            <div>
              Founder: <b>Fatmata</b>
            </div>
            <div>bronx.app · founder@thebronx.app</div>
            <div className="mt-1">MVP · Prototype · 2026</div>
          </div>
        </header>

        {/* Body — 2 columns */}
        <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
          <Section title="The Problem" color={C.accent}>
            Information about food pantries, health clinics, jobs, and community events is scattered
            across flyers, word-of-mouth, and English-only websites. Bronx parents travel to closed
            pantries. Seniors miss deadlines. Immigrants get left out.{" "}
            <b>The Bronx has the resources — no one has a map that works.</b>
          </Section>

          <Section title="The Solution" color={C.secondary}>
            A free, multilingual mobile app that aggregates every Bronx resource into one place:
            real-time food pantries (Kosher, Halal, Mobile), health with insurance/Medicaid filters,
            legal aid, housing, jobs, youth, civic engagement, traffic alerts, and community events
            — with natural voice, Simplified Mode, and transit directions.
          </Section>

          <Section title="Differentiator" color={C.primary}>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                <b>Hyper-local:</b> the church-basement pantry Google can't find.
              </li>
              <li>
                <b>Community-submitted events</b> moderated for trust.
              </li>
              <li>
                <b>5 languages + natural TTS + Simplified Mode</b> for seniors & immigrants.
              </li>
              <li>
                <b>Civic layer:</b> Community Boards + elected officials by ZIP.
              </li>
              <li>
                <b>Trust:</b> Verified date on every listing. One-tap Report Broken.
              </li>
            </ul>
          </Section>

          <Section title="Market" color={C.primary}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-lg font-black" style={{ color: C.primary }}>
                  1.4M
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-600">
                  Bronx residents
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-lg font-black" style={{ color: C.accent }}>
                  55%
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-600">
                  Non-English at home
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <div className="text-lg font-black" style={{ color: C.secondary }}>
                  8.3M
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-600">
                  NYC expansion
                </div>
              </div>
            </div>
            <p className="mt-2">
              Prove it in the Bronx. Then Brooklyn, Queens, Newark, Detroit — every borough with a
              smartphone and a safety-net gap.
            </p>
          </Section>

          <Section title="Business Model" color={C.secondary}>
            <b>Year 1:</b> civic-tech grants + donations. <b>Year 2:</b> premium business listings
            ($19/mo — verified, video, storefront, analytics). <b>Year 3:</b> sponsored placements +
            municipal licensing to other boroughs. Free forever for residents. No surveillance ads.
            No selling user data.
          </Section>

          <Section title="Traction" color={C.accent}>
            MVP prototype live: 48 product routes, 15 categories, 5 languages, 200+ seeded
            resources, RBAC dashboards, Supabase backend, natural TTS, interactive map with transit,
            and community moderation. User interviews with Bronx parents complete. Ready to launch
            Phase 1 (Food, Housing, Health, Legal).
          </Section>

          <Section title="Competition" color={C.primary}>
            Google & Yelp don't know your block. Nextdoor is chat, not resources. FindHelp / One
            Degree are national and English-first. NYC.gov isn't hyper-local.{" "}
            <b>
              Bronx Town Hall wins on hyper-local depth, multilingual reach, and community-driven
              data.
            </b>
          </Section>

          <Section title="Team" color={C.secondary}>
            <b>Fatmata</b> — Founder, product, and research. Bronx native. Grew up watching
            neighbors struggle to find basic resources. <br />
            <b>Hiring:</b> Community Manager (bilingual, Bronx-native), Full-stack Engineer,
            Verification Ops. Advisors from civic tech, non-profits, borough government.
          </Section>
        </div>

        {/* The Ask footer */}
        <footer className="grid grid-cols-1 gap-4 p-8 pt-2 md:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl p-5 text-white" style={{ background: C.primary }}>
            <div className="text-xs uppercase tracking-widest opacity-80">The Ask</div>
            <div className="mt-1 text-xl font-black" style={{ fontFamily: "'Archivo Black'" }}>
              $250K seed + borough partnership + data access.
            </div>
            <div className="mt-2 text-sm opacity-90">
              12 months of build, 2 hires, verification ops, launch through community boards,
              libraries, and schools.
            </div>
          </div>
          <div className="rounded-xl border-2 p-5" style={{ borderColor: C.accent }}>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: C.accent }}>
              <Mail className="h-4 w-4" /> Next step
            </div>
            <div className="mt-2 text-sm text-slate-700">
              30-minute demo call. Live walkthrough of the working prototype at{" "}
              <b>bronx.app/deck</b>.
            </div>
            <div className="mt-3 text-sm">
              <b>founder@thebronx.app</b>
            </div>
          </div>
        </footer>

        <div className="border-t px-8 py-3 text-[10px] text-slate-500">
          © 2026 Bronx Town Hall · Prototype for partnership & investment discussions · Confidential
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: Letter; margin: 0.3in; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
