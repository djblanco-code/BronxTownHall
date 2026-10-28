import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "bx-pack";
const MAX = 20;

type PackCtx = {
  ids: string[];
  active: boolean;
  setActive: (v: boolean) => void;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
  count: number;
};

const Ctx = createContext<PackCtx | null>(null);

export function PackProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed) && parsed.length) {
          setIds(parsed.slice(0, MAX));
          setActive(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX
          ? prev
          : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo<PackCtx>(
    () => ({
      ids,
      active,
      setActive,
      has: (id: string) => ids.includes(id),
      toggle,
      clear,
      count: ids.length,
    }),
    [ids, active, toggle, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePack() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePack must be used inside PackProvider");
  return ctx;
}

export const PACK_MAX = MAX;

function makeSlug() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

/** Saves the selected resource ids and returns a short shareable URL. */
export async function generateShortLink(ids: string[], note?: string): Promise<string> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const trimmed = ids.slice(0, MAX);
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = makeSlug();
    const { error } = await supabase
      .from("resource_packs")
      .insert({ slug, resource_ids: trimmed, note: note?.slice(0, 200) || null });
    if (!error) return `${origin}/pack/${slug}`;
  }
  // Fallback: encode ids in the query string so sharing never hard-fails.
  return `${origin}/pack/inline?ids=${encodeURIComponent(trimmed.join(","))}`;
}
