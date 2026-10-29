import { createFileRoute } from "@tanstack/react-router";
import { FavoritesScreen } from "@/features/saved";

export const Route = createFileRoute("/favorites")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Saved places — The Bronx App" }] }),
  component: FavoritesScreen,
});
