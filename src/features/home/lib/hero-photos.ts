/**
 * Bronx photos behind "Today in the Bronx", one per day in rotation. Served
 * from /public so visitors' phones never contact the photo sites. Credits are
 * shown on the photo and listed in docs/photo-credits.md; CC BY-SA photos are
 * resized copies, shared under the same license.
 */
import { BRONX_PHOTOS, type BronxPhoto } from "@/features/photos";

export type HeroPhoto = BronxPhoto;

export const HERO_PHOTOS: HeroPhoto[] = [
  BRONX_PHOTOS["el-train"],
  BRONX_PHOTOS["grand-concourse"],
  BRONX_PHOTOS["arthur-ave-fair"],
  BRONX_PHOTOS["botanical-garden"],
];

/** Today's photo: the same for everyone on a given New York date. */
export function heroPhotoFor(isoDate: string): HeroPhoto {
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = Math.floor(Date.UTC(y!, (m ?? 1) - 1, d ?? 1) / 86_400_000);
  return HERO_PHOTOS[day % HERO_PHOTOS.length]!;
}
