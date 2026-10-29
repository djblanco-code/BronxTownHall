import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Share2,
  BarChart3,
  AlertTriangle,
  Sparkles,
  Clock,
  Users,
  Layers,
  TrendingUp,
  Trophy,
  Rocket,
  DollarSign,
  HeartHandshake,
  Target,
  Home,
} from "lucide-react";
import {
  startSession,
  recordSlide,
  endSession,
  recordShare,
  getSummary,
} from "@/lib/deck-analytics";

export const Route = createFileRoute("/deck")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Bronx Town Hall — Investor Pitch Deck" },
      {
        name: "description",
        content:
          "12-slide interactive pitch deck for Bronx Town Hall. Connecting 1.4M Bronx neighbors to free resources.",
      },
      { name: "robots", content: "noindex" },
    ],
    // The deck keeps its own display face; the app's fonts load in __root.
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap",
      },
    ],
  }),
  component: DeckPage,
});

const BRAND = {
  primary: "#1a5276",
  secondary: "#1e8449",
  accent: "#d35400",
};

type Slide = {
  id: number;
  eyebrow: string;
  title: string;
  render: () => React.ReactNode;
};

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="grid h-8 w-8 place-items-center rounded-md font-black text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})` }}
        aria-hidden
      >
        B
      </div>
      <span
        className="font-bold tracking-tight"
        style={{ fontFamily: "'Archivo Black', Inter, sans-serif" }}
      >
        Bronx Town Hall
      </span>
    </div>
  );
}

function SlideFrame({
  children,
  bg = "white",
}: {
  children: React.ReactNode;
  bg?: "white" | "dark" | "grad";
}) {
  const style =
    bg === "dark"
      ? { background: "#0b1220", color: "white" }
      : bg === "grad"
        ? {
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, #0b1220 100%)`,
            color: "white",
          }
        : { background: "white", color: "#0b1220" };
  return (
    <div className="relative flex h-full w-full flex-col p-8 md:p-14" style={style}>
      <div className="flex items-center justify-between text-xs opacity-70">
        <Logo />
        <span>bronx.app · Confidential</span>
      </div>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div
        className="text-4xl font-black"
        style={{ color: color || BRAND.accent, fontFamily: "'Archivo Black'" }}
      >
        {value}
      </div>
      <div className="mt-1 text-sm opacity-80">{label}</div>
    </div>
  );
}

