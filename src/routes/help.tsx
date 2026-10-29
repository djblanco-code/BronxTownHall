import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { openingStatus, useNycTime } from "@/lib/opening-hours";
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
import { CATEGORY_ICONS } from "@/features/resources";

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
  const now = useNycTime();

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
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => nav({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <h1 className="text-3xl text-foreground sm:text-4xl">Tell us what's going on</h1>
        <p className="mt-1 text-muted-foreground">
          Write or say one sentence in your own words. We'll pull together five places that can help
          — and read them out loud.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
          className="mt-4 rounded-md border border-border bg-card p-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring"
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
              className="rounded-md bg-bronx-orange text-bronx-orange-foreground hover:bg-bronx-orange/90"
              onResult={(text) => {
                setInput(text);
                run(text);
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="no-min-h inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary-fill px-5 py-2.5 font-bold text-primary-fill-foreground transition-colors hover:bg-primary-fill-hover disabled:opacity-40"
            >
              <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden /> Get my help pack
            </button>
          </div>
        </form>

        {!parse && (
          <div className="mt-4">
            <p className="label-caps mb-1 text-muted-foreground">Not sure how to say it? Try:</p>
            <ul className="divide-y divide-border border-y border-border">
              {EXAMPLE_PROMPTS.map((p) => (
                <li key={p}>
                  <button
                    onClick={() => {
                      setInput(p);
                      run(p);
                    }}
                    className="no-min-h flex min-h-[44px] w-full items-center py-2.5 text-start text-sm font-semibold text-primary hover:underline"
                  >
                    “{p}”
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {parse && (
          <>
            {parse.urgent && (
              <div className="mt-5 flex items-start gap-3 rounded-md border-2 border-destructive p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" aria-hidden />
                <div>
                  <p className="font-bold text-destructive">
                    If you're in danger or crisis right now
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Call 911 for emergencies, or 988 for free 24/7 crisis support.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href="tel:911"
                      className="no-min-h inline-flex min-h-[44px] items-center rounded-md bg-destructive px-4 text-sm font-bold text-destructive-foreground hover:bg-destructive/90"
                    >
                      Call 911
                    </a>
                    <a
                      href="tel:988"
                      className="no-min-h inline-flex min-h-[44px] items-center rounded-md border-2 border-destructive px-4 text-sm font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Call 988
                    </a>
                    <Link
                      to="/emergency"
                      className="no-min-h inline-flex min-h-[44px] items-center rounded-md border border-border px-4 text-sm font-bold text-foreground hover:bg-secondary"
                    >
                      All hotlines
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{parse.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {[parse.primaryNeed, ...parse.relatedNeeds].map((c) => {
                      const cat = CATEGORIES.find((x) => x.id === c);
                      const Icon = CATEGORY_ICONS[c];
                      return (
                        <Link
                          key={c}
                          to="/category/$cat"
                          params={{ cat: c }}
                          className="no-min-h inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-semibold hover:border-foreground"
                        >
                          {Icon && (
                            <Icon
                              className="h-4 w-4 shrink-0"
                              style={cat ? { color: cat.color } : undefined}
                              aria-hidden="true"
                            />
                          )}
                          {cat ? t(cat.labelKey) : c}
                        </Link>
                      );
                    })}
                    {refining && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> refining…
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
                  className="no-min-h inline-flex min-h-[44px] items-center gap-2 rounded-md border border-border px-4 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
                >
                  <Share2 className="h-4 w-4" aria-hidden /> Send by text
                </button>
              </div>
            </div>

            <h2 className="mt-8 pt-2 text-lg font-bold sm:text-2xl">Your 5 resources</h2>
            <ol className="mt-1 divide-y divide-border border-y border-border">
              {pack.map((r, i) => {
                const cat = CATEGORIES.find((c) => c.id === r.category);
                const Icon = CATEGORY_ICONS[r.category];
                return (
                  <li key={r.id} className="flex items-stretch gap-2 py-3">
                    <div className="group min-w-0 flex-1">
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
                        <span className="flex items-start gap-3">
                          <Icon
                            className="mt-0.5 h-5 w-5 shrink-0"
                            style={cat ? { color: cat.color } : undefined}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold text-foreground group-hover:underline">
                              {i + 1}. {r.name[lang]}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate">
                              {cat ? t(cat.labelKey) : r.category} ·{" "}
                              {isNonSpecificAddress(r.address)
                                ? LOCATION_VARIES_LABEL
                                : `${r.distance} ${t("miles")}`}{" "}
                              ·{" "}
                              {now && openingStatus(r.hours.en, now).open
                                ? t("interface.openNow")
                                : r.hours[lang]}
                            </span>
                          </span>
                        </span>
                        <span className="mt-1 block ps-8 text-sm text-muted-foreground line-clamp-2">
                          {r.description[lang]}
                        </span>
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 ps-8">
                        <VerifiedPill
                          status={resMeta[r.id]?.verification_status ?? "needs_verification"}
                          lastVerified={resMeta[r.id]?.last_verified ?? null}
                          verifyEveryDays={resMeta[r.id]?.verify_every_days}
                          source={resMeta[r.id]?.source ?? undefined}
                          category={r.category}
                          compact
                        />
                      </div>
                      <div className="mt-2 ps-8">
                        <AttributeBadges a={r} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 ps-8">
                        <a
                          href={`tel:${r.phone}`}
                          className="no-min-h inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-border px-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
                        >
                          <Phone className="h-4 w-4" aria-hidden /> Call
                        </a>
                        {!isNonSpecificAddress(r.address) && (
                          <DirectionsLink
                            address={r.address}
                            label="Get Directions"
                            className="no-min-h min-h-[44px] rounded-md border border-border px-3 text-sm text-foreground hover:border-foreground hover:no-underline"
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
