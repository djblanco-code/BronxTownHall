import { useEffect, useState } from "react";
import { Lang } from "./i18n";
import { Category } from "./data";

export type Need =
  | "food" | "health" | "legal" | "jobs"
  | "childcare" | "youth" | "civic";

export const NEED_TO_CATEGORY: Record<Need, Category> = {
  food: "food", health: "health", legal: "legal", jobs: "jobs",
  childcare: "childcare", youth: "youth", civic: "government",
};

export type Comfort = "very" | "somewhat" | "not";
export type TTSPref = "yes" | "no" | "sometimes";

export type UserProfile = {
  completed: boolean;
  userNeeds: Need[];
  preferredLanguage: Lang;
  prefersTTS: TTSPref;
  userZipCode: string;
  comfortLevel: Comfort;
  simplifiedMode: boolean;
};

const KEY = "bronx.profile";

const DEFAULT: UserProfile = {
  completed: false,
  userNeeds: [],
  preferredLanguage: "en",
  prefersTTS: "sometimes",
  userZipCode: "",
  comfortLevel: "somewhat",
  simplifiedMode: false,
};

function read(): UserProfile {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch { return DEFAULT; }
}

export function getProfile(): UserProfile { return read(); }

export function saveProfile(p: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("bronx:profile"));
}

export function resetOnboarding() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("bronx:profile"));
}

export function useProfile() {
  // Start with DEFAULT on both SSR and first client render to keep markup stable,
  // then hydrate from localStorage after mount.
  const [profile, setProfile] = useState<UserProfile>(DEFAULT);
  useEffect(() => {
    setProfile(read());
    const on = () => setProfile(read());
    window.addEventListener("bronx:profile", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("bronx:profile", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return profile;
}

// All Bronx zip codes 10451–10475
export const BRONX_ZIPS: string[] = Array.from({ length: 25 }, (_, i) => String(10451 + i));
