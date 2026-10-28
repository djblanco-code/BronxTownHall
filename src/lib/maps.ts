import { isNonSpecificAddress } from "./address";

/**
 * Supported travel modes for native maps.
 * Apple Maps supports: 'd' (drive), 'w' (walk), 'r' (transit)
 * Google Maps supports: 'driving', 'walking', 'transit', 'bicycling'
 */
export type TravelMode = "driving" | "walking" | "transit" | "bicycling";

export interface DirectionsOptions {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  mode?: TravelMode;
  origin?: string;
  originLat?: number | null;
  originLng?: number | null;
}

/**
 * Generates a native maps URL based on the device type.
 * Apple devices get Apple Maps (maps://), others get Google Maps (https://).
 *
 * Logic:
 * 1. Returns null if the address is non-specific (virtual/borough-wide).
 * 2. Uses coordinates for precision if available, fallback to address.
 * 3. Maps generic travel modes to platform-specific flags.
 */
export function getDirectionsUrl(
  options: DirectionsOptions,
  isAppleDevice: boolean,
): string | null {
  const { address, latitude, longitude, mode = "transit", origin, originLat, originLng } = options;

  if (isNonSpecificAddress(address)) {
    return null;
  }

  const destination =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : encodeURIComponent(address);

  const start =
    originLat != null && originLng != null
      ? `${originLat},${originLng}`
      : origin
        ? encodeURIComponent(origin)
        : "";

  if (isAppleDevice) {
    // Apple Maps: https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
    const appleMode = mode === "transit" ? "r" : mode === "walking" ? "w" : "d";
    let url = `maps://maps.apple.com/?daddr=${destination}&dirflg=${appleMode}`;
    if (start) url += `&saddr=${start}`;
    return url;
  }

  // Google Maps: https://developers.google.com/maps/documentation/urls/get-started#directions-action
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${mode}`;
  if (start) url += `&origin=${start}`;
  return url;
}
