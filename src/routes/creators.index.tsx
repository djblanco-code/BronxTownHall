import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/features/shell";
import { listCreators, type Creator } from "@/lib/creators";
import { Users } from "lucide-react";

export const Route = createFileRoute("/creators/")({
  staticData: { sitemap: false },
  component: CreatorsIndex,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Bronx Community Picks — Creators Share Their Favorite Spots" },
      {
        name: "description",
        content:
          "Bronx creators share the food, businesses and events they personally recommend, alongside The Bronx App's own verification badges.",
      },
      { property: "og:title", content: "Bronx Community Picks" },
      {
        property: "og:description",
        content: "Local creators curate their favorite Bronx resources, businesses and events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CreatorsIndex() {
  const [creators, setCreators] = useState<Creator[] | null>(null);

  useEffect(() => {
    listCreators().then(setCreators);
  }, []);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" /> Bronx Community Picks
        </h1>
        <p className="text-muted-foreground mt-2">
          Bronx creators pick their favorite places from listings already in the app. Their notes
          are personal recommendations — our own verification badge stays with each listing.
        </p>

        {creators === null && <p className="mt-6 text-muted-foreground">Loading…</p>}

        {creators?.length === 0 && (
          <p className="mt-6 text-muted-foreground">
            No creator pages yet. Creator accounts are invite-only while we test the idea with a few
            Bronx creators.
          </p>
        )}

        <ul className="mt-6 grid sm:grid-cols-2 gap-3">
          {(creators ?? []).map((c) => (
            <li key={c.id}>
              <Link
                to="/creators/$handle"
                params={{ handle: c.handle }}
                className="no-min-h flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition"
              >
                {c.photo_url ? (
                  <img
                    src={c.photo_url}
                    alt={`${c.display_name} profile photo`}
                    className="h-14 w-14 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="h-14 w-14 rounded-full bg-secondary grid place-items-center text-xl font-bold">
                    {c.display_name.charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-semibold truncate">{c.display_name}</span>
                  <span className="block text-sm text-muted-foreground truncate">
                    {c.follower_count
                      ? `${c.follower_count.toLocaleString()} followers`
                      : `@${c.handle}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
