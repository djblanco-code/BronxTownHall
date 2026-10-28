import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Settings, User } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/hooks/use-auth";
import { BottomSheet, BottomSheetContent, BottomSheetTrigger } from "@/components/ui/bottom-sheet";

/**
 * Signed out: a quiet link to sign in (most residents never need an account).
 * Signed in: opens a small sheet, so signing out is never a single stray tap.
 */
export function AccountButton() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link
        to="/auth"
        aria-label={t("common.navSignIn")}
        className="no-min-h simplified-exempt inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full bg-secondary px-2.5 text-sm font-bold text-foreground hover:bg-secondary/70 lg:bg-primary lg:px-4 lg:text-primary-foreground lg:hover:bg-primary/90"
      >
        <User className="h-5 w-5 lg:hidden" aria-hidden="true" />
        <LogIn className="hidden h-4 w-4 lg:block" aria-hidden="true" />
        <span className="hidden lg:inline">{t("common.navSignIn")}</span>
      </Link>
    );
  }

  const email = user.email ?? "";
  const initial = (email[0] ?? "?").toUpperCase();

  return (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <BottomSheetTrigger asChild>
        <button
          type="button"
          aria-label={t("shell.account")}
          className="no-min-h simplified-exempt grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          <span aria-hidden="true">{initial}</span>
        </button>
      </BottomSheetTrigger>
      <BottomSheetContent
        title={t("shell.account")}
        description={email ? t("shell.signedInAs", { email }) : undefined}
        closeLabel={t("shell.close")}
      >
        <div className="flex flex-col gap-2">
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="no-min-h flex min-h-12 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-secondary"
          >
            <Settings className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            {t("common.navSettings")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="no-min-h flex min-h-12 items-center gap-3 rounded-xl px-3 text-start font-semibold text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            {t("common.navSignOut")}
          </button>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
