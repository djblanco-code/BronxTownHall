import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type ResourceLocation = {
  address: string;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

function addressKey(address: string): string {
  return address.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 220);
}

function gatewayHeaders(): Record<string, string> {
  const lk = process.env.LOVABLE_API_KEY;
  const gk = process.env.GOOGLE_MAPS_API_KEY;
  if (!lk || !gk) throw new Error("Maps connector credentials missing");
  return {
    Authorization: `Bearer ${lk}`,
    "X-Connection-Api-Key": gk,
    "Content-Type": "application/json",
  };
}

// Rough bounding box for NYC's five boroughs. Results outside it are rejected
// so a bad address can never drop a pin upstate or out of the city.
const NYC_BOUNDS = { minLat: 40.45, maxLat: 41.0, minLng: -74.3, maxLng: -73.65 };

function inNyc(lat: number, lng: number) {
  return (
    lat >= NYC_BOUNDS.minLat && lat <= NYC_BOUNDS.maxLat &&
    lng >= NYC_BOUNDS.minLng && lng <= NYC_BOUNDS.maxLng
  );
}

async function callGeocode(address: string) {
  const bias = "&bounds=40.45,-74.3|41.0,-73.65&region=us&components=" +
    encodeURIComponent("administrative_area:NY|country:US");
  const url = `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(address)}${bias}`;
  const res = await fetch(url, { headers: gatewayHeaders() });
  if (!res.ok) throw new Error(`Geocode failed ${res.status}`);
  const data = (await res.json()) as {
    status: string;
    results: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }[];
  };
  if (data.status !== "OK" || !data.results.length) return null;
  const r = data.results.find((x) => inNyc(x.geometry.location.lat, x.geometry.location.lng)) ?? data.results[0];
  return {
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    formatted: r.formatted_address,
  };
}

export const geocodeResource = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ address: z.string().min(3).max(300) }).parse(d),
  )
  .handler(async ({ data }): Promise<ResourceLocation | null> => {
    const key = addressKey(data.address);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. cache hit?
    const { data: cached } = await supabaseAdmin
      .from("geocoded_locations")
      .select("*")
      .eq("address_key", key)
      .maybeSingle();
    if (cached) {
      if (cached.latitude == null || cached.longitude == null) return null;
      return {
        address: cached.address,
        formattedAddress: cached.formatted_address,
        latitude: cached.latitude,
        longitude: cached.longitude,
      };
    }

    // 2. geocode — return null on miss instead of throwing so the UI can skip it.
    const geo = await callGeocode(data.address);
    if (!geo) return null;

    const row = {
      address_key: key,
      address: data.address,
      latitude: geo.lat,
      longitude: geo.lng,
      formatted_address: geo.formatted,
    };
    await supabaseAdmin.from("geocoded_locations").upsert(row, { onConflict: "address_key" });

    return {
      address: data.address,
      formattedAddress: geo.formatted,
      latitude: geo.lat,
      longitude: geo.lng,
    };
  });

export const getCachedLocations = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ addresses: z.array(z.string()).max(500) }).parse(d),
  )
  .handler(async ({ data }): Promise<Record<string, ResourceLocation>> => {
    if (!data.addresses.length) return {};
    const keys = data.addresses.map(addressKey);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("geocoded_locations")
      .select("*")
      .in("address_key", keys);
    const byKey: Record<string, ResourceLocation> = {};
    for (const r of rows ?? []) {
      byKey[r.address_key] = {
        address: r.address,
        formattedAddress: r.formatted_address,
        latitude: r.latitude,
        longitude: r.longitude,
      };
    }
    const out: Record<string, ResourceLocation> = {};
    data.addresses.forEach((addr, i) => {
      const hit = byKey[keys[i]];
      if (hit) out[addr] = hit;
    });
    return out;
  });

