import { createFileRoute, redirect } from "@tanstack/react-router";

// The food directory now lives inside the Food category page.
export const Route = createFileRoute("/food")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/category/$cat", params: { cat: "food" } });
  },
  component: () => null,
});
