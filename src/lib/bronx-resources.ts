/**
 * The Bronx App master resource database.
 *
 * Architecture:
 *   SOURCE DATA -> NORMALIZATION -> DEDUPLICATION -> BRONX FILTER
 *   -> VERIFICATION -> MASTER DATABASE -> USER-FACING DIRECTORY
 *
 * Government sites are *sources*, never the app's database. Everything that
 * reaches a user is read from `bronx_resources`, with provenance kept in
 * `bronx_resource_sources` so one organization appearing in three official
 * feeds is still exactly one listing.
 *
 * Nothing here invents data. Missing fields stay null and render as
 * "Information not available."
 */

import { supabase } from "@/integrations/supabase/client";

/* ------------------------------------------------------------------ */
/* Sources                                                             */
/* ------------------------------------------------------------------ */

export type SourceId =
  | "nyc_food_help"
  | "nyc_dycd"
  | "nyc_open_data_snap"
  | "bronx_app_manual"
  | "other";

export type SourceDef = {
  id: SourceId;
  label: string;
  url: string;
  /** Higher wins when two sources disagree (after recency of verification). */
  priority: number;
  access: string;
  covers: string[];
};

export const SOURCES: Record<SourceId, SourceDef> = {
  nyc_food_help: {
    id: "nyc_food_help",
    label: "NYC Food Help",
    url: "https://finder.nyc.gov/foodhelp/locations",
    priority: 90,
    access: "CSV / JSON export from the NYC Food Help finder",
    covers: ["Food pantries", "Soup kitchens", "Community meals", "Emergency food"],
  },
  nyc_dycd: {
    id: "nyc_dycd",
    label: "NYC DYCD Food Pantry Directory",
    url: "https://www.nyc.gov/site/dycd/services/food_pantries.page",
    priority: 80,
    access: "Published directory export (CSV/JSON)",
    covers: ["Food pantry locations", "Provider names", "Addresses", "Phone numbers"],
  },
  nyc_open_data_snap: {
    id: "nyc_open_data_snap",
    label: "NYC Open Data — Directory of SNAP Centers",
    url: "https://data.cityofnewyork.us/Social-Services/Directory-of-SNAP-Centers/tc6u-8rnp",
    priority: 75,
    access: "Socrata Open Data API (tc6u-8rnp)",
    covers: ["SNAP assistance", "EBT support", "HRA locations", "Benefits enrollment"],
  },
  bronx_app_manual: {
    id: "bronx_app_manual",
    label: "Bronx App verification",
    url: "",
    priority: 100,
    access: "Manual entry / phone + email verification by Bronx App staff",
    covers: ["Manually confirmed corrections"],
  },
  other: {
    id: "other",
    label: "Other approved source",
    url: "",
    priority: 40,
    access: "Approved partner feed",
    covers: [],
  },
};

export const SOURCE_IDS = Object.keys(SOURCES) as SourceId[];

export function sourceLabel(id: string | null | undefined): string {
  if (!id) return "Unknown source";
  return SOURCES[id as SourceId]?.label ?? id;
}

/* ------------------------------------------------------------------ */
/* Categories & verification                                           */
/* ------------------------------------------------------------------ */

export type ResourceCategoryRow = {
  id: string;
  domain: string;
  label: string;
  subcategories: string[];
  active: boolean;
  sort_order: number;
};

export type BronxVerificationStatus =
  | "verified"
  | "needs_verification"
  | "temporarily_unverified"
  | "inactive";

export const BRONX_VERIFICATION_LABELS: Record<BronxVerificationStatus, string> = {
  verified: "Verified",
  needs_verification: "Needs verification",
  temporarily_unverified: "Temporarily unverified",
  inactive: "Inactive",
};

/* ------------------------------------------------------------------ */
/* Master record                                                       */
/* ------------------------------------------------------------------ */

