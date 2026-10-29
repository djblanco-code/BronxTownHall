import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/features/shell";
import { usePersonalization } from "@/lib/personalization";
import { NEED_TO_CATEGORY, useProfile } from "@/lib/onboarding";
import { DemoTour } from "@/components/DemoTour";
import { ReportModal } from "@/components/ReportModal";
import { SponsoredBanner } from "@/components/SponsoredBanner";
import { useNeighborhood } from "../hooks/use-neighborhood";
import { BROWSABLE_CATEGORIES, featuredCategoryIds } from "../lib/featured-categories";
import { HomeHero } from "./HomeHero";
import { DeadlineAlerts } from "./DeadlineAlerts";
import { TodayLists } from "./TodayLists";
import { FactOfTheDay } from "./FactOfTheDay";
import { HomeFooter } from "./HomeFooter";
import { TownHallCard } from "./TownHallCard";
import { PicksRow } from "./PicksRow";
import { HelpNowList } from "./HelpNowList";

/**
 * Home is "Today in the Bronx", ordered act now → what's on → extras:
 * search and one-tap needs, any deadline coming up, places open tonight and
 * events this week, the daily fact, who represents you, picks from what this phone has browsed, crisis lines,
 * then feedback, trust links and the Simplified View offer. Nothing opens on top of the page when it
 * loads.
 */
export function HomeScreen() {
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

  return (
    <AppShell>
      <HomeHero
        neighborhood={neighborhood}
        onNeighborhoodChange={setNeighborhood}
        needs={featured}
      />
      <DeadlineAlerts />
      <TodayLists neighborhood={neighborhood || null} />
      <FactOfTheDay />
      <TownHallCard />
      <PicksRow />
      <HelpNowList />
      <SponsoredBanner />
      <HomeFooter onFeedback={() => setShowReport(true)} />

      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      {tourOpen && <DemoTour onClose={() => setTourOpen(false)} />}
    </AppShell>
  );
}
