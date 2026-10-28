import { useEffect, useState } from "react";

const PROFILE_KEY = "bronx.profile";

/** The visitor's chosen neighborhood, kept in their on-device profile. "" means all of the Bronx. */
export function useNeighborhood(): [string, (value: string) => void] {
  const [neighborhood, setNeighborhood] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      const profile = raw ? JSON.parse(raw) : {};
      if (typeof profile.neighborhood === "string") setNeighborhood(profile.neighborhood);
    } catch {
      /* ignore */
    }
  }, []);

  const save = (value: string) => {
    setNeighborhood(value);
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      const profile = raw ? JSON.parse(raw) : {};
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, neighborhood: value }));
      window.dispatchEvent(new CustomEvent("bronx:profile"));
    } catch {
      /* ignore */
    }
  };

  return [neighborhood, save];
}
