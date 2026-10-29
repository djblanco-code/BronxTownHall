import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { A11yDialog } from "./A11yDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Serious-conduct flag. Deliberately separate from ReportModal (factual
 * corrections). Submissions go to an admin-only review queue: nothing here
 * changes a listing's public status or verification badge, and flag counts
 * are never readable by the public.
 */

const CONCERNS = [
  {
    id: "unlicensed",
    label: "Posing as a licensed professional (lawyer, doctor, notario, contractor)",
  },
  {
    id: "predatory_pricing",
    label: "Predatory pricing or hidden fees for something advertised as free or low-cost",
  },
  { id: "fraud", label: "Taking money and not providing the service" },
  { id: "immigration_scam", label: "Charging for immigration help they aren't authorized to give" },
  { id: "discrimination", label: "Refusing or mistreating people because of who they are" },
  { id: "unsafe", label: "Unsafe or harmful conditions or treatment" },
  { id: "other", label: "Another serious concern (please describe)" },
] as const;

type ConcernId = (typeof CONCERNS)[number]["id"];

export function FlagBusinessModal({
  onClose,
  resourceId,
  resourceName,
  resourceType = "resource",
  category,
}: {
  onClose: () => void;
  resourceId: string;
  resourceName?: string;
  resourceType?: "resource" | "business" | "event";
  category?: string;
}) {
  const [concern, setConcern] = useState<ConcernId | null>(null);
  const [details, setDetails] = useState("");
  const [happenedOn, setHappenedOn] = useState("");
  const [money, setMoney] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [willing, setWilling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const detailsTooShort = details.trim().length < 10;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concern || detailsTooShort) return;
    setSubmitting(true);
    const { error } = await supabase.from("conduct_flags").insert({
      resource_id: resourceId,
      resource_name: resourceName || null,
      resource_type: resourceType,
      category: category || null,
      concern,
      details: details.trim().slice(0, 4000),
      happened_on: happenedOn || null,
      money_involved: money.trim() || null,
      reporter_name: name.trim() || null,
      reporter_email: email.trim() || null,
      reporter_phone: phone.trim() || null,
      willing_to_talk: willing,
    });
    setSubmitting(false);
    if (error) {
      console.error(error);
      toast.error("We couldn't send that. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <A11yDialog open onClose={onClose} title="Flag this business" className="max-w-lg">
      {submitted ? (
        <div role="status" aria-live="polite" className="py-6 text-center space-y-3">
          <p className="text-success font-semibold">✓ Thank you. A person will review this.</p>
          <p className="text-sm text-muted-foreground">
            Serious concerns are reviewed carefully by our team before anything changes on the
            listing. Nothing you wrote is shown publicly. If someone is in immediate danger, call
            911.
          </p>
          <button
            onClick={onClose}
            className="no-min-h mt-2 px-5 py-2.5 rounded-lg bg-primary-fill text-primary-fill-foreground font-semibold min-h-[44px]"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary p-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">
              Use this only if you believe this place is misleading, exploiting, or harming people.
              For wrong hours, an old address, or a bad phone number, use{" "}
              <strong>Report incorrect info</strong> instead. Your report is private and reviewed by
              a person — the listing does not change automatically.
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold mb-2">What is your concern?</legend>
            <div className="space-y-2">
              {CONCERNS.map((c) => (
                <label
                  key={c.id}
                  className="no-min-h flex items-start gap-2 p-2.5 rounded-lg border border-border hover:bg-secondary cursor-pointer min-h-[44px]"
                >
                  <input
                    type="radio"
                    name="concern"
                    required
                    onChange={() => setConcern(c.id)}
                    className="mt-1 accent-primary h-5 w-5"
                  />
                  <span className="text-sm">{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {resourceName && (
            <Field label="Listing" id="fb-listing">
              <input
                id="fb-listing"
                defaultValue={resourceName}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary min-h-[44px]"
              />
            </Field>
          )}

          <Field
            label="What happened? Please be specific — dates, amounts, what was promised"
            id="fb-details"
          >
            <textarea
              id="fb-details"
              rows={5}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              aria-describedby="fb-details-help"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="Example: They said the consultation was free, then charged $200 and said they were an immigration lawyer."
            />
            <p id="fb-details-help" className="mt-1 text-xs text-muted-foreground">
              At least a sentence or two so our team can look into it.
            </p>
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="When did this happen? (optional)" id="fb-when">
              <input
                id="fb-when"
                type="date"
                value={happenedOn}
                onChange={(e) => setHappenedOn(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[44px]"
              />
            </Field>
            <Field label="Money involved? (optional)" id="fb-money">
              <input
                id="fb-money"
                value={money}
                onChange={(e) => setMoney(e.target.value)}
                placeholder="e.g. $200 cash"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[44px]"
              />
            </Field>
          </div>

          <Field label="Your name (optional)" id="fb-name">
            <input
              id="fb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[44px]"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Email (optional)" id="fb-email">
              <input
                id="fb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[44px]"
              />
            </Field>
            <Field label="Phone (optional)" id="fb-phone">
              <input
                id="fb-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background min-h-[44px]"
              />
            </Field>
          </div>

          <label className="no-min-h flex items-start gap-2 p-2.5 rounded-lg border border-border cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={willing}
              onChange={(e) => setWilling(e.target.checked)}
              className="mt-1 accent-primary h-5 w-5"
            />
            <span className="text-sm">A reviewer may contact me for more information.</span>
          </label>

          <button
            type="submit"
            disabled={submitting || !concern || detailsTooShort}
            className="no-min-h w-full py-3 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 disabled:opacity-60 min-h-[44px]"
          >
            {submitting ? "Sending…" : "Send to review team"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Private. Never posted publicly and never shown as a count on the listing.
          </p>
        </form>
      )}
    </A11yDialog>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-foreground mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
