import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Star } from "lucide-react";
import { CATEGORIES, type MinorEligibility, type Resource } from "@/lib/data";
import type { Business } from "@/lib/business";
import type { ImportedResource } from "@/lib/bronx-to-resource";
import type { ResourceMeta } from "@/lib/resource-meta";
import { useI18n } from "@/lib/i18n-context";
import { isNonSpecificAddress } from "@/lib/address";
import { formatAgeRange } from "@/lib/age-range";
import { buildResourceScript } from "@/lib/tts-context";
import { cn } from "@/lib/utils";
import { CATEGORY_ICONS } from "../lib/category-icons";
import { openingStatus, useNycTime } from "@/lib/opening-hours";
import { VerifiedPill } from "@/components/VerifiedPill";
import { AvailabilityBadge, CallAheadNote } from "@/components/AvailabilityBadge";
import { AttributeBadges } from "@/components/AttributeBadges";
import { FavoriteStar } from "@/components/FavoriteStar";
import { ListenButton } from "@/components/ListenButton";
import { DirectionsLink } from "@/components/DirectionsLink";
import { PackCheckbox } from "@/components/PackCheckbox";
import { SHOW_CASEWORKER_TOOLS } from "@/lib/first-version";

/**
 * A listing as the app shows it: a seeded resource, a business from the
 * directory (`__biz`), or a row imported from the database (`__imported`).
 * The last two have no detail page.
 */
export type ListingResource = Resource & {
  __biz?: Business;
  __imported?: ImportedResource["__imported"];
};

type ResourceCardProps = {
  resource: ListingResource;
  meta?: ResourceMeta;
  /** "full" adds the description, status badges, notes and attributes (category pages). */
  detail?: "compact" | "full";
  /** Category tile and label, for lists that mix categories (search, favorites, map). */
  showCategory?: boolean;
  /** Offer "add to pack" so several listings can be shared by text at once. */
  selectable?: boolean;
  /** Called when the card is opened, for analytics. */
  onOpen?: () => void;
};

/** The one card every listing screen uses: category, search, favorites and the map list. */
export function ResourceCard({
  resource: r,
  meta,
  detail = "compact",
  showCategory = false,
  selectable = false,
  onOpen,
}: ResourceCardProps) {
  const { t, lang } = useI18n();
  const isBiz = !!r.__biz;
  const imported = r.__imported;
  const name = r.name[lang];
  const locationVaries = isNonSpecificAddress(r.address);
  const category = CATEGORIES.find((c) => c.id === r.category);
  const full = detail === "full";
  const now = useNycTime();

  const distance = locationVaries ? (
    t("interface.locationVaries")
  ) : r.distance >= 0 ? (
    <>
      {r.distance} {t("miles")}
    </>
  ) : null;

  const verified = (
    <VerifiedPill
      status={imported?.status ?? meta?.verification_status ?? "needs_verification"}
      lastVerified={imported?.lastVerified ?? meta?.last_verified ?? null}
      verifyEveryDays={meta?.verify_every_days}
      source={meta?.source ?? undefined}
      category={r.category}
      compact
    />
  );

  const CategoryIcon = CATEGORY_ICONS[r.category];
  const body = (
    <div className="flex items-start gap-3">
      {showCategory && category && (
        <CategoryIcon
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: category.color }}
          aria-hidden="true"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-bold text-foreground group-hover:underline">
          <span className={full ? undefined : "truncate"}>{name}</span>
          {r.__biz?.tier === "premium" && r.__biz.verified && (
            <Check className="h-4 w-4 shrink-0 text-success" />
          )}
        </p>
        {(showCategory || !full) && (
          <p className="truncate text-xs text-muted-foreground">
            {showCategory && category ? t(category.labelKey) : null}
            {showCategory && category && distance ? " · " : null}
            {!full ? distance : null}
          </p>
        )}
        {full && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{r.description[lang]}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {full && <TypeBadge resource={r} />}
          {full && now && openingStatus(r.hours.en, now).open && (
            <Badge cls="bg-primary/15 text-primary">{t("interface.openNow")}</Badge>
          )}
          {full && <AvailabilityBadge status={r.availabilityStatus} compact />}
          {verified}
          {full && <AgeBadge resource={r} />}
        </div>
        {full && <CallAheadNote className="mt-1.5" />}
        {full && lang !== "en" && r.description[lang] === r.description.en && (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {t("interface.fullTranslationSoon")}
          </p>
        )}
        <div className="mt-2">
          <AttributeBadges a={r} max={full ? undefined : 2} />
        </div>
        {full && imported && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {r.address}
            {r.phone && (
              <>
                {" · "}
                <a
                  href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}
                  className="text-primary hover:underline"
                >
                  {r.phone}
                </a>
              </>
            )}
          </p>
        )}
      </div>
      {full && distance && (
        <span
          className={cn(
            "shrink-0 text-end",
            locationVaries
              ? "max-w-[7.5rem] text-xs font-medium text-muted-foreground"
              : "whitespace-nowrap text-sm font-bold text-primary",
          )}
        >
          {distance}
        </span>
      )}
    </div>
  );

  // A ruled row, not a box (docs/design-system.md): stacked cards read as a list.
  const cardClass = "group min-w-0 flex-1";

  return (
    <div className="flex items-stretch gap-2 border-b border-border py-3">
      {isBiz || imported ? (
        <div className={cardClass}>{body}</div>
      ) : (
        <Link
          to="/resource/$id"
          params={{ id: r.id }}
          onClick={onOpen}
          className={cn("no-min-h block", cardClass)}
        >
          {body}
        </Link>
      )}
      <div className="flex flex-col items-center justify-center gap-1.5">
        {!isBiz && <FavoriteStar id={r.id} category={r.category} />}
        <ListenButton
          text={buildResourceScript({
            name,
            address: r.address,
            phone: r.phone,
            hours: r.hours[lang],
            distance: r.distance,
          })}
          title={name}
          style="calm"
        />
        {!locationVaries && (
          <DirectionsLink
            address={r.address}
            label={`${t("interface.directions")}: ${name}`}
            iconOnly
            className="no-min-h h-10 w-10 justify-center rounded-md border border-border hover:border-foreground hover:no-underline"
          />
        )}
        {SHOW_CASEWORKER_TOOLS && selectable && !isBiz && <PackCheckbox id={r.id} label={name} />}
      </div>
    </div>
  );
}

