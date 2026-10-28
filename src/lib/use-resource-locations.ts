import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { ResourceLocation } from "./location.functions";
import { geocodeResource, getCachedLocations } from "./location.functions";
import { isNonSpecificAddress } from "./address";

type State = Record<string, ResourceLocation | "loading" | "error">;

// In-process cache so navigating between pages doesn't re-fetch.
const memCache: Record<string, ResourceLocation> = {};

export function useResourceLocations(addresses: string[]) {
  const fetchCached = useServerFn(getCachedLocations);
  const fetchGeocode = useServerFn(geocodeResource);
  const [state, setState] = useState<State>(() => {
    const init: State = {};
    addresses.forEach((a) => { if (memCache[a]) init[a] = memCache[a]; });
    return init;
  });

  // Never geocode non-specific / virtual addresses ("Various Bronx locations",
  // "Citywide (virtual)") — they have no single physical point.
  const stableAddrs = useMemo(() => {
    const seen = new Set<string>();
    return addresses.filter((a) => a && !isNonSpecificAddress(a) && !seen.has(a) && seen.add(a));
  }, [addresses.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    const toFetch = stableAddrs.filter((a) => !memCache[a] && state[a] === undefined);
    if (!toFetch.length) return;

    setState((s) => {
      const next = { ...s };
      toFetch.forEach((a) => { next[a] = "loading"; });
      return next;
    });

    (async () => {
      // 1. Batch-check cache
      let cached: Record<string, ResourceLocation> = {};
      try {
        cached = await fetchCached({ data: { addresses: toFetch } });
      } catch { /* ignore */ }
      if (cancelled) return;

      Object.entries(cached).forEach(([addr, loc]) => { memCache[addr] = loc; });
      setState((s) => {
        const next = { ...s };
        Object.entries(cached).forEach(([addr, loc]) => { next[addr] = loc; });
        return next;
      });

      // 2. Geocode the rest, with a small concurrency cap.
      const remaining = toFetch.filter((a) => !cached[a]);
      const CONCURRENCY = 3;
      let i = 0;
      const worker = async () => {
        while (i < remaining.length && !cancelled) {
          const addr = remaining[i++];
          try {
            const loc = await fetchGeocode({ data: { address: addr } });
            if (cancelled) return;
            if (loc) {
              memCache[addr] = loc;
              setState((s) => ({ ...s, [addr]: loc }));
            } else {
              setState((s) => ({ ...s, [addr]: "error" }));
            }
          } catch {
            if (!cancelled) setState((s) => ({ ...s, [addr]: "error" }));
          }
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableAddrs.join("|")]);

  const get = (address: string): ResourceLocation | null => {
    const v = state[address] ?? (memCache[address] as ResourceLocation | undefined);
    return v && typeof v === "object" ? (v as ResourceLocation) : null;
  };
  const isLoading = stableAddrs.some((a) => state[a] === "loading" || (state[a] === undefined && !memCache[a]));

  return { get, isLoading, state };
}
