import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, LogIn, LogOut, Settings, User } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { useAuth } from "@/hooks/use-auth";
import { BottomSheet, BottomSheetContent, BottomSheetTrigger } from "@/components/ui/bottom-sheet";
import { FOOTER_SECTIONS } from "../nav";

/**
 * The footer's pages, for phones where the footer is hidden. Events and Town
 * Hall are tabs and urgent help is the SOS button, so they are left out.
 */
const MORE_LINKS = FOOTER_SECTIONS.flatMap((section) => section.links).filter(
  (link) => !["/events", "/civic", "/urgent"].includes(link.to),
);

/**
 * Opens a small sheet for everyone: Settings lives here (it has no tab), plus
 * sign in or sign out, and on phones the About, help and legal pages the
 * footer carries on laptops. Signing out is never a single stray tap.
 */
export function AccountButton() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const email = user?.email ?? "";
  const initial = (email[0] ?? "?").toUpperCase();
  const close = () => setOpen(false);
  const row =
    "no-min-h flex min-h-12 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-secondary";

  return (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <BottomSheetTrigger asChild>
        {user ? (
          <button
            type="button"
            aria-label={t("shell.account")}
            className="no-min-h simplified-exempt grid h-10 w-10 place-items-center rounded-md bg-primary-fill text-sm font-bold text-primary-fill-foreground hover:bg-primary-fill-hover"
          >
            <span aria-hidden="true">{initial}</span>
          </button>
        ) : (
          <button
            type="button"
            className="no-min-h simplified-exempt inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-md border border-border px-2.5 text-sm font-bold text-foreground hover:bg-secondary"
          >
            <User className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only lg:not-sr-only">{t("common.navSignIn")}</span>
          </button>
        )}
      </BottomSheetTrigger>
      <BottomSheetContent
        title={t("shell.account")}
        description={email ? t("shell.signedInAs", { email }) : undefined}
        closeLabel={t("shell.close")}
      >
        <div className="flex flex-col gap-2">
          {!user && (
            <Link to="/auth" onClick={close} className={row}>
              <LogIn className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              {t("common.navSignIn")}
            </Link>
          )}
          <Link to="/settings" onClick={close} className={row}>
            <Settings className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            {t("common.navSettings")}
          </Link>
          {user && (
            <button
              type="button"
              onClick={() => {
                close();
                void signOut();
              }}
              className="no-min-h flex min-h-12 items-center gap-3 rounded-xl px-3 text-start font-semibold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              {t("common.navSignOut")}
            </button>
          )}
        </div>
        <nav
          aria-label={t("common.footerAbout")}
          className="mt-4 border-t border-border pt-4 lg:hidden"
        >
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {MORE_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={close}
                  className="no-min-h flex min-h-11 items-center rounded-lg px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/donate"
            onClick={close}
            className="no-min-h mt-3 inline-flex h-10 items-center gap-1.5 rounded-md bg-primary-fill px-4 text-sm font-bold text-primary-fill-foreground hover:bg-primary-fill-hover"
          >
            <Heart className="h-4 w-4" fill="currentColor" aria-hidden="true" />
            {t("common.footerDonate")}
          </Link>
        </nav>
      </BottomSheetContent>
    </BottomSheet>
  );
}