export type BronxResource = {
  id: string;
  organization_name: string;
  resource_name: string | null;
  resource_category: string;
  resource_subcategory: string | null;
  address: string | null;
  borough: string;
  neighborhood: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  eligibility: string | null;
  languages: string[];
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string | null;
  source_url: string | null;
  source_record_id: string | null;
  last_verified: string | null;
  verification_status: BronxVerificationStatus;
  verification_method: string | null;
  verification_note: string | null;
  active: boolean;
  listing_type?: "service" | "business" | string | null;
  /** Optional online application (mainly Jobs listings). */
  application_url?: string | null;
  /** Direct next step for applying/enrolling — URL or phone, separate from website/phone. */
  how_to_apply?: string | null;
  /** Optional capacity signal: "accepting" | "waitlist" | "full". */
  availability_status?: string | null;
  /** Optional free-text insurance list (Health listings). */
  insurance_accepted?: string | null;
  /** Specific calendar date for time-bound listings (workshops, giveaways, classes). */
  event_date?: string | null;
  /** Optional final date for multi-day and seasonal listings. */
  event_end_date?: string | null;
  /** Optional start-time text paired with event_date. */
  event_time?: string | null;
  /** Bulk-import flag: an admin must resolve `review_note` before publishing. */
  needs_review?: boolean | null;
  /** What the importer flagged (conflicting address, invalid zip, likely paid, ...). */
  review_note?: string | null;

  merged_into: string | null;
  dedupe_key: string | null;
  created_at: string;
  updated_at: string;
};

export type BronxResourceSource = {
  id: string;
  resource_id: string;
  source: string;
  source_label: string;
  source_url: string | null;
  source_record_id: string | null;
  source_priority: number;
  fields_contributed: string[];
  source_last_seen: string;
};

/** Display helper — never fabricate content. */
export const NOT_AVAILABLE = "Information not available.";
export function shown(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : NOT_AVAILABLE;
}

/* ------------------------------------------------------------------ */
/* Step 1 — Normalization                                              */
/* ------------------------------------------------------------------ */

const FIELD_ALIASES: Record<string, string[]> = {
  organization_name: [
    "organization_name", "organization", "org_name", "provider", "provider_name",
    "agency", "agency_name", "name", "facility_name", "site_name", "sponsor_name",
    "center_name", "snap_center_name", "location_name",
  ],
  resource_name: ["resource_name", "program", "program_name", "service_name", "site", "title"],
  resource_category: ["resource_category", "category", "type", "service_type", "food_type", "location_type"],
  resource_subcategory: ["resource_subcategory", "subcategory", "sub_type", "distribution_model"],
  address: ["address", "street_address", "address1", "address_1", "full_address", "location_address", "street"],
  borough: ["borough", "boro", "boroname", "city", "borough_name"],
  neighborhood: ["neighborhood", "nta", "community", "community_district", "area"],
  zip_code: ["zip_code", "zip", "zipcode", "postcode", "postal_code"],
  phone: ["phone", "phone_number", "telephone", "contact_phone", "phone1", "public_phone"],
  email: ["email", "email_address", "contact_email"],
  website: ["website", "url", "web_site", "site_url", "link", "website_url"],
  hours: ["hours", "hours_of_operation", "open_hours", "schedule", "days_hours", "operation_hours", "distribution_hours"],
  eligibility: ["eligibility", "eligibility_requirements", "requirements", "who_can_apply"],
  languages: ["languages", "language", "languages_spoken", "language_capacity"],
  description: ["description", "notes", "details", "additional_info", "comments", "services"],
  latitude: ["latitude", "lat", "y"],
  longitude: ["longitude", "lon", "lng", "long", "x"],
  source_record_id: ["source_record_id", "record_id", "id", "objectid", "unique_id", "site_id", "facility_id"],
};

