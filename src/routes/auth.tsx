import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const onGoogle = async () => {
    setBusy(true);
    // Redirects to Google, then back here; the session is picked up on return.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error("Google sign-in failed");
      setBusy(false);
    }
  };

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { name } },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Home
        </button>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </h1>
        <p className="mt-1 mb-6 text-muted-foreground">
          Save your favorites and trusted resources across devices.
        </p>

        <button
          onClick={onGoogle}
          disabled={busy}
          className="no-min-h mb-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-foreground bg-card py-3 font-bold text-foreground hover:bg-secondary disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-border" />
          <span className="label-caps text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onEmail} className="space-y-3 rounded-md border border-border p-4">
          {mode === "sign-up" && (
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Name</span>
              <input
                className="h-11 w-full rounded-md border border-border bg-background px-3 focus-visible:border-primary focus-visible:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-md border border-border bg-background px-3 focus-visible:border-primary focus-visible:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Password</span>
            <input
              required
              type="password"
              minLength={6}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              className="h-11 w-full rounded-md border border-border bg-background px-3 focus-visible:border-primary focus-visible:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="no-min-h inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />{" "}
            {busy ? "Working…" : mode === "sign-up" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "sign-up" ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => setMode(mode === "sign-up" ? "sign-in" : "sign-up")}
            className="no-min-h inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4"
          >
            {mode === "sign-up" ? "Sign in" : "Create an account"}
          </button>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Business owner?{" "}
          <Link to="/business-login" className="text-primary underline">
            Business login
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
