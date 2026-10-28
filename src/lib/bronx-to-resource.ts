/**
 * Bridge: turn a master-database listing (`bronx_resources`) into the same
 * `Resource` shape the rest of the app renders, so every listing in a category
 * uses ONE card component regardless of whether it was hand-written in
 * `data.ts`, submitted by an organization, or bulk-imported from a dataset.
 *
 * Provenance (`source`, `source_url`) is intentionally NOT surfaced here for
 * the public card — it stays an admin/audit field.
 */
import type { Category, Resource } from "./data";
import type { Lang } from "./i18n";
import type { BronxResource } from "./bronx-resources";
import type { VerificationStatus } from "./verification";
import { toAvailabilityStatus } from "./availability";
import { SUBCATEGORIES_BY_CATEGORY } from "./subcategories";

export type ImportedResource = Resource & {
  __imported: {
    id: string;
    status: VerificationStatus;
    lastVerified: string | null;
    source: string | null;
    website: string | null;
    zip: string | null;
    listingType: "service" | "business";
  };
};

const txt = (s: string): Record<Lang, string> => ({ en: s, es: s, fr: s, bn: s, ar: s });

/** Master-database category ids → the app's top-level category. */
const CATEGORY_MAP: Record<string, Category> = {
  food_pantry: "food",
  community_meal: "food",
  soup_kitchen: "food",
  snap_center: "food",
  government_benefits: "food",
  restaurants_dining: "food",
  healthcare: "health",
  housing: "housing",
  jobs: "jobs",
  legal: "legal",
  education: "education",
  childcare: "childcare",
  youth: "youth",
  immigration: "legal",
  small_business: "services",
  services: "services",
  retail: "retail",
  recreation: "nature",
  nature: "nature",
  art: "art",
  community_events: "events",
};

export function topCategoryFor(resourceCategory: string): Category {
  const key = (resourceCategory ?? "").toLowerCase();
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  if (key.startsWith("snap") || key.startsWith("benefit") || key.includes("food")) return "food";
  return "food";
}

/**
 * Map an imported record onto the Food subcategory pills
 * (pantry / meals / grocery / delivery / nutrition / dining).
 * Anything we can't confidently place defaults to "pantry" — the most common
 * type — rather than creating a parallel taxonomy.
 */
