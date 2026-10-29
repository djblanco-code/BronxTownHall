import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n-context";
import { useSimplifiedMode } from "@/lib/simplified-mode";
import { cn } from "@/lib/utils";
import { TABS, isActive } from "../nav";

/**
 * Bottom tab bar for phones and tablets. `data-app-tabbar` is what the
 * `--app-tabbar-h` / `--app-bottom-inset` variables in styles.css key off,
 * so floating UI anywhere in the app clears it without knowing it exists.
 */
export function TabBar() {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const simplified = useSimplifiedMode();

  return (
    <nav
      data-app-tabbar
      aria-label={t("interface.navPrimary")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className={cn("mx-auto flex max-w-xl items-stretch px-1", simplified ? "h-20" : "h-16")}>
        {TABS.map((item) => {
          const active = isActive(item, path);
          return (
            <li key={item.to} className="flex min-w-0 flex-1">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "no-min-h simplified-exempt relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px]",
                  // The active tab is marked by a rule along the top edge, like a section tab.
                  active
                    ? "font-bold text-primary before:absolute before:inset-x-2 before:top-0 before:h-[3px] before:bg-primary"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("grid h-8 w-full max-w-14 place-items-center")}
                >
                  <item.icon
                    className={simplified ? "h-6 w-6" : "h-5 w-5"}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </span>
                <span className="leading-none">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
