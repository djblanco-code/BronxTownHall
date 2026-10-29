// Local-storage-backed business / event store for Bronx Town Hall prototype.
// All data is client-side only — for demonstration to partners and funders.

import { Category, MinorEligibility, YouthSubcategory } from "./data";

export type Tier = "free" | "premium";

export type ConnectedAccounts = {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
};

export type DayHours = { open: boolean; from: string; to: string };
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type DayKey = (typeof DAYS)[number];

export type BusinessEvent = {
  id: string;
  businessId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  description: string;
  status: "pending" | "approved";
  createdAt: number;
};

export type BusinessVideoCategory = "products" | "storefront" | "events" | "behind_the_scenes";
export type BusinessVideo = {
  id: string;
  url: string; // signed playback URL
  storagePath: string; // path in the storage bucket
  thumbnailUrl?: string;
  caption?: string;
  category: BusinessVideoCategory;
  durationSec?: number;
  sizeBytes?: number;
  createdAt: number;
};

export type Business = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  hours: Record<DayKey, DayHours>;
  category: Category | "faith" | "other";
  subcategory: string;
  description: string;
  minorEligibility?: MinorEligibility;
  restrictionsNote?: string;
  crossPostToJobs?: boolean;
  youthSubcategory?: YouthSubcategory;
  tier: Tier;
  verified: boolean;
  status: "pending" | "live";
  connected: ConnectedAccounts;
  analytics: { views: number; calls: number; directions: number };
  createdAt: number;
  // Cultural / accessibility attributes (optional)
  ownership?: string[];
  heritage?: string[];
  dietary?: string[];
  languages?: string[];
  accessibility?: string[];
  // Uploaded photos (data URLs). First entry is treated as the profile photo.
  photos?: string[];
  // Storefront photo (data URL) — required for verification, ≥ 720×720
  storefrontPhoto?: string;
  // Short videos hosted in Supabase Storage (business-media bucket)
  videos?: BusinessVideo[];
};

const BKEY = "bx-businesses";
const EKEY = "bx-bevents";
const SKEY = "bx-bsession";

const isB = () => typeof window !== "undefined";

export function getBusinesses(): Business[] {
  if (!isB()) return [];
  try {
    return JSON.parse(localStorage.getItem(BKEY) || "[]");
  } catch {
    return [];
  }
}
let suppressPush = false;
/** Used by the cloud sync layer when writing rows pulled FROM the cloud. */
export function withoutPush(fn: () => void) {
  suppressPush = true;
  try {
    fn();
  } finally {
    suppressPush = false;
  }
}
export function saveBusinesses(list: Business[]) {
  if (!isB()) return;
  const before = new Map(getBusinesses().map((b) => [b.id, JSON.stringify(b)]));
  localStorage.setItem(BKEY, JSON.stringify(list));
  if (suppressPush) return;
  const changed = list.filter((b) => before.get(b.id) !== JSON.stringify(b));
  if (changed.length) {
    void import("./business-sync").then((m) => m.pushBusinesses(changed));
  }
}
export function getEvents(): BusinessEvent[] {
  if (!isB()) return [];
  try {
    return JSON.parse(localStorage.getItem(EKEY) || "[]");
  } catch {
    return [];
  }
}
export function saveEvents(list: BusinessEvent[]) {
  if (!isB()) return;
  const before = new Map(getEvents().map((e) => [e.id, JSON.stringify(e)]));
  localStorage.setItem(EKEY, JSON.stringify(list));
  if (suppressPush) return;
  const changed = list.filter((e) => before.get(e.id) !== JSON.stringify(e));
  if (changed.length) {
    void import("./business-sync").then((m) => changed.forEach(m.pushBusinessEvent));
  }
}
export function getSessionId(): string | null {
  if (!isB()) return null;
  return localStorage.getItem(SKEY);
}
export function setSession(id: string | null) {
  if (!isB()) return;
  if (id) localStorage.setItem(SKEY, id);
  else localStorage.removeItem(SKEY);
}

/** Only approved ("live") listings are shown to residents. */
export function isLiveBusiness(b: Business) {
  return b.status === "live";
}
export function getCurrentBusiness(): Business | null {
  const id = getSessionId();
  if (!id) return null;
  return getBusinesses().find((b) => b.id === id) || null;
}
export function upsertBusiness(b: Business) {
  const list = getBusinesses();
  const i = list.findIndex((x) => x.id === b.id);
  if (i >= 0) list[i] = b;
  else list.push(b);
  saveBusinesses(list);
  void import("./business-sync").then((m) => m.pushBusiness(b));
}
export function deleteBusiness(id: string) {
  saveBusinesses(getBusinesses().filter((b) => b.id !== id));
  saveEvents(getEvents().filter((e) => e.businessId !== id));
  void import("./business-sync").then((m) => m.removeBusinessRemote(id));
}

export function eventsForBusiness(id: string) {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
  return getEvents().filter((e) => e.businessId === id && e.createdAt >= yearStart);
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export const SUBCATEGORIES: Record<string, string[]> = {
  food: [
    "Food Pantry / Free Meal",
    "Grocery Store",
    "Bodega",
    "Supermarket",
    "Restaurant",
    "Bakery",
    "Cafe",
  ],
  health: ["Clinic", "Hospital", "Pharmacy", "Mental Health", "Dental", "Urgent Care", "Home Care"],
  legal: ["Free Legal Aid", "Low-Cost Legal", "Mediation", "Notary", "Immigration Services"],
  jobs: ["Job Placement", "Internships", "Resume Help", "Job Training", "Career Counseling"],
  childcare: ["Daycare", "Pre-K", "After-School Program", "Early Childhood Center"],
  youth: ["Fun & Activities", "Employment & Internships", "Mentorship & Leadership"],
  government: ["Community Board", "Elected Official Office", "Government Agency", "Non-Profit"],
  faith: ["Church", "Mosque", "Temple", "Religious Organization"],
  other: ["General Business", "Community Organization"],
};

export const CATEGORY_OPTIONS: { id: keyof typeof SUBCATEGORIES; label: string }[] = [
  { id: "food", label: "Food" },
  { id: "health", label: "Health" },
  { id: "legal", label: "Legal" },
  { id: "jobs", label: "Jobs" },
  { id: "childcare", label: "Childcare" },
  { id: "youth", label: "Youth" },
  { id: "government", label: "Civic" },
  { id: "faith", label: "Faith" },
  { id: "other", label: "Other" },
];

export function defaultHours(): Record<DayKey, DayHours> {
  return DAYS.reduce(
    (acc, d) => {
      acc[d] = { open: d !== "Sun", from: "09:00", to: "17:00" };
      return acc;
    },
    {} as Record<DayKey, DayHours>,
  );
}

export function whatsappShareLink(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildShareMessage(businessName: string, title: string, body: string, link: string) {
  return `${businessName} — ${title}\n\n${body}\n\nView full details in Bronx Town Hall: ${link}\n\nDownload Bronx Town Hall for free: https://thebronxapp.example`;
}
