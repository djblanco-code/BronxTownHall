import { createFileRoute } from "@tanstack/react-router";
import { ListDetailScreen } from "@/features/saved";

export const Route = createFileRoute("/lists_/$id")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "My list — Bronx Town Hall" }] }),
  component: ListDetailRoute,
});

function ListDetailRoute() {
  const { id } = Route.useParams();
  return <ListDetailScreen id={id} />;
}
