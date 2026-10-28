/**
 * Editorial layer for resources.
 *
 * `src/lib/data.ts` remains the built-in catalog (and the offline/SSR fallback).
 * The `resources` table in the backend is the editable layer on top of it:
 * an admin can add a listing, correct one, deactivate one, or stamp it verified
 * WITHOUT a code change. Rows are matched to catalog entries by `id`.
 *
 * This keeps the migration incremental — nothing breaks if the table is empty —
 * while giving a non-developer a real place to maintain the data.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { VerificationStatus } from "./verification";

export type ResourceMeta = {
  id: string;
  name: string | null;
  category: string | null;
  neighborhood: string | null;
  community_board: number | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  hours: string | null;
  description: string | null;
  source: string | null;
  source_url: string | null;
  verification_status: VerificationStatus;
  last_verified: string | null;
  verify_every_days: number;
  translated_langs: string[];
  is_active: boolean;
};

const EMPTY: Record<string, ResourceMeta> = {};

let cache: Record<string, ResourceMeta> | null = null;
let inflight: Promise<Record<string, ResourceMeta>> | null = null;

const SELECT =
  "id,name,category,neighborhood,community_board,phone,address,website,hours,description,source,source_url,verification_status,last_verified,verify_every_days,translated_langs,is_active";

export async function loadResourceMeta(force = false): Promise<Record<string, ResourceMeta>> {
  if (cache && !force) return cache;
  if (inflight && !force) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.from("resources").select(SELECT).limit(2000);
      if (error || !data) return EMPTY;
      const map: Record<string, ResourceMeta> = {};
      for (const row of data as unknown as ResourceMeta[]) map[row.id] = row;
      cache = map;
      return map;
    } catch {
      // Never let a backend hiccup break the catalog — fall back to built-in data.
      return EMPTY;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function invalidateResourceMeta() {
  cache = null;
}

/** Reactive access to the editorial layer. Returns {} until loaded. */
export function useResourceMeta() {
  const [meta, setMeta] = useState<Record<string, ResourceMeta>>(cache ?? EMPTY);
  useEffect(() => {
    let alive = true;
    void loadResourceMeta().then((m) => {
      if (alive) setMeta(m);
    });
    return () => {
      alive = false;
    };
  }, []);
  return meta;
}
