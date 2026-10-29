import { createFileRoute } from "@tanstack/react-router";
import { SharedListScreen } from "@/features/saved";

export const Route = createFileRoute("/l/$slug")({
  staticData: { sitemap: false },
  component: SharedListRoute,
  head: () => ({
    meta: [
      { title: "Shared list — Bronx Town Hall" },
      { name: "description", content: "A list of Bronx places someone shared with you." },
    ],
  }),
});

function SharedListRoute() {
  const { slug } = Route.useParams();
  return <SharedListScreen slug={slug} />;
}
