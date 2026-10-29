import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-register")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/portal" });
  },
  component: () => null,
});
