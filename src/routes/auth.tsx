import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/features/account";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Sign in — The Bronx App" }] }),
  component: AuthScreen,
});
