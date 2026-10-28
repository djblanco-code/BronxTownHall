// Supabase connection settings, read the same way by the browser and server clients.

/** First of `names` set in the server's runtime environment. */
function fromProcess(...names: string[]): string | undefined {
  if (typeof process === "undefined") return undefined;
  return names.map((n) => process.env[n]).find(Boolean) || undefined;
}

/**
 * Project URL and publishable (public) key. vite.config.ts bakes them in at
 * build time from VITE_SUPABASE_* (or the names Supabase's Vercel integration
 * uses), for both the browser and the server; the server also re-reads them
 * at runtime as a fallback.
 */
export function supabasePublicEnv() {
  return {
    url:
      import.meta.env.VITE_SUPABASE_URL || fromProcess("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey:
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      fromProcess("SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

/** Server-only secret that bypasses row-level security. Never expose it to the browser. */
export function supabaseServiceRoleKey(): string | undefined {
  return fromProcess("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
}

export function missingSupabaseEnv(names: string[]): Error {
  const message =
    `Missing Supabase environment variable(s): ${names.join(", ")}. ` +
    "Add them in your hosting provider's environment settings and redeploy (see docs/self-hosting.md).";
  console.error(`[Supabase] ${message}`);
  return new Error(message);
}
