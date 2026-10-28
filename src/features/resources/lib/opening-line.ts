import { openingStatus, parseHours, type LocalTime } from "@/lib/opening-hours";

export type OpeningLine =
  | { key: "open24h" | "openUntilMidnight" | "openUntilDusk"; open: true }
  | { key: "openUntil"; open: true; time: number }
  | { key: "opensAt"; open: false; time: number };

/** The one-line status under a listing: "Open until 8 PM", "Opens at 3 PM", or nothing when unsure. */
export function openingLine(hours: string | null | undefined, now: LocalTime): OpeningLine | null {
  const status = openingStatus(hours, now);
  if (status.open && status.closesAt != null) {
    const kind = parseHours(hours)?.kind;
    if (kind === "always") return { key: "open24h", open: true };
    // Sunset times are approximate, so parks never claim an exact closing minute.
    if (kind === "daylight") return { key: "openUntilDusk", open: true };
    if (status.closesAt >= 1440) return { key: "openUntilMidnight", open: true };
    return { key: "openUntil", open: true, time: status.closesAt };
  }
  if (status.opensAt != null) return { key: "opensAt", open: false, time: status.opensAt };
  return null;
}
