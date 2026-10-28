import { useEffect, useState, useCallback } from "react";
import { RESOURCES, Category } from "./data";

const FAV_KEY = "bronx.favorites";
const USAGE_KEY = "bronx.usage";
const SETTINGS_KEY = "bronx.settings";

export type UsageEvent = { resourceId: string; points: number; at: number };
export type UsageState = Record<string, { points: number; lastAt: number; count: number }>;

type Settings = { trackingEnabled: boolean };

// ---- helpers ----
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("bronx:storage", { detail: key }));
}

// ---- settings ----
export function getSettings(): Settings { return read<Settings>(SETTINGS_KEY, { trackingEnabled: true }); }
export function setSettings(s: Settings) { write(SETTINGS_KEY, s); }

// ---- favorites ----
export function getFavorites(): string[] { return read<string[]>(FAV_KEY, []); }
export function toggleFavorite(id: string) {
  const cur = getFavorites();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  write(FAV_KEY, next);
  return next;
}
export function isFavorite(id: string) { return getFavorites().includes(id); }

// ---- usage tracking ----
const POINTS = {
  view: 1,
  call: 5,
  directions: 5,
  share: 3,
  report: -10,
} as const;
export type UsageAction = keyof typeof POINTS;

export function trackUsage(resourceId: string, action: UsageAction) {
  if (!getSettings().trackingEnabled) return;
  const state = read<UsageState>(USAGE_KEY, {});
  const prev = state[resourceId] ?? { points: 0, lastAt: 0, count: 0 };
  state[resourceId] = {
    points: prev.points + POINTS[action],
    lastAt: Date.now(),
    count: prev.count + (action === "view" ? 1 : 0),
  };
  write(USAGE_KEY, state);
}

export function clearUsage() { write(USAGE_KEY, {}); }
export function getUsage(): UsageState { return read<UsageState>(USAGE_KEY, {}); }

// Decayed score: interactions >30d old lose 50% value
function decayed(entry: { points: number; lastAt: number }) {
  const ageDays = (Date.now() - entry.lastAt) / (1000 * 60 * 60 * 24);
  return ageDays > 30 ? entry.points * 0.5 : entry.points;
}

export function getTopUsed(limit = 3, excludeIds: string[] = []): { id: string; count: number; score: number }[] {
  const state = read<UsageState>(USAGE_KEY, {});
  return Object.entries(state)
    .filter(([id, v]) => v.points > 0 && !excludeIds.includes(id))
    .map(([id, v]) => ({ id, count: v.count, score: decayed(v) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getInteractionCount(): number {
  const state = read<UsageState>(USAGE_KEY, {});
  return Object.values(state).reduce((acc, v) => acc + v.count, 0);
}

// Most-used categories (ordered)
export function getTopCategories(): Category[] {
  const state = read<UsageState>(USAGE_KEY, {});
  const tally: Partial<Record<Category, number>> = {};
  for (const [id, v] of Object.entries(state)) {
    const res = RESOURCES.find((r) => r.id === id);
    if (!res) continue;
    tally[res.category] = (tally[res.category] ?? 0) + decayed(v);
  }
  return (Object.entries(tally) as [Category, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);
}

// NOTE: verification dates are real data now. They live in the `resources`
// table and are read via src/lib/resource-meta.ts + src/lib/verification.ts.
// The old hash-based placeholder was removed on purpose — never reintroduce a
// generated "last verified" date.

// ---- React hook that re-renders on storage changes ----
export function usePersonalization() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setMounted(true);
    const onStorage = () => setTick((t) => t + 1);
    window.addEventListener("bronx:storage", onStorage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bronx:storage", onStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  // During SSR and first client render, return defaults to keep markup stable.
  if (!mounted) {
    return {
      tick: 0,
      favorites: [] as string[],
      isFavorite: (_id: string) => false,
      toggleFavorite,
      topUsed: (_limit?: number, _exclude?: string[]) => [] as { id: string; count: number; score: number }[],
      interactionCount: 0,
      topCategories: [] as Category[],
      settings: { trackingEnabled: true },
      setSettings,
      clearUsage,
    };
  }
  return {
    tick,
    favorites: getFavorites(),
    isFavorite: (id: string) => getFavorites().includes(id),
    toggleFavorite,
    topUsed: (limit?: number, exclude?: string[]) => getTopUsed(limit, exclude),
    interactionCount: getInteractionCount(),
    topCategories: getTopCategories(),
    settings: getSettings(),
    setSettings,
    clearUsage,
  };
}
