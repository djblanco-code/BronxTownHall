import { createFileRoute } from "@tanstack/react-router";
import { OnboardingScreen } from "@/features/onboarding";

export const Route = createFileRoute("/onboarding")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Welcome — Bronx Town Hall" }] }),
  component: OnboardingScreen,
});
