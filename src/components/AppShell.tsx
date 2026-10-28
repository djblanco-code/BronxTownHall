import { useI18n } from "@/lib/i18n-context";
import { LanguageSelector } from "./LanguageSelector";
import { TextSizeControl } from "@/lib/text-size";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home as HomeIcon, Star, Bell, Settings as SettingsIcon, LogIn, LogOut, User as UserIcon, ListPlus, Briefcase, Inbox, Map as MapIcon, Calendar, LayoutGrid, Newspaper } from "lucide-react";
import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SosFab } from "./SosFab";
import { useSimplifiedMode } from "@/lib/simplified-mode";
import { CoachMark } from "./CoachMark";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const simplified = useSimplifiedMode();
  const tab = (to: string, label: string, Icon: typeof HomeIcon) => {
    const active = to === "/" ? path === "/" : path.startsWith(to);
    return (
      <Link
        to={to}
        aria-current={active ? "page" : undefined}
        className={`no-min-h flex flex-col items-center justify-center gap-0.5 flex-1 ${simplified ? "min-h-[64px] text-sm font-semibold py-2" : "min-h-[56px] text-xs font-medium"} ${active ? "text-primary" : "text-muted-foreground"}`}
      >
        <Icon className={`${simplified ? "h-7 w-7" : "h-5 w-5"} ${active ? "fill-current" : ""}`} aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  };
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <div role="status" aria-live="polite" className="bg-warning text-warning-foreground text-center text-xs sm:text-sm px-3 py-2 font-medium">
        {t("prototypeBanner")}
      </div>
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="no-min-h flex items-center gap-2 group min-w-0" aria-label={`${t("appName")} — home`}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground shadow-sm shrink-0" aria-hidden="true">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-foreground group-hover:text-primary transition truncate">{t("appName")}</span>
          </Link>
          <nav aria-label={t("interface.navSecondary")} className="hidden md:flex items-center gap-1 ms-2">
            <Link to="/digest" className="no-min-h inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary"><Newspaper className="h-3.5 w-3.5" aria-hidden="true" /> This Week</Link>
            <Link to="/map" className="no-min-h inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary"><MapIcon className="h-3.5 w-3.5" aria-hidden="true" /> {t("common.navMap")}</Link>
            <Link to="/lists" className="no-min-h inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary"><ListPlus className="h-3.5 w-3.5" aria-hidden="true" /> {t("common.navLists")}</Link>
            <Link to="/pro" className="no-min-h inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary"><Briefcase className="h-3.5 w-3.5" aria-hidden="true" /> {t("common.navPro")}</Link>
            <Link to="/request-resource" className="no-min-h inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary"><Inbox className="h-3.5 w-3.5" aria-hidden="true" /> {t("common.navRequest")}</Link>
          </nav>
          <div className="hidden sm:flex items-center gap-2">
            <TextSizeControl />
            <CoachMark storageKey="bronx.coach.language.v1" message={t("common.coachLanguage")} placement="below-end" delay={150}>
              <LanguageSelector compact />
            </CoachMark>
            {user ? (
              <button
                onClick={() => signOut()}
                aria-label={`${t("common.navSignOut")} ${user.email ?? ""}`}
                className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-medium hover:bg-secondary min-h-[44px]"
              >
                <UserIcon className="h-4 w-4" aria-hidden="true" />
                <span>{t("common.navSignOut")}</span>
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : (
              <Link to="/auth" className="no-min-h inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 min-h-[44px]">
                <LogIn className="h-4 w-4" aria-hidden="true" /> {t("common.navSignIn")}
              </Link>
            )}
          </div>
        </div>
        <div className="sm:hidden border-t border-border px-4 py-2 bg-card flex flex-wrap items-center justify-between gap-2">
          <CoachMark storageKey="bronx.coach.language.v1" message={t("common.coachLanguage")} placement="below-start" delay={150}>
            <LanguageSelector compact />
          </CoachMark>
          <TextSizeControl />
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 pb-20 sm:pb-0">{children}</main>
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border flex items-stretch px-2" aria-label={t("interface.navPrimary")}>
        {simplified ? (
          <>
            {tab("/", t("common.navHome"), HomeIcon)}
            {tab("/map", t("common.navMap"), MapIcon)}
            {tab("/buzz", t("common.navEvents"), Calendar)}
            {tab("/search", t("common.navServices"), LayoutGrid)}
          </>
        ) : (
          <>
            {tab("/", t("common.navHome"), HomeIcon)}
            {tab("/map", t("common.navMap"), MapIcon)}
            {tab("/favorites", t("common.navFavorites"), Star)}
            {tab("/buzz", t("common.navBuzz"), Bell)}
            {tab("/settings", t("common.navSettings"), SettingsIcon)}
          </>
        )}
      </nav>
      <footer className="hidden sm:block border-t border-border bg-card mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-bold mb-2">{t("appName")}</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><Link to="/about" className="no-min-h hover:text-primary">{t("common.footerAbout")}</Link></li>
                <li><Link to="/how-to-add" className="no-min-h hover:text-primary">{t("common.footerHowToAdd")}</Link></li>
                <li><Link to="/portal" className="no-min-h hover:text-primary">{t("common.footerListOrg")}</Link></li>
                <li><Link to="/advertise" className="no-min-h hover:text-primary">{t("common.footerAdvertise")}</Link></li>
                <li><Link to="/faq" className="no-min-h hover:text-primary">{t("common.footerFaq")}</Link></li>
                <li><Link to="/contact" className="no-min-h hover:text-primary">{t("common.footerContact")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-2">{t("common.footerLegal")}</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="no-min-h hover:text-primary">{t("common.footerPrivacy")}</Link></li>
                <li><Link to="/terms" className="no-min-h hover:text-primary">{t("common.footerTerms")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-2">{t("common.footerCommunity")}</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><Link to="/events" className="no-min-h hover:text-primary">{t("common.navEvents")}</Link></li>
                <li><Link to="/civic" className="no-min-h hover:text-primary">{t("common.footerYourVoice")}</Link></li>
                <li><Link to="/businesses" className="no-min-h hover:text-primary">{t("common.footerBusinesses")}</Link></li>
                <li><Link to="/creators" className="no-min-h hover:text-primary">{t("common.footerPicks")}</Link></li>
                <li><Link to="/roadmap" className="no-min-h hover:text-primary">{t("common.footerStartBusiness")} <span className="text-[10px] font-bold text-warning">{t("common.footerSoon")}</span></Link></li>
                <li><Link to="/urgent" className="no-min-h hover:text-primary">{t("common.footerUrgent")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-2">{t("common.footerSupport")}</h3>
              <Link to="/donate" className="no-min-h inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold shadow hover:opacity-90">
                <Heart className="h-4 w-4" fill="currentColor" /> {t("common.footerDonate")}
              </Link>
            </div>
          </div>
          <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
            {t("footer")}
          </div>
        </div>
      </footer>
      <SosFab />
    </div>
  );
}
