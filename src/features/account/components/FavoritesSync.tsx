import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getFavorites, setFavorites } from "@/lib/personalization";
import { mergeFavorites } from "../lib/favorites-merge";

const BASE_KEY = "bronx.favorites.synced";

type Base = { userId: string; ids: string[] };

function readBase(userId: string): string[] {
  try {
    const b = JSON.parse(localStorage.getItem(BASE_KEY) ?? "null") as Base | null;
    return b?.userId === userId ? b.ids : [];
  } catch {
    return [];
  }
}

function writeBase(userId: string, ids: string[]) {
  try {
    localStorage.setItem(BASE_KEY, JSON.stringify({ userId, ids } satisfies Base));
  } catch {
    /* storage blocked: the next sync starts fresh */
  }
}

async function syncNow(userId: string) {
  const { data, error } = await supabase
    .from("saved_resources")
    .select("resource_id")
    .eq("user_id", userId);
  if (error) return;
  const server = (data ?? []).map((r) => r.resource_id);
  const { merged, toAdd, toRemove } = mergeFavorites(server, getFavorites(), readBase(userId));
  if (toAdd.length) {
    const { error: addError } = await supabase.from("saved_resources").upsert(
      toAdd.map((resource_id) => ({ user_id: userId, resource_id })),
      { onConflict: "user_id,resource_id", ignoreDuplicates: true },
    );
    if (addError) return;
  }
  if (toRemove.length) {
    const { error: removeError } = await supabase
      .from("saved_resources")
      .delete()
      .eq("user_id", userId)
      .in("resource_id", toRemove);
    if (removeError) return;
  }
  setFavorites(merged);
  writeBase(userId, merged);
}

/**
 * Keeps a signed-in resident's saved places the same on every device. The
 * phone stays the source for showing them (fast, works offline); this copies
 * changes to the account and merges in saves made elsewhere at sign-in.
 */
export function FavoritesSync() {
  useEffect(() => {
    let userId: string | null = null;
    let sub: { unsubscribe: () => void } | undefined;
    try {
      sub = supabase.auth.onAuthStateChange((_event, session) => {
        const uid = session?.user?.id ?? null;
        if (uid && uid !== userId) void syncNow(uid).catch(() => undefined);
        userId = uid;
      }).data.subscription;
    } catch {
      return; // Supabase isn't configured; favorites stay on this phone.
    }

    const onFavorite = (e: Event) => {
      const uid = userId;
      if (!uid) return;
      const { id, saved } = (e as CustomEvent<{ id: string; saved: boolean }>).detail;
      const done = () => {
        const base = readBase(uid).filter((x) => x !== id);
        writeBase(uid, saved ? [...base, id] : base);
      };
      const request = saved
        ? supabase
            .from("saved_resources")
            .upsert(
              { user_id: uid, resource_id: id },
              { onConflict: "user_id,resource_id", ignoreDuplicates: true },
            )
        : supabase.from("saved_resources").delete().eq("user_id", uid).eq("resource_id", id);
      // On failure the base isn't updated, so the next sync retries the change.
      void request.then(({ error }) => !error && done());
    };
    window.addEventListener("bronx:favorite", onFavorite);
    return () => {
      sub?.unsubscribe();
      window.removeEventListener("bronx:favorite", onFavorite);
    };
  }, []);
  return null;
}