const CATEGORY_HINTS: Array<{ match: RegExp; category: string; sub?: string }> = [
  { match: /soup kitchen|community meal|hot meal|congregate/i, category: "community_meal" },
  { match: /emergency food|emergency pantry|food box|disaster/i, category: "emergency_food" },
  { match: /snap|ebt|hra|benefits access center|food stamp/i, category: "snap_ebt" },
  { match: /wic|school meal|application (help|assistance)|benefits (help|screening|enrollment)/i, category: "food_benefits_help" },
  { match: /pantry|food distribution|grocery|cfc/i, category: "food_pantry" },
];

export function slugKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function pick(row: Record<string, unknown>, field: string): string | null {
  const normalized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) normalized[slugKey(k)] = v;
  for (const alias of FIELD_ALIASES[field] ?? [field]) {
    const v = normalized[alias];
    if (v === undefined || v === null) continue;
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (s.trim() && s.trim().toLowerCase() !== "null") return s.trim();
  }
  return null;
}

export function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (digits.length !== 10) return raw.trim() || null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const STREET_ABBR: Array<[RegExp, string]> = [
  [/\bstreet\b/g, "st"], [/\bavenue\b/g, "ave"], [/\bboulevard\b/g, "blvd"],
  [/\broad\b/g, "rd"], [/\bplace\b/g, "pl"], [/\bdrive\b/g, "dr"],
  [/\bconcourse\b/g, "conc"], [/\bparkway\b/g, "pkwy"], [/\bterrace\b/g, "ter"],
  [/\bnorth\b/g, "n"], [/\bsouth\b/g, "s"], [/\beast\b/g, "e"], [/\bwest\b/g, "w"],
];

