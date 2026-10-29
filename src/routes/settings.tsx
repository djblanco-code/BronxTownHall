import { createFileRoute } from "@tanstack/react-router";
import { SettingsScreen } from "@/features/settings";

export const Route = createFileRoute("/settings")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Settings — Bronx Town Hall" }] }),
  component: SettingsScreen,
});
