import { Link, useRouterState } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { TextSizeControl } from "@/lib/text-size";
import { CoachMark } from "@/components/CoachMark";
import { cn } from "@/lib/utils";
import { DESKTOP_NAV, isActive } from "../nav";
import { LanguageButton } from "./LanguageButton";
import { AccountButton } from "./AccountButton";

/**
 * One 56px row on phones: brand, language, account. Text size lives in
 * Settings there; desktop gets the page links and text size inline.
 */
export function TopBar() {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link
          to="/"
          aria-label={`${t("appName")} — ${t("common.navHome")}`}
          className="no-min-h group flex min-w-0 items-center gap-2 lg:shrink-0"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm"
          >
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          <span className="truncate text-base font-bold text-foreground transition group-hover:text-primary">
            {t("appName")}
          </span>
        </Link>

        <nav
          aria-label={t("interface.navSecondary")}
          className="ms-2 hidden items-center gap-1 lg:flex"
        >
          {DESKTOP_NAV.map((item) => {
            const active = isActive(item, path);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "no-min-h whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium hover:bg-secondary",
                  active ? "text-primary" : "text-foreground",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          {/* Wrapped: TextSizeControl's own inline-flex would override `hidden`. */}
          <div className="hidden lg:block">
            <TextSizeControl />
          </div>
          <CoachMark
            storageKey="bronx.coach.language.v1"
            message={t("common.coachLanguage")}
            placement="below-end"
            delay={150}
          >
            <LanguageButton />
          </CoachMark>
          <AccountButton />
        </div>
      </div>
    </header>
  );
}