export function normalizeAddress(raw: string | null): string | null {
  if (!raw) return null;
  let a = raw.toLowerCase().replace(/[.,#]/g, " ").replace(/\s+/g, " ").trim();
  for (const [re, to] of STREET_ABBR) a = a.replace(re, to);
  a = a.replace(/\b(bronx|ny|new york|usa)\b/g, "").replace(/\b1\d{4}\b/g, "").replace(/\s+/g, " ").trim();
  return a || null;
}

/** Step 3 — Bronx filter. A record must positively look like the Bronx. */
export const BRONX_ZIPS = new Set([
  "10451","10452","10453","10454","10455","10456","10457","10458","10459","10460",
  "10461","10462","10463","10464","10465","10466","10467","10468","10469","10470",
  "10471","10472","10473","10474","10475",
]);

export function isBronxRecord(input: { borough?: string | null; zip_code?: string | null; address?: string | null }): boolean {
  const zip = (input.zip_code ?? "").match(/\b\d{5}\b/)?.[0];
  if (zip) return BRONX_ZIPS.has(zip);
  const boro = (input.borough ?? "").toLowerCase();
  if (/bronx|\bbx\b/.test(boro)) return true;
  if (/manhattan|brooklyn|queens|staten/.test(boro)) return false;
  const addr = (input.address ?? "").toLowerCase();
  const addrZip = addr.match(/\b1\d{4}\b/)?.[0];
  if (addrZip) return BRONX_ZIPS.has(addrZip);
  return /\bbronx\b/.test(addr);
}

export type NormalizedRecord = {
  organization_name: string;
  resource_name: string | null;
  resource_category: string;
  resource_subcategory: string | null;
  address: string | null;
  borough: "Bronx";
  neighborhood: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  eligibility: string | null;
  languages: string[];
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  source: SourceId;
  source_url: string | null;
  source_record_id: string | null;
  dedupe_key: string;
  raw: Record<string, unknown>;
};

function inferCategory(row: Record<string, unknown>, fallback: string): string {
  const explicit = pick(row, "resource_category");
  if (explicit) {
    const s = slugKey(explicit);
    if (["food_pantry", "community_meal", "emergency_food", "snap_ebt", "food_benefits_help"].includes(s)) return s;
    for (const hint of CATEGORY_HINTS) if (hint.match.test(explicit)) return hint.category;
  }
  const blob = Object.values(row).map((v) => (typeof v === "string" ? v : "")).join(" ");
  for (const hint of CATEGORY_HINTS) if (hint.match.test(blob)) return hint.category;
  return fallback;
}

/** Step 2 — dedupe key: organization + street address, else org + phone. */
export function buildDedupeKey(orgName: string, address: string | null, phone: string | null): string {
  const org = slugKey(orgName).replace(/_(inc|corp|llc|the|of|and)_/g, "_");
  const addr = normalizeAddress(address);
  if (addr) return `${org}|${slugKey(addr)}`;
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length >= 10) return `${org}|${digits.slice(-10)}`;
  return `${org}|`;
}

export function normalizeRow(
  row: Record<string, unknown>,
  source: SourceId,
  fallbackCategory = "food_pantry",
): NormalizedRecord | null {
  const org = pick(row, "organization_name");
  if (!org) return null;

  const address = pick(row, "address");
  const zipRaw = pick(row, "zip_code");
  const zip = (zipRaw ?? address ?? "").match(/\b\d{5}\b/)?.[0] ?? null;
  const borough = pick(row, "borough");
  if (!isBronxRecord({ borough, zip_code: zip, address })) return null;

  const phone = normalizePhone(pick(row, "phone"));
  const langRaw = pick(row, "languages");
  const lat = Number(pick(row, "latitude"));
  const lon = Number(pick(row, "longitude"));

  return {
    organization_name: org,
    resource_name: pick(row, "resource_name"),
    resource_category: inferCategory(row, fallbackCategory),
    resource_subcategory: pick(row, "resource_subcategory"),
    address,
    borough: "Bronx",
    neighborhood: pick(row, "neighborhood"),
    zip_code: zip,
    phone,
    email: pick(row, "email"),
    website: pick(row, "website"),
    hours: pick(row, "hours"),
    eligibility: pick(row, "eligibility"),
    languages: langRaw ? langRaw.split(/[,;/]/).map((s) => s.trim()).filter(Boolean) : [],
    description: pick(row, "description"),
    latitude: Number.isFinite(lat) && lat !== 0 ? lat : null,
    longitude: Number.isFinite(lon) && lon !== 0 ? lon : null,
    source,
    source_url: pick(row, "website") ? null : SOURCES[source].url || null,
    source_record_id: pick(row, "source_record_id"),
    dedupe_key: buildDedupeKey(org, address, phone),
    raw: row,
  };
}

/* ------------------------------------------------------------------ */
/* Parsers (CSV / JSON)                                                */
/* ------------------------------------------------------------------ */

export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ",") { cur.push(field); field = ""; continue; }
    if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; continue; }
    if (c === "\r") continue;
    field += c;
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (!header) return [];
  return body.map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => { obj[h.trim()] = (r[i] ?? "").trim(); });
    return obj;
  });
}

export function parseJSONRows(text: string): Record<string, unknown>[] {
  const parsed = JSON.parse(text) as unknown;
  if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];
  if (parsed && typeof parsed === "object") {
    for (const v of Object.values(parsed as Record<string, unknown>)) {
      if (Array.isArray(v)) return v as Record<string, unknown>[];
    }
  }
  return [];
}

export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v).replace(/\r?\n/g, " ");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

/* ------------------------------------------------------------------ */
/* Step 4 — Source priority merge                                      */
/* ------------------------------------------------------------------ */

const MERGEABLE_FIELDS = [
  "resource_name", "resource_subcategory", "address", "neighborhood", "zip_code",
  "phone", "email", "website", "hours", "eligibility", "description",
  "latitude", "longitude",
] as const;

/**
 * Decide whether an incoming source may overwrite an existing field.
 *
 * Order: (1) never clobber a value with a blank, (2) fill blanks always,
 * (3) never let an older source overwrite a listing that a human verified
 * more recently, (4) otherwise higher source priority wins.
 */
