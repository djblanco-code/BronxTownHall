import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "@/features/home";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "The Bronx App | Bronx Resources, Events & Local Help" },
      {
        name: "description",
        content:
          "Find trusted Bronx resources, events, local help, and community information in one accessible directory.",
      },
      { property: "og:title", content: "The Bronx App | Bronx Resources, Events & Local Help" },
      {
        property: "og:description",
        content:
          "Find trusted Bronx resources, events, local help, and community information in one accessible directory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeScreen,
});
