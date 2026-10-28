import { useEffect } from "react";
import { getProfile, saveProfile, useProfile } from "./onboarding";

export function setSimplifiedMode(on: boolean) {
  const p = getProfile();
  saveProfile({ ...p, simplifiedMode: on });
}

/** Mounts a class on <html> reflecting the user's Simplified View preference. */
export function SimplifiedModeEffect() {
  const profile = useProfile();
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (profile.simplifiedMode) root.classList.add("simplified");
    else root.classList.remove("simplified");
  }, [profile.simplifiedMode]);
  return null;
}

export function useSimplifiedMode(): boolean {
  return useProfile().simplifiedMode;
}
