import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/donate")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Donate — The Bronx App" },
      {
        name: "description",
        content:
          "Support The Bronx App: help us keep resources current, add new categories, and reach more residents.",
      },
    ],
  }),
  component: DonatePage,
});

function DonatePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link
          to="/"
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Home
        </Link>
        <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
          Keep The Bronx App Free
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Your donation pays for hosting, verifying listings, and translating resources into five
          languages — so every Bronx neighbor can find help.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[10, 25, 100].map((n) => (
            <button
              key={n}
              className="no-min-h min-h-16 rounded-md border border-border p-4 text-2xl font-bold text-foreground hover:bg-secondary"
            >
              ${n}
            </button>
          ))}
        </div>

        <a
          href="mailto:hello@thebronxapp.org?subject=Donation%20inquiry"
          className="no-min-h inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-primary-fill px-6 py-4 text-lg font-bold text-primary-fill-foreground hover:bg-primary-fill-hover"
        >
          Donate Now
        </a>

        <p className="text-sm text-muted-foreground mt-6">
          Prefer to give another way? Email{" "}
          <a href="mailto:hello@thebronxapp.org" className="text-primary underline">
            hello@thebronxapp.org
          </a>{" "}
          — we accept checks, employer matches, and volunteer time.
        </p>
      </div>
    </AppShell>
  );
}
