import { createFileRoute, redirect } from "@tanstack/react-router";

// Buzz showed sample alerts with no real data behind it, so it is out of the
// first version (docs/product-scope.md). Old links land on Events instead.
export const Route = createFileRoute("/buzz")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/events" });
  },
  component: () => null,
});
