/**
 * Non-specific / virtual address handling.
 *
 * Some listings are programs, not places: "Various Bronx locations",
 * "Citywide (virtual)", "Multiple sites". For those we must never show a
 * calculated distance or a map pin, and we must never
 * pass the string to a maps app as a destination.
 */

const NON_SPECIFIC_PATTERNS = [
  /\bvarious\b/i,
  /\bmultiple\b/i,
  /\bseveral\b/i,
  /\bcitywide\b/i,
  /\bborough[- ]?wide\b/i,
  /\bvirtual\b/i,
  /\bonline\b/i,
  /\bremote\b/i,
  /\bhybrid\b/i,
  /\bvaries\b/i,
  /\bvarying\b/i,
  /\btbd\b/i,
  /\bby appointment\b/i,
  /\bby phone\b/i,
  /call from any phone/i,
  /\bmobile unit\b/i,
  /\bno fixed\b/i,
];

/**
 * True when an address cannot be mapped to one physical point.
 * Also true for bare city/borough strings with no street number or ZIP
 * (e.g. "Bronx, NY").
 */
export function isNonSpecificAddress(address?: string | null): boolean {
  const s = (address ?? "").trim();
  if (!s) return true;
  if (NON_SPECIFIC_PATTERNS.some((re) => re.test(s))) return true;
  const hasZip = /\b\d{5}\b/.test(s);
  // A street number anywhere in the address ("Hostos College, 500 Grand Concourse").
  const hasStreetNumber = /\b\d{1,5}\b/.test(s);
  const hasIntersection = /\s(&|and|at)\s/i.test(s.split(",")[0] ?? "");
  // A single named venue is one mappable place even without a street number
  // ("Van Cortlandt Park, Bronx, NY"). Plural/vague forms are caught above.
  const namedVenue =
    /\b(park|campus|college|university|library|stadium|plaza|garden|museum|hospital|center|centre|school|market|zoo)\b/i.test(
      s,
    );
  return !hasZip && !hasStreetNumber && !hasIntersection && !namedVenue;
}

/** Label shown in place of a distance for non-specific locations. */
export const LOCATION_VARIES_LABEL = "Location varies — check details";
