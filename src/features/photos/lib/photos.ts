/**
 * Every Bronx photo the app shows, self-hosted in /public/images/bronx as
 * WebP at 800 and 1280 px (docs/design-system.md, "Photos"). Credits are
 * shown on each photo and listed in docs/photo-credits.md; CC BY-SA photos
 * are resized copies shared under the same license.
 */
import type { Category } from "@/lib/data";

export type BronxPhoto = {
  slug: string;
  /** What the photo shows, for screen readers. English-only, like the credit. */
  alt: string;
  credit: string;
  license: string;
  source: string;
  /** Where the eye should stay when the photo is cropped (CSS object-position). */
  focus: string;
};

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

export const BRONX_PHOTOS = {
  "el-train": {
    slug: "el-train",
    alt: "The elevated subway over Jerome Avenue",
    credit: "Sashimi-b",
    license: "CC BY 4.0",
    source: `${COMMONS}Jerome_Avenue_elevated_line.jpg`,
    focus: "50% 40%",
  },
  "grand-concourse": {
    slug: "grand-concourse",
    alt: "The Grand Concourse on a summer day",
    credit: "Andre Carrotflower",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}Grand_Concourse,_Bronx_-_20220616.jpg`,
    focus: "50% 60%",
  },
  "arthur-ave-fair": {
    slug: "arthur-ave-fair",
    alt: "A street fair at 187th Street and Arthur Avenue",
    credit: "Bigtimepeace",
    license: "Public domain",
    source: `${COMMONS}Bronx_Street_Fair,_187th_and_Arthur_Avenue.JPG`,
    focus: "50% 55%",
  },
  "botanical-garden": {
    slug: "botanical-garden",
    alt: "Fall colors at the New York Botanical Garden",
    credit: "King of Hearts",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}New_York_Botanical_Garden_October_2016_013.jpg`,
    focus: "50% 50%",
  },
  courthouse: {
    slug: "courthouse",
    alt: "The Bronx County Courthouse on the Grand Concourse",
    credit: "Sapphire Williams",
    license: "CC0",
    source: `${COMMONS}Bronx_County_Courthouse.jpg`,
    focus: "50% 35%",
  },
  "fordham-road": {
    slug: "fordham-road",
    alt: "Shops on Fordham Road at Arthur Avenue",
    credit: "Joe Mabel",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}Arthur_Avenue_02_-_looking_NNE_across_of_Fordham_Road.jpg`,
    focus: "50% 55%",
  },
  "lincoln-hospital": {
    slug: "lincoln-hospital",
    alt: "Lincoln Hospital on Morris Avenue",
    credit: "Jim.henderson",
    license: "CC0",
    source: `${COMMONS}Lincoln_Hospital_Morris_Av_jeh.jpg`,
    focus: "50% 50%",
  },
  apartments: {
    slug: "apartments",
    alt: "An apartment building on West Fordham Road",
    credit: "Deansfa",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}Apartment_building_on_W_Fordham_Rd_and_University_Ave,_The_Bronx.jpg`,
    focus: "50% 40%",
  },
  hostos: {
    slug: "hostos",
    alt: "The walkway over the Grand Concourse at Hostos Community College",
    credit: "Bigtimepeace",
    license: "Public domain",
    source: `${COMMONS}Hostos_Community_College_pedestrian_walkway.JPG`,
    focus: "50% 40%",
  },
  playground: {
    slug: "playground",
    alt: "A playground in Magenta Playground",
    credit: "RoySmith",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}Magenta_Playground_03.jpg`,
    focus: "50% 55%",
  },
  "crotona-park": {
    slug: "crotona-park",
    alt: "Indian Lake and its bridge in Crotona Park",
    credit: "RoySmith",
    license: "CC BY-SA 4.0",
    source: `${COMMONS}Crotona_Park_Indian_Lake_Bridge_and_Amphitheater.jpg`,
    focus: "50% 55%",
  },
  "bronx-museum": {
    slug: "bronx-museum",
    alt: "The Bronx Museum of the Arts on the Grand Concourse",
    credit: "Jim.henderson",
    license: "Public domain",
    source: `${COMMONS}Bronx_Museum_Art_jeh.JPG`,
    focus: "50% 50%",
  },
} satisfies Record<string, BronxPhoto>;

export type PhotoSlug = keyof typeof BRONX_PHOTOS;

/** The photo at the top of each category page (and its listings). */
const CATEGORY_PHOTOS: Partial<Record<Category, PhotoSlug>> = {
  food: "arthur-ave-fair",
  housing: "apartments",
  health: "lincoln-hospital",
  legal: "courthouse",
  education: "hostos",
  money: "fordham-road",
  childcare: "playground",
  youth: "playground",
  jobs: "fordham-road",
  nature: "crotona-park",
  art: "bronx-museum",
  government: "courthouse",
  events: "arthur-ave-fair",
  retail: "fordham-road",
  services: "fordham-road",
};

export function categoryPhoto(category: string | null | undefined): PhotoSlug {
  return CATEGORY_PHOTOS[category as Category] ?? "grand-concourse";
}
