import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/features/shell";
import { useAuth } from "@/hooks/use-auth";
import {
  addPick,
  creatorStats,
  getCreatorByHandle,
  listPicks,
  removePick,
  searchListings,
  trackCreatorView,
  trackPickClick,
  updatePickNote,
  type Creator,
  type CreatorPick,
  type PickCandidate,
} from "@/lib/creators";
import { VerifiedPill } from "@/components/VerifiedPill";
import { Instagram, Youtube, Music2, Quote, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/creators/$handle")({
  staticData: { sitemap: false },
  component: CreatorPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle}'s Bronx Picks — The Bronx App` },
      {
        name: "description",
        content: `Favorite Bronx food, businesses and events picked by @${params.handle}, with The Bronx App's own verification status on every listing.`,
      },
      { property: "og:title", content: `${params.handle}'s Bronx Picks` },
      {
        property: "og:description",
        content: "A Bronx creator's personal picks from listings already in The Bronx App.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CreatorPage() {
  const { handle } = Route.useParams();
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null | "missing">(null);
  const [picks, setPicks] = useState<CreatorPick[]>([]);
  const [stats, setStats] = useState<{ views: number; clicks: number } | null>(null);

  const refreshPicks = useCallback(async (id: string) => setPicks(await listPicks(id)), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await getCreatorByHandle(handle);
      if (cancelled) return;
      if (!c) return setCreator("missing");
      setCreator(c);
      void trackCreatorView(c.id);
      void refreshPicks(c.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [handle, refreshPicks]);

  const isOwner = !!creator && creator !== "missing" && !!user && creator.user_id === user.id;

  useEffect(() => {
    if (isOwner) creatorStats(creator.id).then(setStats);
  }, [isOwner, creator]);

  if (creator === null) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-10 text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  if (creator === "missing") {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold">Creator page not found</h1>
          <Link to="/creators" className="text-primary underline">
            ← All Bronx creators
          </Link>
        </div>
      </AppShell>
    );
  }

  const socials = creator.socials ?? {};

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/creators" className="no-min-h text-sm text-primary hover:underline">
          ← All Bronx creators
        </Link>

        <header className="mt-4 flex items-start gap-4">
          {creator.photo_url ? (
            <img
              src={creator.photo_url}
              alt={`${creator.display_name} profile photo`}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="h-20 w-20 rounded-full bg-secondary grid place-items-center text-2xl font-bold">
              {creator.display_name.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{creator.display_name}</h1>
            {creator.bio && <p className="text-muted-foreground mt-1">{creator.bio}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              {socials.instagram && (
                <a
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  href={`https://instagram.com/${socials.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="h-4 w-4" /> {socials.instagram}
                </a>
              )}
              {socials.tiktok && (
                <a
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  href={`https://tiktok.com/@${socials.tiktok.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Music2 className="h-4 w-4" /> {socials.tiktok}
                </a>
              )}
              {socials.youtube && (
                <a
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  href={`https://youtube.com/${socials.youtube.replace("@", "@")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Youtube className="h-4 w-4" /> {socials.youtube}
                </a>
              )}
            </div>
          </div>
        </header>

        {isOwner && (
          <section className="mt-6 rounded-2xl border-2 border-border bg-card p-4">
            <h2 className="font-bold">Your page (only you see this)</h2>
            <p className="text-sm text-muted-foreground">
              {stats
                ? `${stats.views} page views · ${stats.clicks} taps on your picks`
                : "Loading your counts…"}
            </p>
            <PickAdder
              creatorId={creator.id}
              onAdded={() => refreshPicks(creator.id)}
              count={picks.length}
            />
          </section>
        )}

        <h2 className="text-xl font-bold mt-8">
          {creator.display_name.split(" ")[0]}&apos;s picks ({picks.length})
        </h2>
        <p className="text-sm text-muted-foreground">
          Personal recommendations. Accuracy badges below come from The Bronx App, not the creator.
        </p>

        <ul className="mt-4 space-y-3">
          {picks.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{p.target_name}</p>
                  {p.target_category && (
                    <p className="text-xs font-semibold text-primary capitalize">
                      {p.target_category}
                    </p>
                  )}
                </div>
                <VerifiedPill
                  status="needs_verification"
                  category={p.target_category ?? undefined}
                  compact
                />
              </div>

              {p.note && (
                <p className="mt-2 rounded-xl bg-secondary/60 p-3 text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Quote className="h-3.5 w-3.5" /> Why {creator.display_name.split(" ")[0]}{" "}
                    picked this
                  </span>
                  <span className="block mt-1">{p.note}</span>
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {p.target_type === "resource" && (
                  <Link
                    to="/resource/$id"
                    params={{ id: p.target_id }}
                    onClick={() => trackPickClick(creator.id, p.target_id, "open")}
                    className="no-min-h text-primary font-semibold hover:underline"
                  >
                    See full listing
                  </Link>
                )}
                {isOwner && (
                  <>
                    <button
                      onClick={async () => {
                        const note = window.prompt("Your note (150 characters max)", p.note ?? "");
                        if (note === null) return;
                        await updatePickNote(p.id, note);
                        refreshPicks(creator.id);
                      }}
                      className="no-min-h text-sm text-primary hover:underline"
                    >
                      Edit note
                    </button>
                    <button
                      onClick={async () => {
                        await removePick(p.id);
                        refreshPicks(creator.id);
                      }}
                      className="no-min-h inline-flex items-center gap-1 text-sm text-destructive hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
          {picks.length === 0 && <li className="text-muted-foreground">No picks yet.</li>}
        </ul>
      </div>
    </AppShell>
  );
}

function PickAdder({
  creatorId,
  onAdded,
  count,
}: {
  creatorId: string;
  onAdded: () => void;
  count: number;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PickCandidate[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const r = await searchListings(q);
      if (!cancelled) setResults(r);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <div className="mt-3">
      <label className="block">
        <span className="text-sm font-medium">Add a pick — search listings already in the app</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or address"
          className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-border bg-background"
        />
      </label>
      <ul className="mt-2 space-y-1">
        {results.map((r) => (
          <li
            key={`${r.target_type}-${r.target_id}`}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="min-w-0 truncate">
              {r.name} <span className="text-muted-foreground">· {r.address}</span>
            </span>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const note =
                  window.prompt(`Why do you recommend ${r.name}? (150 characters max)`) ?? "";
                await addPick({
                  creatorId,
                  targetType: r.target_type,
                  targetId: r.target_id,
                  targetName: r.name,
                  targetCategory: r.category,
                  note,
                  position: count,
                });
                setBusy(false);
                setQ("");
                setResults([]);
                onAdded();
              }}
              className="no-min-h inline-flex items-center gap-1 text-primary font-semibold hover:underline shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
