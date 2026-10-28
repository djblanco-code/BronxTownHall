import { useI18n } from "@/lib/i18n-context";
import { RESOURCES } from "@/lib/data";
import { useNycTime } from "@/lib/opening-hours";
import { usePersonalization } from "@/lib/personalization";
import { rankedInterests } from "@/lib/interest-history";
import { Section } from "@/components/ui/section";
import { ResourceTile } from "@/features/resources";
import { pickedFor } from "../lib/today";
import { CardRow, CardRowItem } from "./CardRow";

/**
 * Listings from the categories this phone has browsed most. Everything it
 * reads stays on the device; hidden when there's no history yet or the
 * visitor turned personalisation off in Settings.
 */
export function PicksRow() {
  const { t } = useI18n();
  const { topCategories, settings } = usePersonalization();
  const now = useNycTime();

  // `now` is null until the page has hydrated, so history is never read on the server.
  const picks =
    now && settings.trackingEnabled
      ? pickedFor(RESOURCES, [...new Set([...rankedInterests(), ...topCategories])], now)
      : [];

  if (picks.length === 0) return null;

  return (
    <Section id="home-picks-title" title={t("home.picksTitle")}>
      <p className="-mt-2 mb-3 text-sm text-muted-foreground">{t("home.picksSub")}</p>
      <CardRow>
        {picks.map((r) => (
          <CardRowItem key={r.id}>
            <ResourceTile resource={r} />
          </CardRowItem>
        ))}
      </CardRow>
    </Section>
  );
}
