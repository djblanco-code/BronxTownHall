import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/features/shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  ACCOUNT_TYPES,
  GOV_EMAIL_MESSAGE,
  createOrg,
  isGovernmentEmail,
  type AccountType,
} from "@/lib/org-accounts";
import { OrgListingForm, emptyForm, type OrgFormValue } from "@/components/OrgListingForm";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  HandHeart,
  Landmark,
  Store,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

const TITLE = "List your organization on The Bronx App | Business, nonprofit & government accounts";
const DESC =
  "Businesses, nonprofits and community organizations, and government offices can create a free account on The Bronx App and manage their own Bronx listing.";

/** Line icons for the account types (their data carries emoji, which the design system doesn't use). */
const ACCOUNT_ICONS: Record<AccountType, LucideIcon> = {
  business: Store,
  nonprofit: HandHeart,
  government: Landmark,
};

export const Route = createFileRoute("/portal")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<AccountType | null>(null);
  const [form, setForm] = useState<OrgFormValue | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (type && user && !form) setForm(emptyForm(type, user.email ?? ""));
  }, [type, user, form]);

  const submit = async (v: OrgFormValue) => {
    if (!user) return;
    setBusy(true);
    try {
      const { contact_name, contact_role, contact_email, contact_phone, ...listing } = v;
      await createOrg(user.id, {
        ...listing,
        account_type: type!,
        org_name: v.org_name!,
        contact: { contact_name, contact_role, contact_email, contact_phone },
      });
      toast.success("Listing submitted — it's live now and marked “Not yet verified.”");
      navigate({ to: "/portal/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your listing");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <Link
          to="/"
          className="no-min-h inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Home
        </Link>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">List your organization</h1>
          <p className="text-muted-foreground">
            Add your business, community organization or government office to The Bronx App, then
            keep your own details up to date. Free — there is no payment anywhere in the app.
          </p>
        </header>

        {!type && (
          <ul className="divide-y divide-border border-t-[3px] border-b border-t-foreground border-b-border">
            {ACCOUNT_TYPES.map((t) => {
              const Icon = ACCOUNT_ICONS[t.id];
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setType(t.id)}
                    className="no-min-h group flex min-h-16 w-full items-start gap-3 py-4 text-start"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-foreground group-hover:underline">
                        {t.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{t.blurb}</span>
                    </span>
                    <ChevronRight
                      className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {type && (
          <button
            onClick={() => {
              setType(null);
              setForm(null);
            }}
            className="no-min-h inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
          >
            ← Choose a different account type
          </button>
        )}

        {type && !loading && !user && <AccountStep type={type} />}

        {type && user && (
          <>
            {user.email && type === "government" && !isGovernmentEmail(user.email) && (
              <p className="rounded-md border-2 border-foreground p-3 text-sm">
                You&apos;re signed in as a non-government address. {GOV_EMAIL_MESSAGE}
              </p>
            )}
            {form && (
              <OrgListingForm
                value={form}
                onChange={setForm}
                onSubmit={submit}
                busy={busy}
                submitLabel="Submit listing for review"
              />
            )}
          </>
        )}

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/portal/dashboard" className="text-primary underline">
            Go to your dashboard
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}

function AccountStep({ type }: { type: AccountType }) {
  const [mode, setMode] = useState<"sign-up" | "sign-in">("sign-up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const govBlocked = type === "government" && email.trim() !== "" && !isGovernmentEmail(email);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "government" && !isGovernmentEmail(email)) {
      toast.error("A .gov or .nyc.gov email address is required for government accounts.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/portal` },
        });
        if (error) throw error;
        if (!data.session) setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-2 rounded-md border-2 border-foreground p-4">
        <p className="inline-flex items-center gap-2 font-bold">
          <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" /> Check your email
        </p>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to {email}. Open it, then come back to this page to fill in
          your listing.
        </p>
      </div>
    );
  }

  const input =
    "h-11 w-full rounded-md border border-border bg-background px-3 text-base focus-visible:border-primary focus-visible:outline-none";

  return (
    <form onSubmit={go} className="space-y-3 rounded-md border border-border p-4">
      <h2 className="text-lg font-bold">
        {mode === "sign-up" ? "Create your account" : "Sign in"}
      </h2>
      {type === "government" && (
        <p className="text-sm text-muted-foreground">{GOV_EMAIL_MESSAGE}</p>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-bold">Email</span>
        <input
          required
          type="email"
          className={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {govBlocked && (
        <p className="text-sm font-semibold text-destructive">
          That address isn&apos;t a government one. Please use an address ending in .gov or
          .nyc.gov.
        </p>
      )}
      <label className="block">
        <span className="mb-1 block text-sm font-bold">Password</span>
        <input
          required
          type="password"
          minLength={6}
          className={input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={busy || govBlocked}
        className="no-min-h min-h-12 w-full rounded-md bg-primary py-3 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {busy ? "Working…" : mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
      <p className="text-sm text-center text-muted-foreground">
        {mode === "sign-up" ? "Already registered?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "sign-up" ? "sign-in" : "sign-up")}
          className="no-min-h inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4"
        >
          {mode === "sign-up" ? "Sign in" : "Create an account"}
        </button>
      </p>
    </form>
  );
}
