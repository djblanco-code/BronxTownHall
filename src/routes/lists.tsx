import { createFileRoute } from "@tanstack/react-router";
import { ListsScreen } from "@/features/saved";

export const Route = createFileRoute("/lists")({
  staticData: { sitemap: false },
  component: ListsScreen,
  head: () => ({
    meta: [
      { title: "My lists — Bronx Town Hall" },
      { name: "description", content: "Group Bronx places to keep or share." },
    ],
  }),
});
