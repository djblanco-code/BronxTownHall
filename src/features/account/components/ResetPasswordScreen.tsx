import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n-context";
import { AppShell } from "@/features/shell";
import { authErrorKey } from "../lib/auth-errors";
import { FIELD, PRIMARY_BUTTON } from "./styles";

/**
 * Where a password-reset email lands. Supabase trades the link's one-time code
 * for a session while the client starts up (PKCE, so it only works in the
 * browser that asked for the link); then the person picks a new password.
 */
export function ResetPasswordScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "ready" | "expired">("checking");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data }) => alive && setState(data.session ? "ready" : "expired"))
      .catch(() => alive && setState("expired"));
    return () => {
      alive = false;
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(t("account.resetDone"));
      navigate({ to: "/" });
    } catch (err) {
      toast.error(t(authErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-6">
        <KeyRound className="h-10 w-10 text-primary" aria-hidden="true" />
        <h1 className="mt-3 text-3xl text-foreground sm:text-4xl">{t("account.resetTitle")}</h1>

        {state === "checking" && (
          <p role="status" className="mt-2 text-muted-foreground">
            {t("account.checkingLink")}
          </p>
        )}

        {state === "expired" && (
          <div role="alert">
            <p className="mt-2 text-muted-foreground">{t("account.resetExpired")}</p>
            <Link to="/auth" className={`${PRIMARY_BUTTON} mt-4`}>
              {t("account.askNewLink")}
            </Link>
          </div>
        )}

        {state === "ready" && (
          <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-md border border-border p-4">
            <label className="block">
              <span className="mb-1 block text-sm font-bold">{t("account.newPassword")}</span>
              <input
                required
                type="password"
                minLength={6}
                autoComplete="new-password"
                className={FIELD}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                {t("account.passwordHint")}
              </span>
            </label>
            <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
              {busy ? t("account.working") : t("account.savePassword")}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