/** What kind of listing this is: premium business, business, government, free, or resource. */
function TypeBadge({ resource: r }: { resource: ListingResource }) {
  const { t } = useI18n();
  if (r.__biz?.tier === "premium") {
    return (
      <Badge cls="bg-warning/20 text-warning">
        <Star className="h-3 w-3" fill="currentColor" /> {t("interface.premium")}
      </Badge>
    );
  }
  if (r.__biz || r.__imported?.listingType === "business") {
    return <Badge cls="bg-muted text-muted-foreground">{t("interface.localBusiness")}</Badge>;
  }
  if (r.category === "government") {
    return <Badge cls="bg-primary/15 text-primary">{t("government")}</Badge>;
  }
  if (r.free) return <Badge cls="bg-success/15 text-success">{t("interface.free")}</Badge>;
  return <Badge cls="bg-secondary text-secondary-foreground">{t("interface.resource")}</Badge>;
}

/**
 * One age tag per listing, from the listing's own data — never derived from
 * which category page it happens to be shown on. Prefers the stated age range
 * ("Ages 14-24"); falls back to the coarse minor-eligibility flag only when no
 * range is recorded.
 */
function AgeBadge({ resource: r }: { resource: ListingResource }) {
  const label = formatAgeRange(r.ageMin, r.ageMax);
  if (label) {
    return (
      <Badge cls="bg-accent/20 text-accent-foreground" title={r.restrictionsNote}>
        {label}
      </Badge>
    );
  }
  const me: MinorEligibility | undefined = r.minorEligibility;
  if (!me) return null;
  if (me === "yes")
    return <Badge cls="bg-success/15 text-success">Open to Minors (Under 18)</Badge>;
  if (me === "no") return <Badge cls="bg-destructive/15 text-destructive">Adults Only (18+)</Badge>;
  return (
    <Badge cls="bg-warning/20 text-warning" title={r.restrictionsNote}>
      Restrictions Apply
    </Badge>
  );
}

function Badge({ children, cls, title }: { children: ReactNode; cls: string; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-bold",
        cls,
      )}
    >
      {children}
    </span>
  );
}
