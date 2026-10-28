import { useI18n } from "@/lib/i18n-context";
import { AVAILABILITY_CLASS, AVAILABILITY_KEYS, type AvailabilityStatus } from "@/lib/availability";

/**
 * Optional capacity badge shown next to Open now / Closed.
 * Renders nothing when a listing has no availability information — an absent
 * badge is more honest than a guessed one.
 */
export function AvailabilityBadge({ status, compact }: { status?: AvailabilityStatus; compact?: boolean }) {
  const { t } = useI18n();
  if (!status) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${AVAILABILITY_CLASS[status]} ${compact ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"}`}
    >
      {t(AVAILABILITY_KEYS[status])}
    </span>
  );
}

/** The small, non-alarming reminder shown near the verification badge. */
export function CallAheadNote({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <p className={`text-[11px] leading-snug text-muted-foreground ${className}`}>{t("listing.callAhead")}</p>
  );
}
