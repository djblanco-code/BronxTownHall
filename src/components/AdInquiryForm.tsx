import { useState } from "react";
import { z } from "zod";
import { Check, Loader2, Send } from "lucide-react";
import { INTEREST_OPTIONS, submitAdInquiry, type AdInterest } from "@/lib/ads";

const schema = z.object({
  org_name: z.string().trim().min(1, "Business or organization name is required").max(160),
  contact_name: z.string().trim().min(1, "Contact name is required").max(120),
  contact_email: z.string().trim().email("Please enter a valid email").max(255),
  budget_range: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
});

const inp =
  "mt-1 w-full px-3 py-2.5 rounded-lg border-2 border-border bg-background text-sm focus:outline-none focus:border-primary";

export function AdInquiryForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok">("idle");
  const [err, setErr] = useState("");
  const [interest, setInterest] = useState<AdInterest>("not_sure");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      org_name: fd.get("org_name"),
      contact_name: fd.get("contact_name"),
      contact_email: fd.get("contact_email"),
      budget_range: fd.get("budget_range"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Please check your answers");
      return;
    }
    setStatus("loading");
    try {
      await submitAdInquiry({ ...parsed.data, interest });
      setStatus("ok");
    } catch (e2) {
      setStatus("idle");
      setErr(e2 instanceof Error ? e2.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border-2 border-success/40 bg-success/10 p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-success/20 grid place-items-center mb-2">
          <Check className="h-7 w-7 text-success" aria-hidden />
        </div>
        <p className="font-bold text-lg">Thanks — we got your inquiry</p>
        <p className="text-sm text-muted-foreground mt-1">
          We'll follow up within a few days to discuss options and pricing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border-2 border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-bold">Tell us about your business</h2>
        <p className="text-sm text-muted-foreground">
          No payment here — this is an inquiry. A person reads every one.
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Business or organization name *</span>
        <input name="org_name" required maxLength={160} className={inp} />
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Contact name *</span>
          <input name="contact_name" required maxLength={120} className={inp} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Contact email *</span>
          <input name="contact_email" type="email" required maxLength={255} className={inp} />
        </label>
      </div>

      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground mb-2">What are you interested in?</legend>
        <div className="space-y-2">
          {INTEREST_OPTIONS.map((o) => (
            <label
              key={o.id}
              className={`flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition ${
                interest === o.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name="interest"
                value={o.id}
                checked={interest === o.id}
                onChange={() => setInterest(o.id)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold">{o.label}</span>
                <span className="block text-xs text-muted-foreground">{o.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">
          Budget range (optional — helps us understand fit, not a commitment)
        </span>
        <input name="budget_range" maxLength={120} placeholder="e.g. $100–$300 a month" className={inp} />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Anything else you'd like to share</span>
        <textarea name="message" rows={4} maxLength={2000} className={inp} />
      </label>

      {err && <p className="text-sm font-semibold text-destructive">{err}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="no-min-h w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-60 min-h-[48px]"
      >
        {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        Send inquiry
      </button>
    </form>
  );
}
