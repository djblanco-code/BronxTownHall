// Supabase connection settings, read the same way by the browser and server clients.

function fromProcess(name: string): string | undefined {
  return (typeof process !== "undefined" ? process.env[name] : undefined) || undefined;
}

/**
 * Project URL and publishable (public) key. `VITE_*` values are baked in at
 * build time and reach both the browser and the server bundle; the plain
 * names are read at runtime on the server, as an override.
 */
export function supabasePublicEnv() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || fromProcess("SUPABASE_URL"),
    publishableKey:
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || fromProcess("SUPABASE_PUBLISHABLE_KEY"),
  };
}

/** Server-only secret that bypasses row-level security. Never expose it to the browser. */
export function supabaseServiceRoleKey(): string | undefined {
  return fromProcess("SUPABASE_SERVICE_ROLE_KEY");
}

export function missingSupabaseEnv(names: string[]): Error {
  const message =
    `Missing Supabase environment variable(s): ${names.join(", ")}. ` +
    "Add them in your hosting provider's environment settings and redeploy (see docs/self-hosting.md).";
  console.error(`[Supabase] ${message}`);
  return new Error(message);
}
