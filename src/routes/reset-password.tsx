import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordScreen } from "@/features/account";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Choose a new password — Bronx Town Hall" }] }),
  component: ResetPasswordScreen,
});
