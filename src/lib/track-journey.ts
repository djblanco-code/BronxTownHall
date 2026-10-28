// User-journey analytics: onboarding → browse → find → return.
// All state is stored locally (dates only) — no personal data leaves the device.
import { trackEvent } from "./analytics";
import { recordCategoryView } from "./interest-history";

const LAST_VISIT_KEY = "bronx.lastVisit";
const CHURN_KEY = "bronx.churnReported";

export function trackOnboardingStarted(languageSelected: string) {
  trackEvent("onboarding_started", { language_selected: languageSelected });
}

export function trackOnboardingCompleted({
  interests,
  zipCode,
  skipped,
}: {
  interests: string[];
  zipCode: string;
  skipped?: boolean;
}) {
  trackEvent("onboarding_completed", {
    selected_interests: interests.length ? interests.join(",") : "(none)",
    interest_count: interests.length,
    zip_code: zipCode || "(unset)",
    skipped: Boolean(skipped),
  });
}

export function trackCategoryBrowsed(categoryName: string) {
  if (!categoryName) return;
  trackEvent("category_browsed", { category_name: categoryName });
  recordCategoryView(categoryName);
}

/** The user acted on a result they searched for — i.e. they found what they needed. */
export function trackResourceFound({
  query,
  resourceId,
  category,
}: {
  query: string;
  resourceId: string;
  category?: string;
}) {
  trackEvent("resource_found", {
    search_query: (query || "").trim().toLowerCase().slice(0, 60) || "(empty)",
    resource_id: resourceId,
    ...(category ? { category } : {}),
  });
}

const DAY = 86_400_000;

/**
 * Called once per session. Emits `user_retention` when someone comes back after
 * 7+ days, and `user_churned` when they resurface after a 30+ day gap.
 */
export function trackVisit() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  let last = 0;
  try {
    last = Number(localStorage.getItem(LAST_VISIT_KEY) || 0);
  } catch {
    return;
  }

  if (last > 0) {
    const days = Math.floor((now - last) / DAY);
    const lastVisitDate = new Date(last).toISOString().slice(0, 10);
    if (days >= 30) {
      const reported = localStorage.getItem(CHURN_KEY);
      if (reported !== lastVisitDate) {
        trackEvent("user_churned", { last_visit_date: lastVisitDate, days_since_last_visit: days });
        localStorage.setItem(CHURN_KEY, lastVisitDate);
      }
    }
    if (days >= 7) {
      trackEvent("user_retention", {
        days_since_last_visit: days,
        last_visit_date: lastVisitDate,
      });
    }
  }

  try {
    localStorage.setItem(LAST_VISIT_KEY, String(now));
  } catch {
    /* ignore */
  }
}