export function resolveConflicts(
  existing: BronxResource,
  incoming: NormalizedRecord,
): { patch: Record<string, unknown>; fieldsContributed: string[] } {
  const patch: Record<string, unknown> = {};
  const contributed: string[] = [];
  const incomingPriority = SOURCES[incoming.source].priority;
  const existingPriority = SOURCES[(existing.source as SourceId) ?? "other"]?.priority ?? 0;

  // Manually verified within the cadence window outranks any automated feed.
  const manuallyVerified =
    existing.verification_status === "verified" &&
    existing.verification_method === "manual" &&
    existing.last_verified != null;

  for (const field of MERGEABLE_FIELDS) {
    const next = incoming[field];
    if (next === null || next === undefined || next === "") continue;
    const prev = existing[field];
    const prevEmpty = prev === null || prev === undefined || prev === "";
    if (prevEmpty) { patch[field] = next; contributed.push(field); continue; }
    if (manuallyVerified) continue;
    if (incomingPriority >= existingPriority && String(prev) !== String(next)) {
      patch[field] = next;
      contributed.push(field);
    }
  }
  if (incoming.languages.length && existing.languages.length === 0) {
    patch.languages = incoming.languages;
    contributed.push("languages");
  }
  if (!manuallyVerified && incomingPriority >= existingPriority) {
    patch.source = incoming.source;
    patch.source_url = incoming.source_url ?? (SOURCES[incoming.source].url || null);
    patch.source_record_id = incoming.source_record_id;
  }
  return { patch, fieldsContributed: contributed };
}

/* ------------------------------------------------------------------ */
/* Step 5 — Ingestion into the master database                         */
/* ------------------------------------------------------------------ */

export type IngestResult = {
  received: number;
  created: number;
  updated: number;
  merged: number;
  skippedNonBronx: number;
  skippedInvalid: number;
  errors: string[];
};

/** Deduplicate within the incoming batch before touching the database. */
function collapseBatch(records: NormalizedRecord[]): NormalizedRecord[] {
  const byKey = new Map<string, NormalizedRecord>();
  for (const r of records) {
    const prior = byKey.get(r.dedupe_key);
    if (!prior) { byKey.set(r.dedupe_key, r); continue; }
    byKey.set(r.dedupe_key, {
      ...prior,
      ...Object.fromEntries(Object.entries(r).filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))),
    } as NormalizedRecord);
  }
  return [...byKey.values()];
}

