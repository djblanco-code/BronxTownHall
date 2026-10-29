import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { TabBar } from "./TabBar";
import { SiteFooter } from "./SiteFooter";
import { FloatingActions } from "./FloatingActions";
import { DemoBanner } from "@/features/demo";

/**
 * Frame for every resident-facing screen. Phones and tablets get the app
 * layout (slim top bar + bottom tabs); desktop (lg+) gets the website layout
 * (links in the top bar, no tabs).
 *
 * Pass a page's floating button as `fab` so it stacks with SOS instead of
 * being positioned by hand.
 */
export function AppShell({ children, fab }: { children: ReactNode; fab?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-[var(--app-tabbar-h)]">
      <TopBar />
      <DemoBanner />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <TabBar />
      <FloatingActions fab={fab} />
    </div>
  );
}
