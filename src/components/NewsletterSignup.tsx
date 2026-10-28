import { useState } from "react";
import { z } from "zod";
import { Mail, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n-context";
import { useProfile } from "@/lib/onboarding";

const INTEREST_OPTIONS = [
  { id: "food", label: "🍲 Food & meals" },
  { id: "health", label: "🏥 Health & clinics" },
  { id: "jobs", label: "💼 Jobs & training" },
  { id: "legal", label: "⚖️ Legal help" },
  { id: "youth", label: "🎒 Youth programs" },
  { id: "events", label: "🎉 Events" },
  { id: "civic", label: "🗳️ Civic & meetings" },
];

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  zip: z.string().trim().max(10).optional(),
});

export function NewsletterSignup() {
  const { lang } = useI18n();
  const profile = useProfile();
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState(profile.userZipCode || "");
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState("");

  const toggleInterest = (id: string) =>
    setInterests((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const parsed = schema.safeParse({ email, zip: zip || undefined });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.from("newsletter_subscriptions").insert({
      email: parsed.data.email.toLowerCase(),
      zip_code: parsed.data.zip || null,
      language: lang,
      interests,
      frequency: "weekly",
      confirmed: false,
    });
    if (error) {
      // Duplicate email: treat as already-subscribed success instead of blocking.
      if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
        setStatus("ok");
        return;
      }
      setStatus("err");
      setErr(error.message);
      return;
    }
    setStatus("ok");
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 sm:p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/15 grid place-items-center mb-2">
          <Check className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <p className="font-bold text-lg">You're in! 🎉</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your first weekly Bronx digest will hit{" "}
          <span className="font-semibold text-foreground">{email}</span> on Sunday morning.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border-2 border-border bg-card p-5 sm:p-6 shadow-sm"
      aria-labelledby="newsletter-heading"
    >
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 rounded-xl bg-accent/15 grid place-items-center shrink-0"
          aria-hidden
        >
          <Sparkles className="h-6 w-6 text-accent" />
        </div>
        <div className="min-w-0">
          <h2 id="newsletter-heading" className="text-lg sm:text-xl font-bold">
            The Weekly Bronx
          </h2>
          <p className="text-sm text-muted-foreground">
            One opt-in email every Sunday: new resources near your ZIP, events this week, and a
            Bronx fact. Unsubscribe anytime.
          </p>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-[1fr_120px] gap-2">
        <label className="block">
          <span className="sr-only">Email address</span>
          <div className="relative">
            <Mail
              className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              aria-hidden
            />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full ps-10 pe-3 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary min-h-[48px]"
            />
          </div>
        </label>
        <label className="block">
          <span className="sr-only">ZIP code (optional)</span>
          <input
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="ZIP"
            className="w-full px-3 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary min-h-[48px]"
          />
        </label>
      </div>

      <fieldset className="mt-3">
        <legend className="text-xs font-semibold text-muted-foreground mb-2">
          What do you care about? (optional)
        </legend>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((opt) => {
            const active = interests.includes(opt.id);
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => toggleInterest(opt.id)}
                aria-pressed={active}
                className={`no-min-h text-sm px-3 py-2 rounded-full border-2 transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {err && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {err}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          We'll never sell your email.{" "}
          <span className="font-semibold text-foreground">Opt-in only.</span>
        </p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="no-min-h inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow hover:opacity-90 disabled:opacity-60 min-h-[48px]"
        >
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
          Subscribe
        </button>
      </div>
    </form>
  );
}
