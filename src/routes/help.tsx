import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { CATEGORIES, RESOURCES, type Resource } from "@/lib/data";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";
import { ListenButton } from "@/components/ListenButton";
import { FavoriteStar } from "@/components/FavoriteStar";
import { AttributeBadges } from "@/components/AttributeBadges";
import {
  parseNeedKeywords,
  buildResourcePack,
  buildPackScript,
  buildPackSms,
  buildSummary,
  EXAMPLE_PROMPTS,
  type NeedParse,
} from "@/lib/need-intake";
import { trackSearchPerformed, trackSearchClicked, trackSearchAiUsed } from "@/lib/track-search";
import { trackResourceFound } from "@/lib/track-journey";
import { ArrowLeft, Sparkles, Send, Share2, Phone, AlertTriangle, Loader2 } from "lucide-react";
import { isNonSpecificAddress, LOCATION_VARIES_LABEL } from "@/lib/address";
import { VerifiedPill } from "@/components/VerifiedPill";
import { useResourceMeta } from "@/lib/resource-meta";
import { DirectionsLink } from "@/components/DirectionsLink";

type SearchSchema = { q?: string };

export const Route = createFileRoute("/help")({
  staticData: { sitemap: true },
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "Tell us what you need — The Bronx App" },
      {
        name: "description",
        content:
          "Describe your situation in your own words and get 5 Bronx resources, read aloud in your language, ready to share by text.",
      },
      { property: "og:title", content: "Tell us what you need — The Bronx App" },
      {
        property: "og:description",
        content: "One sentence. Five real Bronx resources. Spoken in your language.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): SearchSchema => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
});

