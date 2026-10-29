/**
 * Bronx photos behind "Today in the Bronx", one per day in rotation. Served
 * from /public so visitors' phones never contact the photo sites. Credits are
 * shown on the photo and listed in docs/photo-credits.md; CC BY-SA photos are
 * resized copies, shared under the same license.
 */
export type HeroPhoto = {
  slug: string;
  /** What the photo shows, for screen readers. English-only, like the credit. */
  alt: string;
  credit: string;
  license: string;
  source: string;
  /** Where the eye should stay when the photo is cropped (CSS object-position). */
  focus: string;
};

export const HERO_PHOTOS: HeroPhoto[] = [
  {
    slug: "el-train",
    alt: "The elevated subway over Jerome Avenue",
    credit: "Sashimi-b",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Jerome_Avenue_elevated_line.jpg",
    focus: "50% 40%",
  },
  {
    slug: "grand-concourse",
    alt: "The Grand Concourse on a summer day",
    credit: "Andre Carrotflower",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Grand_Concourse,_Bronx_-_20220616.jpg",
    focus: "50% 60%",
  },
  {
    slug: "arthur-ave-fair",
    alt: "A street fair at 187th Street and Arthur Avenue",
    credit: "Bigtimepeace",
    license: "Public domain",
    source:
      "https://commons.wikimedia.org/wiki/File:Bronx_Street_Fair,_187th_and_Arthur_Avenue.JPG",
    focus: "50% 55%",
  },
  {
    slug: "botanical-garden",
    alt: "Fall colors at the New York Botanical Garden",
    credit: "King of Hearts",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:New_York_Botanical_Garden_October_2016_013.jpg",
    focus: "50% 50%",
  },
];

/** Today's photo: the same for everyone on a given New York date. */
export function heroPhotoFor(isoDate: string): HeroPhoto {
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = Math.floor(Date.UTC(y!, (m ?? 1) - 1, d ?? 1) / 86_400_000);
  return HERO_PHOTOS[day % HERO_PHOTOS.length]!;
}