const SLIDES: Slide[] = [
  {
    id: 1,
    eyebrow: "01 · Title",
    title: "Bronx Town Hall",
    render: () => (
      <SlideFrame bg="grad">
        <div className="max-w-3xl">
          <div className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest">
            Pitch Deck · 2026
          </div>
          <h1
            className="text-5xl font-black leading-tight md:text-7xl"
            style={{ fontFamily: "'Archivo Black'" }}
          >
            Your Bronx.
            <br />
            Your Resources.
            <br />
            Your Voice.
          </h1>
          <p className="mt-6 max-w-xl text-lg opacity-85">
            A free, multilingual mobile app connecting 1.4 million Bronx neighbors to food, health,
            legal aid, jobs, and civic power — in one place.
          </p>
          <div className="mt-10 flex items-center gap-4 text-sm opacity-85">
            <span>
              Founder: <b>Fatmata</b>
            </span>
            <span aria-hidden>·</span>
            <span>Bronx, NY</span>
          </div>
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 2,
    eyebrow: "02 · The Problem",
    title: "Information is scattered. People suffer.",
    render: () => (
      <SlideFrame>
        <h2
          className="text-3xl font-black md:text-5xl"
          style={{ fontFamily: "'Archivo Black'", color: BRAND.primary }}
        >
          Bronx information is <span style={{ color: BRAND.accent }}>broken</span>.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: AlertTriangle,
              t: "Parents travel to closed pantries",
              d: "Hours wasted with hungry kids in tow.",
            },
            {
              icon: Clock,
              t: "Seniors miss deadlines",
              d: "Flyers on lampposts. English-only websites.",
            },
            {
              icon: Users,
              t: "Immigrants get left out",
              d: "40% of Bronx residents speak Spanish; more speak Bengali, French, Arabic.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border-2 p-5" style={{ borderColor: "#e5e7eb" }}>
              <Icon className="mb-3 h-8 w-8" style={{ color: BRAND.accent }} />
              <div className="font-bold text-lg">{t}</div>
              <div className="mt-1 text-sm text-slate-600">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-lg text-slate-700">
          <b>The Bronx has the resources.</b> Nobody has a map that works.
        </p>
      </SlideFrame>
    ),
  },
  {
    id: 3,
    eyebrow: "03 · The Solution",
    title: "One app. Every resource. Every language.",
    render: () => (
      <SlideFrame bg="dark">
        <h2 className="text-4xl font-black md:text-6xl" style={{ fontFamily: "'Archivo Black'" }}>
          One app for the <span style={{ color: BRAND.accent }}>whole Bronx</span>.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            "Real-time food pantries — Kosher, Halal, Mobile",
            "Health clinics with insurance & Medicaid filters",
            "Legal aid, housing, jobs, youth programs",
            "Community boards + elected officials by ZIP",
            "Traffic + street closures + community alerts",
            "5 languages · Natural voice · Simplified Mode",
          ].map((line) => (
            <div key={line} className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0" style={{ color: BRAND.accent }} />
              <span>{line}</span>
            </div>
          ))}
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 4,
    eyebrow: "04 · Why Now",
    title: "Timing is right.",
    render: () => (
      <SlideFrame>
        <h2
          className="text-4xl font-black md:text-5xl"
          style={{ fontFamily: "'Archivo Black'", color: BRAND.primary }}
        >
          Why now?
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              t: "Post-pandemic safety-net stress",
              d: "SNAP cuts, rent burden, food insecurity at record highs in the Bronx.",
            },
            {
              t: "Smartphones are universal",
              d: "94% of Bronx adults have a smartphone. Broadband is the ID card of civic life.",
            },
            {
              t: "AI-powered translation & voice",
              d: "For the first time, one small team can serve 5+ languages naturally.",
            },
            {
              t: "Civic tech vacuum",
              d: "NYC.gov isn't hyper-local. Google can't find the church basement pantry.",
            },
          ].map(({ t, d }) => (
            <div key={t}>
              <div className="text-lg font-bold" style={{ color: BRAND.secondary }}>
                {t}
              </div>
              <div className="mt-1 text-slate-700">{d}</div>
            </div>
          ))}
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 5,
    eyebrow: "05 · Market",
    title: "1.4M Bronx residents. Blueprint for every borough.",
    render: () => (
      <SlideFrame bg="grad">
        <h2 className="text-4xl font-black md:text-6xl" style={{ fontFamily: "'Archivo Black'" }}>
          A borough is a <span style={{ color: BRAND.accent }}>city</span>.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat value="1.4M" label="Bronx residents" color="#fff" />
          <Stat value="55%" label="Speak a language other than English at home" />
          <Stat value="27%" label="Below the poverty line" />
          <Stat value="8.3M" label="NYC total addressable (Phase 2)" color="#fff" />
        </div>
        <p className="mt-8 max-w-3xl opacity-90">
          Prove it in the Bronx. Then Brooklyn, Queens, Newark, Detroit — every underserved borough
          with a smartphone and a safety-net gap.
        </p>
      </SlideFrame>
    ),
  },
  {
    id: 6,
    eyebrow: "06 · Product",
    title: "Built. Working. Live.",
    render: () => (
      <SlideFrame>
        <h2
          className="text-3xl font-black md:text-5xl"
          style={{ fontFamily: "'Archivo Black'", color: BRAND.primary }}
        >
          The product exists.
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Open Now Near You",
              d: "Live cards with Call, native-map Directions, distance, and Verified date pill.",
              i: Target,
            },
            {
              t: "Your Voice in the Bronx",
              d: "Community Boards + officials by ZIP. Pre-filled email templates.",
              i: HeartHandshake,
            },
            {
              t: "Business & Entrepreneur Hub",
              d: "Claim listings, upload storefront + video, grant directory, roadmap.",
              i: Rocket,
            },
            {
              t: "Interactive Map",
              d: "Clustered resource pins, native-map directions, and spreadsheet view.",
              i: Layers,
            },
            {
              t: "Simplified Mode + TTS",
              d: "Larger text, tap targets, natural voice for seniors and low-literacy users.",
              i: Users,
            },
            {
              t: "Trust Layer",
              d: "Verified pills, Report Broken button, public data-quality page.",
              i: Trophy,
            },
          ].map(({ t, d, i: Icon }) => (
            <div key={t} className="rounded-2xl border-2 border-slate-200 p-5">
              <Icon className="mb-2 h-6 w-6" style={{ color: BRAND.secondary }} />
              <div className="font-bold">{t}</div>
              <div className="mt-1 text-sm text-slate-600">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">
          48 routes · 5 languages · RBAC · Supabase backend · TanStack Start.
        </p>
      </SlideFrame>
    ),
  },
  {
    id: 7,
    eyebrow: "07 · Traction",
    title: "MVP complete. User research done.",
    render: () => (
      <SlideFrame bg="dark">
        <h2 className="text-4xl font-black md:text-6xl" style={{ fontFamily: "'Archivo Black'" }}>
          What's built so far.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat value="48" label="Product routes shipped" />
          <Stat value="15" label="Resource categories" />
          <Stat value="5" label="Languages supported" />
          <Stat value="200+" label="Seeded Bronx resources" />
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm uppercase tracking-widest opacity-70">Voice of the neighbor</div>
          <blockquote className="mt-2 text-xl italic">
            "I would have used this last winter when I was walking to a pantry that was closed. My
            kids were with me."
          </blockquote>
          <div className="mt-2 text-sm opacity-70">— User interview, Fordham parent</div>
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 8,
    eyebrow: "08 · Competition",
    title: "We win where they can't reach.",
    render: () => (
      <SlideFrame>
        <h2
          className="text-4xl font-black md:text-5xl"
          style={{ fontFamily: "'Archivo Black'", color: BRAND.primary }}
        >
          Competitive landscape.
        </h2>
        <div className="mt-8 overflow-hidden rounded-2xl border-2 border-slate-200">
          <table className="w-full text-left text-sm">
            <thead style={{ background: BRAND.primary, color: "white" }}>
              <tr>
                <th className="p-3">Player</th>
                <th className="p-3">Hyper-local</th>
                <th className="p-3">Multilingual</th>
                <th className="p-3">Civic layer</th>
                <th className="p-3">Community data</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Google / Yelp", "✗", "Partial", "✗", "✗"],
                ["Nextdoor", "Partial", "✗", "✗", "Chat only"],
                ["One Degree / FindHelp", "Partial", "Partial", "✗", "✗"],
                ["NYC.gov", "✗", "Partial", "Partial", "✗"],
                [
                  "Bronx Town Hall",
                  "✓",
                  "✓ 5 langs",
                  "✓ Boards + officials",
                  "✓ Verified + reported",
                ],
              ].map((row, i) => (
                <tr key={i} className={i === 4 ? "bg-emerald-50 font-bold" : "border-t"}>
                  {row.map((cell, j) => (
                    <td key={j} className="p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 9,
    eyebrow: "09 · Go-to-Market",
    title: "Trusted channels. Zero paid acquisition.",
    render: () => (
      <SlideFrame>
        <h2
          className="text-4xl font-black md:text-5xl"
          style={{ fontFamily: "'Archivo Black'", color: BRAND.primary }}
        >
          How we launch.
        </h2>
        <ol className="mt-8 space-y-4">
          {[
            [
              "Partner with Borough President & Community Boards",
              "Officially endorsed distribution to 12 districts.",
            ],
            [
              "Deploy through libraries, schools, and churches",
              "Places Bronx neighbors already trust.",
            ],
            ["Non-profit + civic org co-branding", "Every partner promotes to their own list."],
            [
              "Bilingual on-the-ground ambassadors",
              "Fordham, Grand Concourse, Hunts Point tabling events.",
            ],
            ["Press: local news, Norwood News, Bronx Times", "Story-first, not ad-first."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-black text-white"
                style={{ background: BRAND.accent }}
              >
                {i + 1}
              </div>
              <div>
                <div className="text-lg font-bold">{t}</div>
                <div className="text-slate-600">{d}</div>
              </div>
            </li>
          ))}
        </ol>
      </SlideFrame>
    ),
  },
  {
    id: 10,
    eyebrow: "10 · Business Model",
    title: "Free forever for residents.",
    render: () => (
      <SlideFrame bg="dark">
        <h2 className="text-4xl font-black md:text-6xl" style={{ fontFamily: "'Archivo Black'" }}>
          How it makes money.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              y: "Year 1",
              t: "Grants + Donations",
              d: "Civic tech grants, borough discretionary funds, individual donors.",
              color: BRAND.secondary,
            },
            {
              y: "Year 2",
              t: "Premium Business Listings",
              d: "$19/mo. Verified badge, video, storefront, analytics.",
              color: BRAND.accent,
            },
            {
              y: "Year 3",
              t: "Sponsored & Municipal Licensing",
              d: "Ethical sponsored placements. License platform to other boroughs.",
              color: "#8e44ad",
            },
          ].map(({ y, t, d, color }) => (
            <div key={y} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-widest opacity-70">{y}</div>
              <div
                className="mt-1 text-2xl font-black"
                style={{ color, fontFamily: "'Archivo Black'" }}
              >
                {t}
              </div>
              <div className="mt-2 text-sm opacity-85">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm opacity-70">
          Never charge residents. Never sell user data. Never surveillance-advertise.
        </p>
      </SlideFrame>
    ),
  },
  {
    id: 11,
    eyebrow: "11 · Team",
    title: "Built by the Bronx, for the Bronx.",
    render: () => (
      <SlideFrame>
        <h2
          className="text-4xl font-black md:text-5xl"
          style={{ fontFamily: "'Archivo Black'", color: BRAND.primary }}
        >
          Team.
        </h2>
        <div className="mt-10 flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div
            className="grid h-32 w-32 place-items-center rounded-full text-5xl font-black text-white"
            style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})` }}
          >
            F
          </div>
          <div className="max-w-xl">
            <div className="text-2xl font-black" style={{ fontFamily: "'Archivo Black'" }}>
              Fatmata
            </div>
            <div className="text-slate-600">Founder · Product · Bronx native</div>
            <p className="mt-3 text-slate-700">
              Grew up in the Bronx watching neighbors struggle to find basic resources. Built this
              to fix that. Product, research, and design lead.
            </p>
          </div>
        </div>
        <div className="mt-10 rounded-2xl border-2 border-dashed border-slate-300 p-5 text-slate-600">
          <b className="text-slate-800">Hiring roadmap:</b> Community Manager (Bronx-native,
          bilingual), Full-stack Engineer, Data / Verification Ops. Advisors from civic tech,
          non-profits, and borough government.
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 12,
    eyebrow: "12 · The Ask",
    title: "What we need.",
    render: () => (
      <SlideFrame bg="grad">
        <h2 className="text-5xl font-black md:text-7xl" style={{ fontFamily: "'Archivo Black'" }}>
          The ask.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: DollarSign,
              t: "$250K seed",
              d: "12 months of build + 2 hires + verification ops.",
            },
            {
              icon: HeartHandshake,
              t: "Borough partnership",
              d: "Endorsement + distribution through community boards and libraries.",
            },
            {
              icon: TrendingUp,
              t: "Data + advisors",
              d: "Access to 311, DOT, HPD feeds. Advisors from civic tech + non-profits.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Icon className="mb-2 h-8 w-8" style={{ color: BRAND.accent }} />
              <div className="text-xl font-black" style={{ fontFamily: "'Archivo Black'" }}>
                {t}
              </div>
              <div className="mt-1 opacity-85">{d}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-3 text-lg">
          <span className="opacity-80">Let's build a Bronx that works for everyone.</span>
        </div>
        <div className="mt-2 text-sm opacity-70">Fatmata · founder@thebronx.app · bronx.app</div>
      </SlideFrame>
    ),
  },
];

function DeckPage() {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const enterRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // start session
  useEffect(() => {
    const s = startSession();
    setSessionId(s.id);
    enterRef.current = Date.now();
    const onUnload = () => endSession(s.id, false);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      endSession(s.id, false);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, []);

  // record dwell on slide change
  useEffect(() => {
    if (!sessionId) return;
    return () => {
      const now = Date.now();
      recordSlide(sessionId, i, now - enterRef.current);
      enterRef.current = now;
    };
  }, [i, sessionId]);

  const total = SLIDES.length;

  const go = (next: number) => {
    const n = Math.max(0, Math.min(total - 1, next));
    setI(n);
    if (sessionId && n === total - 1) endSession(sessionId, true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(i + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(i - 1);
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
      } else if (e.key === "f" || e.key === "F") {
        toggleFull();
      } else if (/^[0-9]$/.test(e.key)) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= total) go(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const toggleFull = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setFull(true);
      } else {
        await document.exitFullscreen();
        setFull(false);
      }
    } catch {
      /* noop */
    }
  };
  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Bronx Town Hall — Pitch Deck", url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      }
      if (sessionId) recordShare(sessionId);
    } catch {
      /* noop */
    }
  };

  // touch swipe
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
    touch.current = null;
  };

  const slide = SLIDES[i];
  const progress = ((i + 1) / total) * 100;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-950"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-slate-950/85 px-3 py-2 text-white backdrop-blur">
        <div className="flex items-center gap-2 text-xs opacity-80">
          <a href="/" aria-label="Home" className="rounded p-1.5 hover:bg-white/10">
            <Home className="h-4 w-4" />
          </a>
          <span className="hidden sm:inline">{slide.eyebrow}</span>
          <span className="tabular-nums">
            {i + 1} / {total}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAnalytics((v) => !v)}
            className="rounded p-1.5 hover:bg-white/10"
            aria-label="Analytics"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <button onClick={share} className="rounded p-1.5 hover:bg-white/10" aria-label="Share">
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFull}
            className="rounded p-1.5 hover:bg-white/10"
            aria-label={full ? "Exit fullscreen" : "Fullscreen"}
          >
            {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="h-1 w-full bg-white/10">
        <div
          className="h-full transition-all"
          style={{ width: `${progress}%`, background: BRAND.accent }}
        />
      </div>

      {/* Slide */}
      <div className="relative mx-auto aspect-[16/9] w-full max-w-[1400px] overflow-hidden shadow-2xl md:mt-4 md:rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {slide.render()}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <button
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60 disabled:opacity-30"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => go(i + 1)}
          disabled={i === total - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur hover:bg-black/60 disabled:opacity-30"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="mx-auto flex max-w-[1400px] gap-1.5 overflow-x-auto px-3 py-4">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => go(idx)}
            className={`shrink-0 rounded-md border px-3 py-1.5 text-xs transition ${idx === i ? "border-white bg-white text-slate-900" : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10"}`}
            aria-current={idx === i ? "true" : undefined}
          >
            {s.id}. {s.title.length > 22 ? s.title.slice(0, 22) + "…" : s.title}
          </button>
        ))}
      </div>

      {showAnalytics && <AnalyticsPanel onClose={() => setShowAnalytics(false)} />}

      <div className="pb-8 text-center text-xs text-white/50">
        Use ← → arrows · Space · Number keys · F fullscreen · Esc exit
      </div>
    </div>
  );
}

function AnalyticsPanel({ onClose }: { onClose: () => void }) {
  const summary = useMemo(() => getSummary(), []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3
            className="text-xl font-black"
            style={{ fontFamily: "'Archivo Black'", color: BRAND.primary }}
          >
            Deck Analytics
          </h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="text-3xl font-black">{summary.total}</div>
            <div className="text-xs text-slate-600">Sessions</div>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="text-3xl font-black">{summary.completed}</div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <div className="text-3xl font-black">{summary.avgTimeSec}s</div>
            <div className="text-xs text-slate-600">Avg time</div>
          </div>
        </div>
        <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-2">Session</th>
                <th className="p-2">Started</th>
                <th className="p-2">Complete</th>
                <th className="p-2">Shares</th>
              </tr>
            </thead>
            <tbody>
              {summary.sessions
                .slice()
                .reverse()
                .slice(0, 20)
                .map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2 font-mono text-xs">{s.id}</td>
                    <td className="p-2 text-xs">{new Date(s.startedAt).toLocaleString()}</td>
                    <td className="p-2">{s.completed ? "✓" : "—"}</td>
                    <td className="p-2">{s.shares}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Prototype analytics stored locally in this browser. Wire to Supabase or a real analytics
          provider for production tracking.
        </p>
      </div>
    </div>
  );
}
