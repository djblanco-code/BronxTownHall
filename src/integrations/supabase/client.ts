import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { missingSupabaseEnv, supabasePublicEnv } from "./env";

function createSupabaseClient() {
  const { url: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY } = supabasePublicEnv();

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw missingSupabaseEnv([
      ...(!SUPABASE_URL ? ["VITE_SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
    ]);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
