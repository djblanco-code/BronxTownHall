import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n-context";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
import { authErrorKey } from "../lib/auth-errors";
import { GOOGLE_SIGN_IN_ENABLED, resetPasswordUrl } from "../lib/config";
import { FIELD, PRIMARY_BUTTON } from "./styles";

type Mode = "sign-in" | "sign-up" | "forgot";
type Sent = { kind: "sign-up" | "reset"; email: string } | null;

/**
 * Optional resident account: sign in, create an account, or get a password
 * reset link. Every message is translated, and errors say what to do next.
 */
export function AuthScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [sent, setSent] = useState<Sent>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const fail = (err: unknown) => toast.error(t(authErrorKey(err)));

  const onGoogle = async () => {
    setBusy(true);
    // Redirects to Google, then back here; the session is picked up on return.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error(t("account.errGoogle"));
      setBusy(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { name } },
        });
        if (error) throw error;
        // With email confirmation on, Supabase answers an existing address with
        // an empty identity list instead of an error.
        if (data.user && data.user.identities?.length === 0) {
          throw { code: "user_already_exists" };
        }
        if (data.session) navigate({ to: "/" });
        else setSent({ kind: "sign-up", email });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetPasswordUrl(),
        });
        if (error) throw error;
        setSent({ kind: "reset", email });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const switchTo = (next: Mode) => {
    setSent(null);
    setMode(next);
  };

  const title =
    mode === "sign-up"
      ? t("account.signUpTitle")
      : mode === "forgot"
        ? t("account.forgotTitle")
        : t("account.signInTitle");

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("account.home")}
        </button>

        <PagePhoto slug="el-train" />
        {sent ? (
          <div role="status">
            <MailCheck className="h-10 w-10 text-primary" aria-hidden="true" />
            <h1 className="mt-3 text-3xl text-foreground sm:text-4xl">
              {t("account.checkEmailTitle")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t(sent.kind === "sign-up" ? "account.checkSignUp" : "account.checkReset", {
                email: sent.email,
              })}
            </p>
            <button
              onClick={() => switchTo("sign-in")}
              className="no-min-h mt-4 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4"
            >
              {t("account.backToSignIn")}
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl text-foreground sm:text-4xl">{title}</h1>
            <p className="mt-1 text-muted-foreground">
              {mode === "forgot" ? t("account.forgotIntro") : t("account.intro")}
            </p>
            {mode !== "forgot" && (
              <p className="mt-1 mb-6 text-sm text-muted-foreground">
                {t("account.noAccountNeeded")}
              </p>
            )}

            {GOOGLE_SIGN_IN_ENABLED && mode !== "forgot" && (
              <>
                <button
                  onClick={onGoogle}
                  disabled={busy}
                  className="no-min-h mb-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-border bg-card py-3 font-bold text-foreground hover:bg-secondary disabled:opacity-50"
                >
                  <GoogleMark />
                  {t("account.google")}
                </button>
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="label-caps text-muted-foreground">{t("account.or")}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </>
            )}

            <form
              onSubmit={onSubmit}
              className="mt-4 space-y-3 rounded-md border border-border p-4"
            >
              {mode === "sign-up" && (
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">{t("account.name")}</span>
                  <input
                    className={FIELD}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1 block text-sm font-bold">{t("account.email")}</span>
                <input
                  required
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  className={FIELD}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {mode !== "forgot" && (
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">{t("account.password")}</span>
                  <input
                    required
                    type="password"
                    minLength={6}
                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    className={FIELD}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {mode === "sign-up" && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t("account.passwordHint")}
                    </span>
                  )}
                </label>
              )}
              <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                {busy
                  ? t("account.working")
                  : mode === "sign-up"
                    ? t("account.submitSignUp")
                    : mode === "forgot"
                      ? t("account.sendLink")
                      : t("account.submitSignIn")}
              </button>
              {mode === "sign-in" && (
                <button
                  type="button"
                  onClick={() => switchTo("forgot")}
                  className="no-min-h inline-flex min-h-11 items-center text-sm font-bold text-primary underline underline-offset-4"
                >
                  {t("account.forgot")}
                </button>
              )}
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "sign-in" ? t("account.newHere") : t("account.haveAccount")}{" "}
              <button
                onClick={() => switchTo(mode === "sign-in" ? "sign-up" : "sign-in")}
                className="no-min-h inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4"
              >
                {mode === "sign-in" ? t("account.createOne") : t("account.signInLink")}
              </button>
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}

function GoogleMark() {
  return (
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
  );
}
