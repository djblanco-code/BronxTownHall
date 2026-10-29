import { Link, useRouterState } from "@tanstack/react-router";
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
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link
          to="/"
          aria-label={`${t("appName")} — ${t("common.navHome")}`}
          className="no-min-h group flex min-w-0 items-center gap-2 lg:shrink-0"
        >
          {/* A text wordmark, like a paper's nameplate; no icon. */}
          <span className="font-display truncate text-lg font-extrabold text-foreground group-hover:underline">
            {t("appName")}
            <span aria-hidden="true" className="text-bronx-orange">
              .
            </span>
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
                  "no-min-h flex h-14 items-center border-b-[3px] px-2.5 pt-[3px] text-sm font-bold whitespace-nowrap",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground hover:border-foreground",
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
