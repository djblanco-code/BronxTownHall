import { useState } from "react";
import {
  ACCESSIBILITY_OPTIONS,
  CATEGORY_LABELS,
  COMMUNITY_BOARDS,
  DAYS,
  DIETARY_OPTIONS,
  LANGUAGE_OPTIONS,
  ORG_CATEGORIES,
  OWNERSHIP_OPTIONS,
  type AccountType,
  type OrgAccount,
  type OrgContact,
} from "@/lib/org-accounts";

export type OrgFormValue = Partial<OrgAccount> & {
  contact_name: string;
  contact_role: string;
  contact_email: string;
  contact_phone: string;
};

export function emptyForm(type: AccountType, email = ""): OrgFormValue {
  return {
    account_type: type,
    org_name: "",
    has_physical_location: true,
    address: "",
    zip_code: "",
    public_phone: "",
    website: "",
    hours: {},
    hours_mode: "schedule",
    category: type === "government" ? "government" : "",
    languages: ["English"],
    languages_other: "",
    services: "",
    requirements: "",
    accessibility: [],
    ownership_tags: [],
    ownership_other: "",
    dietary_tags: [],
    socials: {},
    business_industry: "",
    has_google_listing: null,
    tier_interest: type === "business" ? "free" : null,
    nonprofit_status: type === "nonprofit" ? "yes" : null,
    mission: "",
    ein: "",
    population_served: "",
    office_name: "",
    role_title: "",
    district: "",
    contact_name: "",
    contact_role: "",
    contact_email: email,
    contact_phone: "",
  };
}

export function fromExisting(o: OrgAccount, c?: OrgContact): OrgFormValue {
  return {
    ...o,
    contact_name: c?.contact_name ?? "",
    contact_role: c?.contact_role ?? "",
    contact_email: c?.contact_email ?? "",
    contact_phone: c?.contact_phone ?? "",
  };
}

const input = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <legend className="px-1 font-bold">{title}</legend>
      {hint && <p className="text-xs text-muted-foreground -mt-1">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1 block">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground mt-1 block">{hint}</span>}
    </label>
  );
}

function CheckGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            type="button"
            key={o}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
            className={`no-min-h rounded-full px-3 py-1.5 text-sm font-medium border-2 ${on ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function OrgListingForm({
  value,
  onChange,
  onSubmit,
  busy,
  submitLabel,
}: {
  value: OrgFormValue;
  onChange: (v: OrgFormValue) => void;
  onSubmit: (v: OrgFormValue) => void;
  busy?: boolean;
  submitLabel: string;
}) {
  const set = <K extends keyof OrgFormValue>(k: K, v: OrgFormValue[K]) =>
    onChange({ ...value, [k]: v });
  const type = value.account_type as AccountType;
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.org_name?.trim()) return setErr("Please enter the organization or business name.");
    if (!value.contact_name.trim() || !value.contact_email.trim())
      return setErr("Contact person name and email are required.");
    if (!value.public_phone?.trim())
      return setErr("Please enter the phone number residents should call.");
    if (type === "government" && !value.office_name?.trim())
      return setErr("Please enter the office or agency name.");
    setErr(null);
    onSubmit(value);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Section title="Who you are">
        <Field label="Organization / business name" required>
          <input
            className={input}
            value={value.org_name ?? ""}
            onChange={(e) => set("org_name", e.target.value)}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Contact person name" required hint="Not shown publicly.">
            <input
              className={input}
              value={value.contact_name}
              onChange={(e) => set("contact_name", e.target.value)}
            />
          </Field>
          <Field label="Their role" hint="Not shown publicly.">
            <input
              className={input}
              value={value.contact_role}
              onChange={(e) => set("contact_role", e.target.value)}
            />
          </Field>
          <Field
            label="Contact email"
            required
            hint="Not shown publicly. Used for your account and follow-up."
          >
            <input
              type="email"
              className={input}
              value={value.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
            />
          </Field>
          <Field label="Contact phone" hint="Not shown publicly.">
            <input
              className={input}
              value={value.contact_phone}
              onChange={(e) => set("contact_phone", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="What residents will see">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={!value.has_physical_location}
            onChange={(e) => set("has_physical_location", !e.target.checked)}
          />
          We don&apos;t have a physical location (we only submit events)
        </label>
        {value.has_physical_location && (
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Field label="Street address">
                <input
                  className={input}
                  value={value.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
            <Field label="ZIP code">
              <input
                className={input}
                value={value.zip_code ?? ""}
                onChange={(e) => set("zip_code", e.target.value)}
              />
            </Field>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Public phone number" required hint="Shown to residents.">
            <input
              className={input}
              value={value.public_phone ?? ""}
              onChange={(e) => set("public_phone", e.target.value)}
            />
          </Field>
          <Field label="Website">
            <input
              className={input}
              placeholder="https://"
              value={value.website ?? ""}
              onChange={(e) => set("website", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Category">
          <select
            className={input}
            value={value.category ?? ""}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Choose a category</option>
            {ORG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Hours of operation">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["schedule", "Set daily hours"],
              ["call", "Call for hours"],
              ["appointment", "By appointment"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={value.hours_mode === id}
              onClick={() => set("hours_mode", id)}
              className={`no-min-h rounded-full px-3 py-1.5 text-sm font-semibold border-2 ${value.hours_mode === id ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {value.hours_mode === "schedule" && (
          <div className="grid sm:grid-cols-2 gap-2">
            {DAYS.map((d) => (
              <label key={d} className="flex items-center gap-2">
                <span className="w-10 text-sm font-semibold">{d}</span>
                <input
                  className={input}
                  placeholder="e.g. 9:00 AM – 5:00 PM, or Closed"
                  value={(value.hours as Record<string, string>)?.[d] ?? ""}
                  onChange={(e) => set("hours", { ...(value.hours ?? {}), [d]: e.target.value })}
                />
              </label>
            ))}
          </div>
        )}
      </Section>

      <Section title="Services and access">
        <Field label="Services offered" hint="Up to 300 characters.">
          <textarea
            maxLength={300}
            rows={3}
            className={input}
            value={value.services ?? ""}
            onChange={(e) => set("services", e.target.value)}
          />
        </Field>
        <Field
          label="Requirements to access services"
          hint='For example: "No ID required" or "Appointment needed".'
        >
          <textarea
            rows={2}
            className={input}
            value={value.requirements ?? ""}
            onChange={(e) => set("requirements", e.target.value)}
          />
        </Field>
        <Field label="Languages spoken on-site">
          <CheckGroup
            options={LANGUAGE_OPTIONS}
            value={value.languages ?? []}
            onChange={(v) => set("languages", v)}
          />
        </Field>
        {(value.languages ?? []).includes("Other") && (
          <Field label="Other languages">
            <input
              className={input}
              value={value.languages_other ?? ""}
              onChange={(e) => set("languages_other", e.target.value)}
            />
          </Field>
        )}
        <Field label="Accessibility">
          <CheckGroup
            options={ACCESSIBILITY_OPTIONS}
            value={value.accessibility ?? []}
            onChange={(v) => set("accessibility", v)}
          />
        </Field>
      </Section>

      {type !== "government" && (
        <Section
          title="Optional tags"
          hint="Self-reported. These appear as 'self-reported' on your listing until an admin confirms them."
        >
          <Field label="Business and identity tags">
            <CheckGroup
              options={OWNERSHIP_OPTIONS}
              value={value.ownership_tags ?? []}
              onChange={(v) => set("ownership_tags", v)}
            />
          </Field>
          <Field
            label="Specific identity"
            hint='For example "Dominican-Owned" or "Ghanaian-Owned".'
          >
            <input
              className={input}
              value={value.ownership_other ?? ""}
              onChange={(e) => set("ownership_other", e.target.value)}
            />
          </Field>
          <Field label="Dietary / religious">
            <CheckGroup
              options={DIETARY_OPTIONS}
              value={value.dietary_tags ?? []}
              onChange={(v) => set("dietary_tags", v)}
            />
          </Field>
        </Section>
      )}

      {type === "business" && (
        <Section title="About your business">
          <Field label="Business type / industry">
            <input
              className={input}
              value={value.business_industry ?? ""}
              onChange={(e) => set("business_industry", e.target.value)}
            />
          </Field>
          <Field
            label="Do you currently have a Google Business listing?"
            hint="Helps us cross-check accuracy."
          >
            <select
              className={input}
              value={
                value.has_google_listing === null || value.has_google_listing === undefined
                  ? ""
                  : value.has_google_listing
                    ? "yes"
                    : "no"
              }
              onChange={(e) =>
                set("has_google_listing", e.target.value === "" ? null : e.target.value === "yes")
              }
            >
              <option value="">Prefer not to say</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field label="Listing plan">
            <div className="space-y-2">
              {(
                [
                  [
                    "free",
                    "Free listing",
                    "Your full listing — name, phone, address, hours, category — plus up to 3 event posts a month. No cost.",
                  ],
                  [
                    "premium_interest",
                    "Interested in Premium ($19/mo, launching soon)",
                    "Top of your category in search, unlimited events, social cross-posting and simple weekly numbers. We'll contact you before anything is charged.",
                  ],
                  ["exploring", "Just exploring for now", "We'll leave you on the free listing."],
                ] as const
              ).map(([id, label, blurb]) => (
                <label
                  key={id}
                  className={`block rounded-xl border-2 p-3 cursor-pointer ${value.tier_interest === id ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <input
                      type="radio"
                      name="tier"
                      checked={value.tier_interest === id}
                      onChange={() => set("tier_interest", id)}
                    />
                    {label}
                  </span>
                  <span className="block text-sm text-muted-foreground mt-1 ps-6">{blurb}</span>
                </label>
              ))}
            </div>
          </Field>
          <p className="text-xs text-muted-foreground">
            No payment is taken anywhere in the app yet, and the Verified badge is never granted by
            paying — an admin still confirms every listing by hand.
          </p>
        </Section>
      )}

      {type === "nonprofit" && (
        <Section title="About your organization">
          <Field label="501(c)(3) status">
            <select
              className={input}
              value={value.nonprofit_status ?? ""}
              onChange={(e) =>
                set("nonprofit_status", e.target.value as OrgFormValue["nonprofit_status"])
              }
            >
              <option value="yes">Yes</option>
              <option value="pending">Pending</option>
              <option value="no">No — informal community organization</option>
            </select>
          </Field>
          <p className="text-xs text-muted-foreground">
            Community and faith groups without formal status are welcome — we review these by hand,
            we don&apos;t turn them away.
          </p>
          {value.nonprofit_status === "yes" && (
            <Field label="EIN number" hint="Optional.">
              <input
                className={input}
                value={value.ein ?? ""}
                onChange={(e) => set("ein", e.target.value)}
              />
            </Field>
          )}
          <Field label="Mission statement" hint="Up to 300 characters.">
            <textarea
              maxLength={300}
              rows={3}
              className={input}
              value={value.mission ?? ""}
              onChange={(e) => set("mission", e.target.value)}
            />
          </Field>
          <Field
            label="Primary population served"
            hint='For example: "seniors", "immigrant families", "youth ages 7-17".'
          >
            <input
              className={input}
              value={value.population_served ?? ""}
              onChange={(e) => set("population_served", e.target.value)}
            />
          </Field>
        </Section>
      )}

      {type === "government" && (
        <Section title="About your office">
          <Field
            label="Office / agency name"
            required
            hint='For example: "Office of Council Member Diana Ayala", "NYC 311", "Community Board 3".'
          >
            <input
              className={input}
              value={value.office_name ?? ""}
              onChange={(e) => set("office_name", e.target.value)}
            />
          </Field>
          <Field label="Your role / title">
            <input
              className={input}
              value={value.role_title ?? ""}
              onChange={(e) => set("role_title", e.target.value)}
            />
          </Field>
          <Field label="District or jurisdiction covered">
            <input
              list="bronx-boards"
              className={input}
              value={value.district ?? ""}
              onChange={(e) => set("district", e.target.value)}
            />
          </Field>
          <datalist id="bronx-boards">
            {COMMUNITY_BOARDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </Section>
      )}

      <Section
        title="Social media handles"
        hint="Cross-posting to these is a Premium feature. You can save your handles either way."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {(["instagram", "facebook", "twitter", "whatsapp"] as const).map((k) => (
            <Field
              key={k}
              label={
                k === "twitter"
                  ? "Twitter / X"
                  : k === "whatsapp"
                    ? "WhatsApp Business"
                    : k[0].toUpperCase() + k.slice(1)
              }
            >
              <input
                className={input}
                value={(value.socials as Record<string, string>)?.[k] ?? ""}
                onChange={(e) => set("socials", { ...(value.socials ?? {}), [k]: e.target.value })}
              />
            </Field>
          ))}
        </div>
      </Section>

      {err && <p className="text-sm font-semibold text-destructive">{err}</p>}

      <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
        Everything here is what your organization tells us about itself. Your listing goes live
        right away marked
        <strong> “Not yet verified.”</strong> A Bronx App reviewer confirms details by phone or in
        person before it shows a green Verified badge.
      </div>

      <button
        type="submit"
        disabled={busy}
        className="no-min-h w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 min-h-[48px]"
      >
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