function HelpPage() {
  const { q } = useSearch({ from: "/help" });
  const nav = useNavigate();
  const { lang, t } = useI18n();
  const resMeta = useResourceMeta();

  const [input, setInput] = useState(q ?? "");
  const [request, setRequest] = useState(q ?? "");
  const [parse, setParse] = useState<NeedParse | null>(q ? parseNeedKeywords(q) : null);
  const [refining, setRefining] = useState(false);
  const reqRef = useRef(0);

  const pack = useMemo<Resource[]>(() => (parse ? buildResourcePack(parse, 5) : []), [parse]);
  const script = useMemo(
    () => (pack.length ? buildPackScript(pack, lang, parse?.summary) : ""),
    [pack, lang, parse],
  );

  function run(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setRequest(clean);
    const fast = parseNeedKeywords(clean);
    setParse(fast);
    nav({ to: "/help", search: { q: clean }, replace: true });
    trackSearchPerformed({ query: clean, resultCount: 5, responseTimeMs: 0, mode: "ai" });
    void refine(clean, fast);
  }

  // Phase 2: ask Gemini for a better read; silently keep keyword parse on failure.
  async function refine(text: string, fallback: NeedParse) {
    const id = ++reqRef.current;
    setRefining(true);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (id !== reqRef.current || !data?.primaryNeed) return;
      const valid = (c: unknown) => CATEGORIES.some((x) => x.id === c);
      if (!valid(data.primaryNeed)) return;
      const related = Array.isArray(data.relatedNeeds)
        ? data.relatedNeeds.filter(valid).slice(0, 4)
        : [];
      setParse({
        primaryNeed: data.primaryNeed,
        relatedNeeds: related,
        signals: Array.isArray(data.signals) ? data.signals.slice(0, 5) : fallback.signals,
        urgent: Boolean(data.urgent) || fallback.urgent,
        summary:
          typeof data.summary === "string" && data.summary
            ? data.summary
            : buildSummary(data.primaryNeed, related, fallback.signals, Boolean(data.urgent)),
        source: "ai",
      });
      trackSearchAiUsed({ query: text, responseTimeMs: 0 });
    } catch {
      /* keyword parse stands */
    } finally {
      if (id === reqRef.current) setRefining(false);
    }
  }

  // Deep-linked or shared URL: parse immediately and refine with AI.
  useEffect(() => {
    if (!q) return;
    setInput(q);
    setRequest(q);
    const fast = parseNeedKeywords(q);
    setParse(fast);
    void refine(q, fast);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [q]);

  const smsText = pack.length ? buildPackSms(pack, lang, request) : "";
  const sharePack = async () => {
    if (!smsText) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Bronx help pack", text: smsText });
        return;
      } catch {
        /* fall through */
      }
    }
    window.location.href = `sms:?&body=${encodeURIComponent(smsText)}`;
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => nav({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Tell us what's going on
        </h1>
        <p className="mt-1 text-muted-foreground">
          Write or say one sentence in your own words. We'll pull together five places that can help
          — and read them out loud.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
          className="mt-4 rounded-2xl border-2 border-border bg-card p-3 shadow-sm focus-within:border-primary"
        >
          <label htmlFor="need-input" className="sr-only">
            Describe what you need help with
          </label>
          <textarea
            id="need-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                run(input);
              }
            }}
            rows={3}
            placeholder="I need help with… (example: “I got laid off and I have two kids”)"
            className="w-full resize-none bg-transparent px-2 py-2 text-base focus:outline-none"
          />
          <div className="flex items-center justify-between gap-2 pt-1">
            <VoiceSearchButton
              onResult={(text) => {
                setInput(text);
                run(text);
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="no-min-h inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm disabled:opacity-40 hover:opacity-90 transition"
            >
              <Send className="h-4 w-4" /> Get my help pack
            </button>
          </div>
        </form>

        {!parse && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              Not sure how to say it? Try:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setInput(p);
                    run(p);
                  }}
                  className="no-min-h rounded-full border border-border bg-card px-3 py-2 text-sm hover:border-primary hover:bg-primary/5 transition"
                >
                  “{p}”
                </button>
              ))}
            </div>
          </div>
        )}

        {parse && (
          <>
            {parse.urgent && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                <div>
                  <p className="font-bold text-destructive">
                    If you're in danger or crisis right now
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Call 911 for emergencies, or 988 for free 24/7 crisis support.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <a
                      href="tel:911"
                      className="no-min-h rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground"
                    >
                      Call 911
                    </a>
                    <a
                      href="tel:988"
                      className="no-min-h rounded-full border border-destructive px-4 py-2 text-sm font-bold text-destructive"
                    >
                      Call 988
                    </a>
                    <Link
                      to="/emergency"
                      className="no-min-h rounded-full border border-border px-4 py-2 text-sm font-semibold"
                    >
                      All hotlines
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{parse.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {[parse.primaryNeed, ...parse.relatedNeeds].map((c) => {
                      const cat = CATEGORIES.find((x) => x.id === c);
                      return (
                        <Link
                          key={c}
                          to="/category/$cat"
                          params={{ cat: c }}
                          className="no-min-h rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold hover:border-primary"
                        >
                          {cat?.emoji} {cat ? t(cat.labelKey) : c}
                        </Link>
                      );
                    })}
                    {refining && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> refining…
                      </span>
                    )}
                  </div>
                  {parse.signals.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Heard: {parse.signals.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ListenButton
                  text={script}
                  title="Your help pack"
                  style="empathetic"
                  variant="chip"
                  label="Listen to my help pack"
                />
                <button
                  onClick={sharePack}
                  className="no-min-h inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-primary"
                >
                  <Share2 className="h-4 w-4" /> Send by text
                </button>
              </div>
            </div>

            <h2 className="mt-6 mb-3 text-lg font-bold">Your 5 resources</h2>
            <ol className="space-y-3">
              {pack.map((r, i) => {
                const cat = CATEGORIES.find((c) => c.id === r.category);
                return (
                  <li key={r.id} className="flex items-stretch gap-2">
                    <div className="flex-1 rounded-2xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition">
                      <Link
                        to="/resource/$id"
                        params={{ id: r.id }}
                        onClick={() => {
                          trackSearchClicked({ query: request, resourceId: r.id, position: i + 1 });
                          trackResourceFound({
                            query: request,
                            resourceId: r.id,
                            category: r.category,
                          });
                        }}
                        className="no-min-h block"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="h-11 w-11 shrink-0 grid place-items-center rounded-xl text-2xl"
                            style={{ backgroundColor: cat?.color }}
                          >
                            {cat?.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold truncate">
                              {i + 1}. {r.name[lang]}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate">
                              {cat ? t(cat.labelKey) : r.category} ·{" "}
                              {isNonSpecificAddress(r.address)
                                ? LOCATION_VARIES_LABEL
                                : `${r.distance} ${t("miles")}`}{" "}
                              · {r.openNow ? "Open now" : r.hours[lang]}
                            </span>
                          </span>
                        </span>
                        <span className="mt-2 block text-sm text-muted-foreground line-clamp-2">
                          {r.description[lang]}
                        </span>
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <VerifiedPill
                          status={resMeta[r.id]?.verification_status ?? "needs_verification"}
                          lastVerified={resMeta[r.id]?.last_verified ?? null}
                          verifyEveryDays={resMeta[r.id]?.verify_every_days}
                          source={resMeta[r.id]?.source ?? undefined}
                          category={r.category}
                          compact
                        />
                      </div>
                      <div className="mt-2">
                        <AttributeBadges a={r} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={`tel:${r.phone}`}
                          className="no-min-h inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call
                        </a>
                        {!isNonSpecificAddress(r.address) && (
                          <DirectionsLink
                            address={r.address}
                            label="Get Directions"
                            className="no-min-h rounded-full border border-border px-3 py-2 text-xs hover:no-underline"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <FavoriteStar id={r.id} category={r.category} />
                      <ListenButton
                        text={buildPackScript([r], lang)}
                        title={r.name[lang]}
                        style="empathetic"
                      />
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-6 text-sm text-muted-foreground">
              Need something more specific?{" "}
              <Link
                to="/search"
                search={{ q: request }}
                className="font-semibold text-primary hover:underline"
              >
                Search all {RESOURCES.length} resources
              </Link>
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
