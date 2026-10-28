import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/business-register")({
  staticData: { sitemap: true },
  beforeLoad: () => { throw redirect({ to: "/auth" }); },
  component: () => null,
});