export async function ingestRecords(
  rows: Record<string, unknown>[],
  source: SourceId,
  fallbackCategory: string,
  opts: { filename?: string; format: "csv" | "json" | "manual" } = { format: "csv" },
): Promise<IngestResult> {
  const result: IngestResult = {
    received: rows.length, created: 0, updated: 0, merged: 0,
    skippedNonBronx: 0, skippedInvalid: 0, errors: [],
  };

  const normalized: NormalizedRecord[] = [];
  for (const row of rows) {
    const org = pick(row, "organization_name");
    const n = normalizeRow(row, source, fallbackCategory);
    if (!n) { if (org) result.skippedNonBronx++; else result.skippedInvalid++; continue; }
    normalized.push(n);
  }

  const batch = collapseBatch(normalized);
  result.merged += normalized.length - batch.length;

  const keys = batch.map((r) => r.dedupe_key);
  const existing = new Map<string, BronxResource>();
  for (let i = 0; i < keys.length; i += 200) {
    const { data } = await supabase
      .from("bronx_resources")
      .select("*")
      .in("dedupe_key", keys.slice(i, i + 200));
    for (const r of (data ?? []) as unknown as BronxResource[]) {
      if (!existing.has(r.dedupe_key ?? "")) existing.set(r.dedupe_key ?? "", r);
    }
  }

  for (const rec of batch) {
    const prior = existing.get(rec.dedupe_key);
    let resourceId: string | null = null;
    let contributed: string[] = [];

    if (prior) {
      const { patch, fieldsContributed } = resolveConflicts(prior, rec);
      contributed = fieldsContributed;
      resourceId = prior.merged_into ?? prior.id;
      if (Object.keys(patch).length > 0) {
        const { error } = await supabase.from("bronx_resources").update(patch as never).eq("id", resourceId);
        if (error) { result.errors.push(`${rec.organization_name}: ${error.message}`); continue; }
        result.updated++;
      } else {
        result.merged++;
      }
    } else {
      const { data, error } = await supabase
        .from("bronx_resources")
        .insert({
          organization_name: rec.organization_name,
          resource_name: rec.resource_name,
          resource_category: rec.resource_category,
          resource_subcategory: rec.resource_subcategory,
          address: rec.address,
          borough: "Bronx",
          neighborhood: rec.neighborhood,
          zip_code: rec.zip_code,
          phone: rec.phone,
          email: rec.email,
          website: rec.website,
          hours: rec.hours,
          eligibility: rec.eligibility,
          languages: rec.languages,
          description: rec.description,
          latitude: rec.latitude,
          longitude: rec.longitude,
          source: rec.source,
          source_url: rec.source_url ?? (SOURCES[rec.source].url || null),
          source_record_id: rec.source_record_id,
          dedupe_key: rec.dedupe_key,
          verification_status: "needs_verification",
        } as never)
        .select("*")
        .single();
      if (error || !data) { result.errors.push(`${rec.organization_name}: ${error?.message ?? "insert failed"}`); continue; }
      resourceId = (data as unknown as BronxResource).id;
      existing.set(rec.dedupe_key, data as unknown as BronxResource);
      contributed = Object.entries(rec).filter(([, v]) => v !== null && v !== "").map(([k]) => k);
      result.created++;
    }

    if (resourceId) {
      await supabase.from("bronx_resource_sources").upsert(
        {
          resource_id: resourceId,
          source: rec.source,
          source_label: SOURCES[rec.source].label,
          source_url: SOURCES[rec.source].url || null,
          source_record_id: rec.source_record_id,
          source_priority: SOURCES[rec.source].priority,
          payload: rec.raw as never,
          fields_contributed: contributed,
          source_last_seen: new Date().toISOString(),
        } as never,
        { onConflict: "resource_id,source,source_record_id" },
      );
    }
  }

  await supabase.from("bronx_resource_imports").insert({
    source,
    format: opts.format,
    filename: opts.filename ?? null,
    rows_received: result.received,
    rows_created: result.created,
    rows_updated: result.updated,
    rows_merged: result.merged,
    rows_skipped_non_bronx: result.skippedNonBronx,
    rows_skipped_invalid: result.skippedInvalid,
    notes: result.errors.slice(0, 5).join(" | ") || null,
  } as never);

  return result;
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function loadCategories(): Promise<ResourceCategoryRow[]> {
  const { data } = await supabase
    .from("bronx_resource_categories")
    .select("id,domain,label,subcategories,active,sort_order")
    .order("sort_order");
  return (data ?? []) as unknown as ResourceCategoryRow[];
}

export async function loadDirectory(opts: { includeInactive?: boolean } = {}): Promise<BronxResource[]> {
  let q = supabase.from("bronx_resources").select("*").order("organization_name");
  if (!opts.includeInactive) q = q.eq("active", true).is("merged_into", null);
  const { data } = await q;
  return (data ?? []) as unknown as BronxResource[];
}

export async function loadSourcesFor(resourceIds: string[]): Promise<Record<string, BronxResourceSource[]>> {
  if (resourceIds.length === 0) return {};
  const out: Record<string, BronxResourceSource[]> = {};
  for (let i = 0; i < resourceIds.length; i += 200) {
    const { data } = await supabase
      .from("bronx_resource_sources")
      .select("id,resource_id,source,source_label,source_url,source_record_id,source_priority,fields_contributed,source_last_seen")
      .in("resource_id", resourceIds.slice(i, i + 200));
    for (const s of (data ?? []) as unknown as BronxResourceSource[]) {
      (out[s.resource_id] ??= []).push(s);
    }
  }
  return out;
}

/** Merge one listing into another, preserving every source reference. */
export async function mergeResources(loserId: string, winnerId: string): Promise<string | null> {
  if (loserId === winnerId) return "Cannot merge a listing into itself.";
  const { data: rows } = await supabase.from("bronx_resources").select("*").in("id", [loserId, winnerId]);
  const list = (rows ?? []) as unknown as BronxResource[];
  const loser = list.find((r) => r.id === loserId);
  const winner = list.find((r) => r.id === winnerId);
  if (!loser || !winner) return "Could not load both listings.";

  const patch: Record<string, unknown> = {};
  for (const field of MERGEABLE_FIELDS) {
    const w = winner[field];
    const l = loser[field];
    if ((w === null || w === undefined || w === "") && l !== null && l !== undefined && l !== "") patch[field] = l;
  }
  if (winner.languages.length === 0 && loser.languages.length) patch.languages = loser.languages;
  if (Object.keys(patch).length) await supabase.from("bronx_resources").update(patch as never).eq("id", winnerId);

  await supabase.from("bronx_resource_sources").update({ resource_id: winnerId } as never).eq("resource_id", loserId);
  const { error } = await supabase
    .from("bronx_resources")
    .update({ merged_into: winnerId, active: false } as never)
    .eq("id", loserId);
  return error ? error.message : null;
}

export async function markVerified(
  id: string,
  method: string,
  note: string | null,
): Promise<string | null> {
  const { error } = await supabase
    .from("bronx_resources")
    .update({
      verification_status: "verified",
      verification_method: method,
      verification_note: note,
      last_verified: new Date().toISOString(),
    } as never)
    .eq("id", id);
  return error ? error.message : null;
}

/** Suggest likely duplicates that were not caught by the exact dedupe key. */
export function findLikelyDuplicates(rows: BronxResource[]): Array<[BronxResource, BronxResource]> {
  const pairs: Array<[BronxResource, BronxResource]> = [];
  const byPhone = new Map<string, BronxResource[]>();
  const byOrg = new Map<string, BronxResource[]>();
  for (const r of rows) {
    const digits = (r.phone ?? "").replace(/\D/g, "").slice(-10);
    if (digits.length === 10) (byPhone.get(digits) ?? byPhone.set(digits, []).get(digits)!).push(r);
    const org = slugKey(r.organization_name).slice(0, 18);
    (byOrg.get(org) ?? byOrg.set(org, []).get(org)!).push(r);
  }
  const seen = new Set<string>();
  const add = (group: BronxResource[]) => {
    for (let i = 0; i < group.length; i++)
      for (let j = i + 1; j < group.length; j++) {
        const key = [group[i].id, group[j].id].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push([group[i], group[j]]);
      }
  };
  for (const g of byPhone.values()) if (g.length > 1) add(g);
  for (const g of byOrg.values()) if (g.length > 1) add(g);
  return pairs.slice(0, 50);
}

export function verifiedAgo(iso: string | null): string {
  if (!iso) return "Never verified";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Verified today";
  if (days === 1) return "Verified yesterday";
  if (days < 30) return `Verified ${days} days ago`;
  const months = Math.round(days / 30);
  return `Verified ${months} month${months === 1 ? "" : "s"} ago`;
}

/**
 * Listings added or newly verified in the last `days` days — real recent
 * database activity, newest first. Additive read used by the digest page.
 */
export async function loadRecentActivity(days = 14, limit = 40): Promise<BronxResource[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data } = await supabase
    .from("bronx_resources")
    .select("*")
    .eq("active", true)
    .is("merged_into", null)
    .or(`created_at.gte.${since},last_verified.gte.${since}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as BronxResource[];
}
