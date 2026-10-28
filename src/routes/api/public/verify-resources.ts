import { createFileRoute } from "@tanstack/react-router";
import {
  RESOURCES,
  YOUTH_RESOURCES,
  NATURE_RESOURCES,
  ART_RESOURCES,
  RECREATION_RESOURCES,
  type Resource,
} from "@/lib/data";

const JOB_ID = "resource-verifier";
const STALE_DAYS = 30;
const DEFAULT_BATCH = 10;
const MAX_BATCH = 25;
const LEASE_MINUTES = 10;

const ALL: Resource[] = [
  ...RESOURCES,
  ...YOUTH_RESOURCES,
  ...NATURE_RESOURCES,
  ...ART_RESOURCES,
  ...RECREATION_RESOURCES,
];

/** Step 1: phone plausibility (format + NANP rules). No dialing — this is a stub check. */
function checkPhone(phone: string | undefined): { ok: boolean; issue?: string } {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return { ok: false, issue: "Missing phone number" };
  if (digits === "311" || digits === "911" || digits === "988") return { ok: true };
  const nat = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (nat.length !== 10) return { ok: false, issue: "Phone number is not a valid 10-digit number" };
  if (/^(\d)\1{9}$/.test(nat))
    return { ok: false, issue: "Phone number looks like placeholder data" };
  if (nat[0] === "0" || nat[0] === "1") return { ok: false, issue: "Phone area code is invalid" };
  return { ok: true };
}

type GeoResult = { ok: boolean; issue?: string; formatted?: string; lat?: number; lng?: number };

const MAPS_API = "https://maps.googleapis.com/maps/api";

/** Step 2: address validation via Google Geocoding. */
async function verifyAddress(address: string, key: string): Promise<GeoResult> {
  if (!address?.trim()) return { ok: false, issue: "Missing address" };
  const res = await fetch(
    `${MAPS_API}/geocode/json?address=${encodeURIComponent(`${address}, Bronx, NY`)}&key=${encodeURIComponent(key)}`,
  );
  if (!res.ok) return { ok: false, issue: `Address check unavailable (${res.status})` };
  const body = (await res.json()) as {
    status: string;
    results?: {
      formatted_address?: string;
      geometry?: { location?: { lat: number; lng: number } };
    }[];
  };
  const top = body.results?.[0];
  if (body.status !== "OK" || !top) return { ok: false, issue: "Address not found on the map" };
  return {
    ok: true,
    formatted: top.formatted_address,
    lat: top.geometry?.location?.lat,
    lng: top.geometry?.location?.lng,
  };
}

/**
 * Step 3: cross-check the org still exists via Google Places.
 * `ok: null` means the check could not run (Places API not enabled on the key)
 * — that is treated as "unknown", never as a verification failure.
 */
async function crossCheckGooglePlaces(
  name: string,
  address: string,
  key: string,
): Promise<{ ok: boolean | null; issue?: string; placeId?: string }> {
  const query = encodeURIComponent(`${name} ${address} Bronx NY`);
  const res = await fetch(
    `${MAPS_API}/place/textsearch/json?query=${query}&key=${encodeURIComponent(key)}`,
  );
  if (!res.ok) return { ok: null };
  const body = (await res.json()) as {
    status?: string;
    results?: { place_id?: string; business_status?: string; name?: string }[];
  };
  if (body.status === "REQUEST_DENIED" || body.status === "OVER_QUERY_LIMIT") return { ok: null };
  const place = body.results?.[0];
  if (!place) return { ok: false, issue: "No matching Google listing found" };
  if (place.business_status && place.business_status !== "OPERATIONAL") {
    return {
      ok: false,
      issue: `Google reports this location as ${place.business_status.toLowerCase().replace(/_/g, " ")}`,
      placeId: place.place_id,
    };
  }
  return { ok: true, placeId: place.place_id };
}

export const Route = createFileRoute("/api/public/verify-resources")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["GOOGLE_MAPS_API_KEY"];
        if (!key)
          return Response.json({ error: "GOOGLE_MAPS_API_KEY is not set" }, { status: 500 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let batchSize = DEFAULT_BATCH;
        try {
          const body = (await request.json()) as { batch_size?: number } | null;
          if (body?.batch_size)
            batchSize = Math.min(MAX_BATCH, Math.max(1, Number(body.batch_size)));
        } catch {
          /* no body is fine */
        }

        // Paused-state guard + single-flight lease.
        const { data: state } = await supabaseAdmin
          .from("verification_job_state")
          .select("status, lease_until")
          .eq("id", JOB_ID)
          .maybeSingle();

        if (state?.status === "paused") {
          return Response.json({ skipped: "job is paused", processed: 0 });
        }
        if (state?.lease_until && new Date(state.lease_until).getTime() > Date.now()) {
          return Response.json({ skipped: "another run is in progress", processed: 0 });
        }

        const leaseUntil = new Date(Date.now() + LEASE_MINUTES * 60_000).toISOString();
        await supabaseAdmin
          .from("verification_job_state")
          .update({ status: "running", lease_until: leaseUntil, last_error: null })
          .eq("id", JOB_ID);

        try {
          const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();
          const { data: rows } = await supabaseAdmin
            .from("resource_verifications")
            .select("resource_id, checked_at");

          const checked = new Map((rows ?? []).map((r) => [r.resource_id, r.checked_at]));
          const queue = ALL.filter((r) => {
            const at = checked.get(r.id);
            return !at || at < cutoff;
          }).slice(0, batchSize);

          const results: { id: string; verified: boolean; issues: string[] }[] = [];

          for (const resource of queue) {
            const issues: string[] = [];
            const phone = checkPhone(resource.phone);
            if (!phone.ok && phone.issue) issues.push(phone.issue);

            const addr = await verifyAddress(resource.address, key);
            if (!addr.ok && addr.issue) issues.push(addr.issue);

            const places = await crossCheckGooglePlaces(resource.name.en, resource.address, key);
            if (places.ok === false && places.issue) issues.push(places.issue);

            const verified = phone.ok && addr.ok && places.ok !== false;
            const now = new Date().toISOString();

            // Idempotent progress marking: written per item, so a re-run skips it.
            await supabaseAdmin.from("resource_verifications").upsert(
              {
                resource_id: resource.id,
                resource_name: resource.name.en,
                category: resource.category,
                phone: resource.phone,
                address: resource.address,
                verified,
                phone_ok: phone.ok,
                address_ok: addr.ok,
                places_ok: places.ok,
                google_place_id: places.placeId ?? null,
                formatted_address: addr.formatted ?? null,
                verification_issues: issues,
                last_verified_date: verified ? now : null,
                checked_at: now,
              },
              { onConflict: "resource_id" },
            );

            results.push({ id: resource.id, verified, issues });
          }

          await supabaseAdmin
            .from("verification_job_state")
            .update({
              status: "idle",
              lease_until: null,
              last_run_at: new Date().toISOString(),
              processed_last_run: results.length,
            })
            .eq("id", JOB_ID);

          return Response.json({
            processed: results.length,
            remaining: Math.max(0, ALL.length - checked.size - results.length),
            results,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await supabaseAdmin
            .from("verification_job_state")
            .update({ status: "idle", lease_until: null, last_error: message })
            .eq("id", JOB_ID);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