export function foodSubcategoryFor(
  r: Pick<BronxResource, "resource_category" | "resource_subcategory" | "description">,
): string {
  if (r.resource_category === "restaurants_dining") return "dining";
  const hay = [r.resource_category, r.resource_subcategory, r.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Farmers markets, community gardens giving away produce, and health-food
  // focused grocery resources. Nutrition classes alone no longer belong here.
  if (
    /farmers? ?market|greenmarket|farm stand|produce stand|mobile market|community garden|garden .*produce|health food|farm share|csa\b/.test(
      hay,
    )
  ) {
    return "farmers";
  }
  // Only nonprofit/senior home-delivered meal programs belong here — never
  // commercial delivery apps (Uber Eats, DoorDash, Grubhub, etc.).
  if (/uber eats|doordash|grubhub|seamless|instacart|postmates/.test(hay)) return "pantry";
  if (
    /home[- ]?deliver|meals on wheels|citymeals|homebound|deliver\w*\s+(?:hot\s+)?meals?/.test(hay)
  )
    return "delivery";
  if (/soup kitchen|community meal|prepared meal|hot meal|congregate/.test(hay)) return "meals";
  if (/grocer|market|produce|snap|ebt|benefit/.test(hay)) return "grocery";
  return "pantry";
}

/**
 * Map a Jobs listing onto the Jobs subcategory pills
 * (internships / training / finding / self). Anything we can't place
 * confidently defaults to "finding" — the broadest bucket.
 */
export function jobsSubcategoryFor(r: {
  resource_subcategory?: string | null;
  description?: string | null;
}): string {
  const hay = [r.resource_subcategory, r.description].filter(Boolean).join(" ").toLowerCase();
  if (/intern|fellowship|summer youth|youth employ/.test(hay)) return "internships";
  if (
    /training|apprentice|certification|certificate|workforce development|upskill|bootcamp|vocational|ged|credential/.test(
      hay,
    )
  )
    return "training";
  if (
    /self-employ|entrepreneur|small business|start a business|freelanc|business development|vendor|licens/.test(
      hay,
    )
  )
    return "self";
  return "finding";
}

/**
 * Map an Education listing onto the three life-stage pills
 * (k12 / adult / college). Falls back to "k12" — the most common audience.
 */
export function educationSubcategoryFor(r: {
  resource_subcategory?: string | null;
  description?: string | null;
}): string {
  const hay = [r.resource_subcategory, r.description].filter(Boolean).join(" ").toLowerCase();
  if (/college|university|fafsa|financial aid|scholarship|cuny|suny|higher ed|degree/.test(hay))
    return "college";
  if (
    /\besl\b|english as a second|\bged\b|adult (?:education|literacy|basic)|hse|citizenship class|adult learner/.test(
      hay,
    )
  )
    return "adult";
  return "k12";
}

/**
 * Map a Housing listing onto the four Housing pills
 * (emergency / prevention / lottery / rights). Anything we can't place
 * confidently defaults to "prevention" — the broadest bucket.
 */
export function housingSubcategoryFor(r: {
  resource_subcategory?: string | null;
  description?: string | null;
}): string {
  const hay = [r.resource_subcategory, r.description].filter(Boolean).join(" ").toLowerCase();
  if (/shelter|homeless|drop-?in|overnight|transitional|crisis/.test(hay)) return "emergency";
  if (/lottery|housing connect|affordable housing|section 8|affordable unit/.test(hay))
    return "lottery";
  if (
    /tenant rights|eviction|housing court|rent strike|organizing|harassment|repairs|legal/.test(hay)
  )
    return "rights";
  return "prevention";
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Youth pills live in data.ts, not the shared pill table. */
const YOUTH_PILLS: Record<string, string> = {
  employmentinternships: "employment",
  employment: "employment",
  funactivities: "fun",
  fun: "fun",
  mentorshipleadership: "mentorship",
  mentorship: "mentorship",
};

/**
 * An imported row carries a human subcategory label ("Museums & Galleries").
 * Match it to the category's pill id so bulk-imported listings answer the same
 * filter chips as hand-written ones, instead of silently falling through.
 */
export function pillFromLabel(cat: Category, raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const key = norm(raw);
  if (cat === "youth") return YOUTH_PILLS[key];
  const items = SUBCATEGORIES_BY_CATEGORY[cat] ?? [];
  return items.find((s) => norm(s.id) === key || norm(s.label) === key)?.id;
}

/**
 * An imported event row is tagged with the category it belongs to as well
 * ("Nature & Recreation"), so it can cross-list the same way native events do.
 */
export function eventCrossCategory(raw: string | null | undefined): Category | undefined {
  const key = norm(raw ?? "");
  const map: Record<string, Category> = {
    art: "art",
    naturerecreation: "nature",
    jobs: "jobs",
    health: "health",
    governmentcivic: "government",
    farmersmarkethealthfoods: "food",
    education: "education",
    youth: "youth",
  };
  return map[key];
}

/** Subcategory pill for any top-level category (falls back to none). */
function subcategoryFor(r: BronxResource, cat: Category): string | undefined {
  const direct = pillFromLabel(cat, r.resource_subcategory);
  if (direct) return direct;
  if (cat === "food") return foodSubcategoryFor(r);
  if (cat === "jobs") return jobsSubcategoryFor(r);
  if (cat === "education") return educationSubcategoryFor(r);
  if (cat === "housing") return housingSubcategoryFor(r);
  return undefined;
}

/** Dietary chips we can honestly infer from the source text. */
function dietaryFor(r: BronxResource): string[] {
  const hay =
    `${r.resource_subcategory ?? ""} ${r.description ?? ""} ${r.organization_name}`.toLowerCase();
  const out: string[] = [];
  if (hay.includes("halal")) out.push("halal");
  if (hay.includes("kosher")) out.push("kosher");
  if (hay.includes("vegetarian")) out.push("vegetarian");
  return out;
}

/**
 * Being listed in a public dataset is not the same as us confirming a listing.
 * Only a real human verification (recorded with a date) counts.
 */
function statusFor(r: BronxResource): { status: VerificationStatus; lastVerified: string | null } {
  const manual =
    r.verification_method === "manual" ||
    r.verification_method === "call" ||
    r.verification_method === "visit";
  if (manual && r.last_verified)
    return { status: "verified_by_bronx_app", lastVerified: r.last_verified };
  return { status: "needs_verification", lastVerified: null };
}

/**
 * One clean address line. Imported rows often already carry the ZIP inside the
 * address string, so only append `zip_code` when it isn't there yet.
 */
export function formatAddress(address: string | null, zip: string | null): string {
  const line = (address ?? "").trim().replace(/[,\s]+$/, "");
  const z = (zip ?? "").trim();
  if (!z) return line;
  if (!line) return z;
  if (new RegExp(`\\b${z.replace(/[^\d]/g, "")}\\b`).test(line)) return line;
  return `${line}, ${z}`;
}

export function bronxToResource(r: BronxResource): ImportedResource {
  const name =
    r.resource_name && r.resource_name !== r.organization_name
      ? `${r.organization_name} — ${r.resource_name}`
      : r.organization_name;

  const listingType = r.listing_type === "business" ? "business" : "service";

  const summary =
    (r.description ?? "").trim() ||
    [r.resource_subcategory, r.neighborhood].filter(Boolean).join(" · ") ||
    (listingType === "business"
      ? "Local Bronx business."
      : "Community resource for Bronx residents.");

  const { status, lastVerified } = statusFor(r);
  const cat = topCategoryFor(r.resource_category);

  return {
    id: `bx-${r.id}`,
    category: cat,
    subcategory: subcategoryFor(r, cat),
    name: txt(name),
    description: txt(summary),
    address: formatAddress(r.address, r.zip_code),
    phone: r.phone ?? "",
    hours: txt((r.hours ?? "").trim() || "Call for hours"),
    distance: -1, // unknown until geocoded — the card omits the badge
    free: listingType !== "business",
    openNow: false,
    requirements: r.eligibility ? txt(r.eligibility) : undefined,
    languages: r.languages ?? [],
    dietary: dietaryFor(r),
    neighborhood: r.neighborhood ?? undefined,
    website: r.website ?? undefined,
    applicationLink: r.application_url ?? undefined,
    howToApply: r.how_to_apply ?? undefined,
    availabilityStatus: toAvailabilityStatus(r.availability_status),
    insuranceAccepted: r.insurance_accepted ?? undefined,
    eventDate: r.event_date ?? undefined,
    eventEndDate: r.event_end_date ?? undefined,
    eventTime: r.event_time ?? undefined,
    reviews: [],
    __imported: {
      id: r.id,
      status,
      lastVerified,
      source: r.source,
      website: r.website,
      zip: r.zip_code,
      listingType,
    },
  };
}
