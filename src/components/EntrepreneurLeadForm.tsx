import { useState } from "react";
import { z } from "zod";
import { Loader2, Check, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HELP_OPTIONS, STAGE_OPTIONS } from "@/lib/entrepreneur-data";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  idea_summary: z.string().trim().min(5, "Tell us a bit more").max(4000),
  stage: z.enum(["idea", "planning", "launching", "operating", "growing"]),
});

export function EntrepreneurLeadForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState("");
  const [stage, setStage] = useState<(typeof STAGE_OPTIONS)[number]["id"]>("idea");
  const [helpNeeded, setHelpNeeded] = useState<string[]>([]);

  const toggleHelp = (id: string) =>
    setHelpNeeded((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      idea_summary: fd.get("idea_summary"),
      stage,
    });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Please check your input");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.from("entrepreneur_leads").insert({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      idea_summary: parsed.data.idea_summary,
      stage: parsed.data.stage,
      help_needed: helpNeeded,
    });
    if (error) {
      setStatus("err");
      setErr(error.message);
      return;
    }
    setStatus("ok");
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border-2 border-success/40 bg-success/10 p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-success/20 grid place-items-center mb-2">
          <Check className="h-7 w-7 text-success" aria-hidden />
        </div>
        <p className="font-bold text-lg">Got it! 🚀</p>
        <p className="text-sm text-muted-foreground mt-1">
          A Bronx business advisor will follow up within 3 business days.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border-2 border-border bg-card p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div>
        <h3 className="text-lg font-bold">Tell us your idea</h3>
        <p className="text-sm text-muted-foreground">
          We'll match you with a free Bronx advisor and the right resources — no pitch deck
          required.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Your name</span>
          <input name="name" required maxLength={120} className={inp} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Email</span>
          <input name="email" type="email" required maxLength={255} className={inp} />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">
          Your idea in a few sentences
        </span>
        <textarea name="idea_summary" required rows={4} maxLength={4000} className={inp} />
      </label>

      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground mb-2">
          Where are you now?
        </legend>
        <div className="flex flex-wrap gap-2">
          {STAGE_OPTIONS.map((o) => {
            const active = stage === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setStage(o.id)}
                aria-pressed={active}
                className={`no-min-h text-sm px-3 py-2 rounded-full border-2 transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground mb-2">
          What help do you need? (pick any)
        </legend>
        <div className="flex flex-wrap gap-2">
          {HELP_OPTIONS.map((o) => {
            const active = helpNeeded.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleHelp(o.id)}
                aria-pressed={active}
                className={`no-min-h text-sm px-3 py-2 rounded-full border-2 transition ${
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card hover:border-accent"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {err && (
        <p role="alert" className="text-sm text-destructive">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="no-min-h w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow hover:opacity-90 disabled:opacity-60 min-h-[48px]"
      >
        {status === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        Send my idea
      </button>
    </form>
  );
}

const inp =
  "mt-1 w-full px-3 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary min-h-[48px]";
