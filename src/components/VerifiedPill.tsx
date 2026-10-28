import { CalendarCheck, HelpCircle, Users } from "lucide-react";
import {
  freshnessOf,
  isVerified,
  verifyEveryDaysFor,
  type VerificationStatus,
} from "@/lib/verification";
import { useI18n } from "@/lib/i18n-context";

/**
 * VerifiedPill — the trust signal on every listing.
 *
 * It reflects real records only. A listing with no `lastVerified` timestamp
 * shows "Not yet verified" rather than a green badge, because an unverifiable
 * claim of verification is worse than no claim at all.
 */
export function VerifiedPill({
  status = "needs_verification",
  lastVerified,
  category,
  verifyEveryDays,
  source,
  compact = false,
}: {
  status?: VerificationStatus;
  lastVerified?: Date | string | null;
  category?: string;
  verifyEveryDays?: number;
  source?: string | null;
  compact?: boolean;
}) {
  const { t, lang } = useI18n();
  const cadence = verifyEveryDays ?? verifyEveryDaysFor(category ?? "");
  const fresh = freshnessOf(lastVerified ?? null, cadence);
  // A verification that has aged past its re-check window is no longer a claim
  // we can stand behind — it reverts to "Not yet verified".
  const stale = fresh === "overdue";
  const verified = isVerified(status) && !!lastVerified && !stale;

  let cls = "bg-muted text-muted-foreground";
  let Icon = HelpCircle;
  let label = t("interface.notVerified");

  if (verified) {
    Icon = CalendarCheck;
    const short =
      status === "verified_by_org"
        ? t("interface.confirmedOrg")
        : status === "verified_public_source"
          ? t("interface.publicSource")
          : t("interface.verified");
    const days = Math.max(
      0,
      Math.floor((Date.now() - new Date(lastVerified).getTime()) / 86_400_000),
    );
    const ago =
      days === 0
        ? t("interface.today")
        : days === 1
          ? t("interface.yesterday")
          : days < 7
            ? t("interface.daysAgo", { count: days })
            : days < 30
              ? t("interface.weeksAgo", { count: Math.floor(days / 7) })
              : days < 365
                ? t("interface.monthsAgo", { count: Math.floor(days / 30) })
                : t("interface.yearsAgo", { count: Math.floor(days / 365) });
    label = `${short} · ${ago}`;
    cls =
      fresh === "fresh" ? "bg-success/15 text-foreground" : "bg-warning/20 text-warning-foreground";
  } else if (!stale && status === "community_submitted") {
    Icon = Users;
    label = t("interface.communitySubmitted");
    cls = "bg-accent/20 text-accent-foreground";
  }

  const fullLabel =
    status === "verified_by_org"
      ? t("interface.confirmedOrg")
      : status === "verified_public_source"
        ? t("interface.publicSource")
        : t("interface.verified");
  const title = verified
    ? t("interface.verifiedTitle", {
        label: fullLabel,
        source: source ? ` · ${t("interface.source")}: ${source}` : "",
        date: new Date(lastVerified).toLocaleDateString(lang),
        days: cadence,
      })
    : stale && lastVerified
      ? t("interface.lastCheckedStale", {
          date: new Date(lastVerified).toLocaleDateString(lang),
          days: cadence,
        })
      : status === "community_submitted"
        ? t("interface.verificationCommunity")
        : t("interface.verificationUnknown");

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${cls} ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
      title={title}
    >
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {label}
    </span>
  );
}
