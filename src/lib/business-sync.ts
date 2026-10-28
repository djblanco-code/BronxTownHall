// Cloud sync layer for business listings.
// Businesses now live in the cloud (Supabase). localStorage is kept only as an
// offline cache so the existing synchronous helpers in ./business keep working.

import { supabase } from "@/integrations/supabase/client";
import {
  Business,
  BusinessEvent,
  getBusinesses,
  getEvents,
  saveBusinesses,
  saveEvents,
  withoutPush,
} from "./business";

const MIGRATED_KEY = "bx-businesses-migrated";

/** Fields that must never leave the device. */
function stripSecrets(b: Business) {
  const { password: _pw, ...rest } = b as Business & { password?: string };
  return rest;
}

function toRow(b: Business) {
  const safe = stripSecrets(b);
  return {
    id: b.id,
    name: b.name,
    address: b.address ?? null,
    phone: b.phone ?? null,
    website: (b as unknown as { website?: string }).website ?? null,
    category: b.category ?? null,
    subcategory: b.subcategory ?? null,
    description: b.description ?? null,
    hours: (b.hours ?? {}) as unknown as Record<string, unknown>,
    tier: b.tier ?? "free",
    status: b.status ?? "pending",
    verified: !!b.verified,
    verified_date: b.verified ? new Date().toISOString() : null,
    data: safe as unknown as Record<string, unknown>,
    created_at: new Date(b.createdAt || Date.now()).toISOString(),
  };
}

type Row = {
  id: string;
  name: string;
  data: Record<string, unknown> | null;
  verified: boolean;
  status: string;
  tier: string;
  created_at: string;
};

function fromRow(r: Row): Business {
  const base = (r.data ?? {}) as Partial<Business>;
  return {
    ...(base as Business),
    id: r.id,
    name: r.name,
    verified: r.verified,
    status: (r.status as Business["status"]) ?? "pending",
    tier: (r.tier as Business["tier"]) ?? "free",
    password: (base as { password?: string }).password ?? "",
    createdAt: base.createdAt ?? new Date(r.created_at).getTime(),
  };
}

function eventToRow(e: BusinessEvent) {
  return {
    id: e.id,
    business_id: e.businessId,
    title: e.title,
    event_date: e.date || null,
    event_time: e.time || null,
    location: e.location || null,
    description: e.description || null,
    status: e.status || "pending",
    created_at: new Date(e.createdAt || Date.now()).toISOString(),
  };
}

function eventFromRow(r: {
  id: string;
  business_id: string;
  title: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  description: string | null;
  status: string;
  created_at: string;
}): BusinessEvent {
  return {
    id: r.id,
    businessId: r.business_id,
    title: r.title,
    date: r.event_date ?? "",
    time: r.event_time ?? "",
    location: r.location ?? "",
    description: r.description ?? "",
    status: (r.status as BusinessEvent["status"]) ?? "pending",
    createdAt: new Date(r.created_at).getTime(),
  };
}

/** Fire-and-forget upsert of one business to the cloud. */
export function pushBusiness(b: Business) {
  void supabase.from("businesses").upsert(toRow(b) as never).then(({ error }) => {
    if (error) console.warn("[business-sync] push failed", error.message);
  });
}

export function pushBusinesses(list: Business[]) {
  if (!list.length) return;
  void supabase
    .from("businesses")
    .upsert(list.map(toRow) as never)
    .then(({ error }) => {
      if (error) console.warn("[business-sync] bulk push failed", error.message);
    });
}

export function removeBusinessRemote(id: string) {
  void supabase.from("businesses").delete().eq("id", id).then(({ error }) => {
    if (error) console.warn("[business-sync] delete failed", error.message);
  });
}

export function pushBusinessEvent(e: BusinessEvent) {
  void supabase.from("business_events").upsert(eventToRow(e) as never).then(({ error }) => {
    if (error) console.warn("[business-sync] event push failed", error.message);
  });
}

/** One-time migration of anything still sitting in this browser. */
async function migrateLocalBusinesses() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATED_KEY)) return;
  const local = getBusinesses();
  if (local.length) {
    const { error } = await supabase.from("businesses").upsert(local.map(toRow) as never);
    if (error) {
      console.warn("[business-sync] migration failed", error.message);
      return;
    }
    const localEvents = getEvents();
    if (localEvents.length) {
      await supabase.from("business_events").upsert(localEvents.map(eventToRow) as never);
    }
  }
  localStorage.setItem(MIGRATED_KEY, "1");
}

/** Pull cloud state into the local cache. Safe to call on every app load. */
export async function syncBusinesses() {
  if (typeof window === "undefined") return;
  try {
    await migrateLocalBusinesses();
    const [{ data: rows, error }, { data: eventRows }] = await Promise.all([
      supabase.from("businesses").select("*").order("created_at", { ascending: true }),
      supabase.from("business_events").select("*"),
    ]);
    if (error) throw error;

    // Preserve device-only credentials for listings created on this browser.
    const localById = new Map(getBusinesses().map((b) => [b.id, b]));
    const merged = (rows ?? []).map((r) => {
      const remote = fromRow(r as unknown as Row);
      const local = localById.get(remote.id);
      return local ? { ...remote, password: local.password || remote.password } : remote;
    });
    withoutPush(() => {
      saveBusinesses(merged);
      if (eventRows) saveEvents((eventRows as never[]).map(eventFromRow as never));
    });
    window.dispatchEvent(new CustomEvent("bx-businesses-synced"));
  } catch (e) {
    console.warn("[business-sync] sync failed", (e as Error).message);
  }
}
