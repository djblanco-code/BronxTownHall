import { useEffect, useState } from "react";

const KEY = "bx-demo";

/**
 * Demo mode fills empty feeds (events, official updates, deadlines) with
 * sample content so previews show the site full. It is never on by accident
 * for residents: only with VITE_DEMO_CONTENT=true (set it on Vercel *preview*
 * deployments only) or after opening a link with ?demo=1 (off again with
 * ?demo=0). A banner says so on every page while it is on.
 */
export function isDemoMode(): boolean {
  if (import.meta.env.VITE_DEMO_CONTENT === "true") return true;
  if (typeof window === "undefined") return false;
  try {
    const param = new URLSearchParams(window.location.search).get("demo");
    if (param === "1") sessionStorage.setItem(KEY, "1");
    if (param === "0") sessionStorage.removeItem(KEY);
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Turns demo mode off for this tab (it stays on if the build forces it). */
export function exitDemoMode() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** `isDemoMode()` after hydration, so the server and browser render the same first frame. */
export function useDemoMode(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(isDemoMode()), []);
  return on;
}
