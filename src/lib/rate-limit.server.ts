import { createHash } from "crypto";

/**
 * Per-caller limits for endpoints that call paid APIs. Counts are shared
 * through the database (`hit_rate_limit`) so they hold across every server
 * instance; if the database can't be reached, a per-instance count is used.
 */

/**
 * The caller's IP as the host reports it. Vercel overwrites `x-real-ip` and
 * `x-forwarded-for`, so clients can't fake them (unlike `cf-connecting-ip`).
 */
export function clientIp(header: (name: string) => string | null | undefined): string {
  return (
    header("x-real-ip")?.trim() || header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

const memory = new Map<string, number[]>();

function memoryLimited(id: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const recent = (memory.get(id) ?? []).filter((t) => now - t < windowSeconds * 1000);
  recent.push(now);
  memory.set(id, recent);
  if (memory.size > 5000) memory.clear();
  return recent.length > limit;
}

/** Counts this call; true when the caller is over `limit` calls per `windowSeconds`. */
export async function rateLimited(
  bucket: string,
  ip: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  // Only a hash is stored, never the IP itself.
  const key = createHash("sha256").update(`${bucket}:${ip}`).digest("hex").slice(0, 32);
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("hit_rate_limit", {
      _bucket: bucket,
      _key: key,
      _limit: limit,
      _window_seconds: windowSeconds,
    });
    if (!error && typeof data === "boolean") return data;
  } catch {
    /* fall through to the per-instance count */
  }
  return memoryLimited(`${bucket}:${key}`, limit, windowSeconds);
}
