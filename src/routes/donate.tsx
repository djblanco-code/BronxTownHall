import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";

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
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Link
          to="/"
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground mb-4">
          <Heart className="h-8 w-8" fill="currentColor" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Keep The Bronx App Free</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Your donation pays for hosting, verifying listings, and translating resources into five
          languages — so every Bronx neighbor can find help.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[10, 25, 100].map((n) => (
            <button
              key={n}
              className="no-min-h rounded-2xl border-2 border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 p-5 font-bold text-2xl transition"
            >
              ${n}
            </button>
          ))}
        </div>

        <a
          href="mailto:hello@thebronxapp.org?subject=Donation%20inquiry"
          className="no-min-h w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-primary text-primary-foreground text-lg font-bold hover:bg-primary/90"
        >
          <Sparkles className="h-5 w-5" /> Donate Now
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
