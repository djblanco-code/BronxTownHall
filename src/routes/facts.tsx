import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import {
  BRONX_FACTS,
  factOfTheDay,
  getLikedFacts,
  toggleLikedFact,
  dateForFact,
  type FactCategory,
} from "@/lib/bronx-facts";
import { ArrowLeft, Heart, Search } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/facts")({
  staticData: { sitemap: true },
  component: FactsPage,
});

const CATS: ("All" | FactCategory)[] = [
  "All",
  "History",
  "Culture",
  "Geography",
  "People",
  "Landmarks",
  "Food",
  "Sports",
  "Music",
];

function FactsPage() {
  const today = factOfTheDay();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | FactCategory>("All");
  const [liked, setLiked] = useState<number[]>([]);

  useEffect(() => {
    setLiked(getLikedFacts());
  }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return BRONX_FACTS.filter(
      (f) =>
        (cat === "All" || f.category === cat) &&
        (!needle ||
          f.fact.toLowerCase().includes(needle) ||
          f.category.toLowerCase().includes(needle)),
    );
  }, [q, cat]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link
          to="/"
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Bronx Daily</h1>
        <p className="mt-1 text-muted-foreground">
          A new fact every day. Tap the heart to save the ones you love.
        </p>

        <figure className="m-0 mt-6 border-t-[3px] border-foreground pt-2">
          <figcaption className="label-caps text-primary">Today</figcaption>
          <span
            aria-hidden="true"
            className="font-display -mb-2 block h-10 text-7xl leading-none text-bronx-orange"
          >
            “
          </span>
          <blockquote className="font-display m-0 text-xl leading-snug font-bold text-foreground sm:text-2xl">
            {today.fact}
          </blockquote>
          <p className="label-caps mt-2 text-muted-foreground">{today.category}</p>
        </figure>

        <div className="mt-6 space-y-3">
          <label className="relative block">
            <span className="sr-only">Search Bronx facts</span>
            <Search
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search facts (e.g. zoo, hip hop, Poe)"
              className="h-12 w-full rounded-md border-2 border-foreground bg-card ps-10 pe-3 text-base focus-visible:border-primary focus-visible:outline-none"
            />
          </label>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {CATS.map((c) => (
              <Chip key={c} selected={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <ul className="mt-5 divide-y divide-border border-t-[3px] border-b border-t-foreground border-b-border">
          {list.map((f, i) => {
            const isLiked = liked.includes(f.id);
            return (
              <li key={f.id} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="label-caps text-primary">
                    {f.category} <span className="text-muted-foreground">· {dateForFact(i)}</span>
                  </p>
                  <p className="mt-0.5 text-foreground sm:text-base">{f.fact}</p>
                </div>
                <button
                  onClick={() => setLiked(toggleLikedFact(f.id))}
                  aria-pressed={isLiked}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  className={`no-min-h grid h-11 w-11 shrink-0 place-items-center rounded-md hover:bg-secondary ${
                    isLiked ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="py-4 text-muted-foreground">No facts match.</li>}
        </ul>
      </div>
    </AppShell>
  );
}
