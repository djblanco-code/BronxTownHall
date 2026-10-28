// Approximate centroids for Bronx ZIPs. Good enough for sort-by-distance UX.
export const ZIP_LATLNG: Record<string, [number, number]> = {
  "10451": [40.819, -73.927],
  "10452": [40.838, -73.921],
  "10453": [40.852, -73.913],
  "10454": [40.805, -73.917],
  "10455": [40.815, -73.907],
  "10456": [40.83, -73.907],
  "10457": [40.846, -73.9],
  "10458": [40.861, -73.888],
  "10459": [40.825, -73.893],
  "10460": [40.84, -73.879],
  "10461": [40.847, -73.84],
  "10462": [40.844, -73.86],
  "10463": [40.88, -73.906],
  "10464": [40.87, -73.787],
  "10465": [40.823, -73.819],
  "10466": [40.89, -73.844],
  "10467": [40.878, -73.87],
  "10468": [40.866, -73.898],
  "10469": [40.872, -73.847],
  "10470": [40.898, -73.87],
  "10471": [40.898, -73.901],
  "10472": [40.829, -73.87],
  "10473": [40.819, -73.857],
  "10474": [40.811, -73.882],
  "10475": [40.872, -73.829],
};

function haversine(a: [number, number], b: [number, number]) {
  const R = 3958.8; // miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function zipDistanceMiles(fromZip: string, toZip: string): number | null {
  const a = ZIP_LATLNG[fromZip];
  const b = ZIP_LATLNG[toZip];
  if (!a || !b) return null;
  return Math.round(haversine(a, b) * 10) / 10;
}

const ZIP_RE = /\b(104\d\d)\b/;
export function extractZip(address: string): string | null {
  const m = ZIP_RE.exec(address);
  return m ? m[1] : null;
}

export function distanceFromUser(
  userZip: string | null | undefined,
  address: string,
  fallback: number,
): number {
  if (!userZip) return fallback;
  const z = extractZip(address);
  if (!z) return fallback;
  const d = zipDistanceMiles(userZip, z);
  return d == null ? fallback : d;
}

/** Straight-line miles between two coordinate pairs. */
export function haversineMiles(a: [number, number], b: [number, number]): number {
  return haversine(a, b);
}

/**
 * Distance from live coordinates to a listing, using the listing's own
 * coordinates when we have them and its ZIP centroid otherwise. Returns null
 * when the listing's position is unknown, so callers can keep their fallback.
 */
export function distanceFromCoords(
  from: [number, number],
  address: string,
  to?: [number, number] | null,
): number | null {
  const target =
    to ?? (extractZip(address) ? ZIP_LATLNG[extractZip(address) as string] : undefined);
  if (!target) return null;
  return Math.round(haversine(from, target) * 10) / 10;
}
