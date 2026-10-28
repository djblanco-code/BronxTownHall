// Lightweight, privacy-friendly analytics (Plausible).
// No cookies, no personal data — safe for a public community app.
//
// Config:
//   VITE_PLAUSIBLE_DOMAIN  — the site domain registered in Plausible (defaults to the current hostname)
//   VITE_PLAUSIBLE_API_HOST — self-hosted instance URL (defaults to https://plausible.io)
//
// Plausible automatically reports: unique visitors (total/new/returning), sessions,
// session duration, bounce rate, page views, referral sources, device type and
// browser language. Everything below only adds custom events on top of that.

import Plausible from "plausible-tracker";
import { analyticsOptedOut } from "./privacy";

type Props = Record<string, string | number | boolean>;

let tracker: ReturnType<typeof Plausible> | null = null;
let cleanupPageviews: (() => void) | null = null;

function enabled() {
  return typeof window !== "undefined" && !analyticsOptedOut();
}

export function initAnalytics() {
  if (!enabled() || tracker) return;

  const domain =
    (import.meta.env["VITE_PLAUSIBLE_DOMAIN"] as string | undefined) ||
    window.location.hostname;
  const apiHost =
    (import.meta.env["VITE_PLAUSIBLE_API_HOST"] as string | undefined) ||
    "https://plausible.io";

  tracker = Plausible({
    domain,
    apiHost,
    // Keep localhost noise out of production stats.
    trackLocalhost: false,
  });

  // Page views fire automatically on every client-side route change.
  cleanupPageviews = tracker.enableAutoPageviews();

  // One-time context event so language / device preferences show up as
  // breakdowns even for users who never trigger another event.
  trackEvent("session_context", {
    language: navigator.language || "unknown",
    device: deviceType(),
    simplified: document.documentElement.classList.contains("simplified"),
  });
}

export function stopAnalytics() {
  cleanupPageviews?.();
  cleanupPageviews = null;
  tracker = null;
}

export function trackEvent(eventName: string, props: Props = {}) {
  if (!enabled() || !tracker) return;
  try {
    tracker.trackEvent(eventName, { props });
  } catch {
    /* never let analytics break the app */
  }
}

export function deviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}
