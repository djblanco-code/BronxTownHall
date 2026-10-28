import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { usePersonalization } from "@/lib/personalization";
import { NEED_TO_CATEGORY, useProfile } from "@/lib/onboarding";
import { BronxFactCard } from "@/components/BronxFactCard";
import { DemoTour } from "@/components/DemoTour";
import { ReportModal } from "@/components/ReportModal";
import { SponsoredBanner } from "@/components/SponsoredBanner";
import { useNeighborhood } from "../hooks/use-neighborhood";
import { BROWSABLE_CATEGORIES, featuredCategoryIds } from "../lib/featured-categories";
import { HomeHero } from "./HomeHero";
import { SimplerViewPrompt } from "./SimplerViewPrompt";
import { CategoryGrid } from "./CategoryGrid";
import { DeadlineAlerts } from "./DeadlineAlerts";
import { TodayModule } from "./TodayModule";
import { PicksRow } from "./PicksRow";
import { HelpNowList } from "./HelpNowList";

/**
 * Home is "Today in the Bronx": a greeting and search, any deadline that's
 * coming up, then what's useful right now (open tonight, events today and
 * this weekend), categories, and picks from what this phone has browsed.
 * Urgent help, the daily fact and feedback follow. Nothing opens on top of
 * the page when it loads.
 */
export function HomeScreen() {
  const { t } = useI18n();
  const { favorites, topCategories } = usePersonalization();
  const profile = useProfile();
  const [neighborhood, setNeighborhood] = useNeighborhood();
  const [showReport, setShowReport] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  // The guided tour is a demo tool: reachable at /?tour=1 and from /pitch,
  // but it never competes for a resident's attention on arrival.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tour") === "1") setTourOpen(true);
  }, []);

  const featuredIds = useMemo(
    () =>
      featuredCategoryIds({
        favoriteIds: favorites,
        topCategories,
        needCategories: profile.userNeeds.map((n) => NEED_TO_CATEGORY[n]),
      }),
    [favorites, topCategories, profile.userNeeds],
  );
  const featured = featuredIds
    .map((id) => BROWSABLE_CATEGORIES.find((c) => c.id === id))
    .filter((c) => c !== undefined);
  const more = BROWSABLE_CATEGORIES.filter((c) => !featuredIds.includes(c.id));

  return (
    <AppShell>
      <HomeHero neighborhood={neighborhood} onNeighborhoodChange={setNeighborhood} />
      <SimplerViewPrompt />
      <DeadlineAlerts />
      <TodayModule neighborhood={neighborhood || null} />
      <CategoryGrid featured={featured} more={more} />
      <PicksRow />
      <HelpNowList />

      <div className="mx-auto mt-8 max-w-5xl px-4">
        <BronxFactCard compact />
      </div>

      <SponsoredBanner />

      <section className="mx-auto mt-8 max-w-5xl px-4">
        <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4">
          <MessageCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{t("home.feedbackTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("home.feedbackBody")}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="no-min-h h-10 shrink-0 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-background"
          >
            {t("home.feedbackCta")}
          </button>
        </div>
      </section>

      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      {tourOpen && <DemoTour onClose={() => setTourOpen(false)} />}
    </AppShell>
  );
}
