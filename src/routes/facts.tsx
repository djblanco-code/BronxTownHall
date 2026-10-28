import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { BRONX_FACTS, factOfTheDay, getLikedFacts, toggleLikedFact, dateForFact, type FactCategory } from "@/lib/bronx-facts";
import { ArrowLeft, Heart, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/facts")({
  staticData: { sitemap: true }, component: FactsPage });

const CATS: ("All" | FactCategory)[] = ["All", "History", "Culture", "Geography", "People", "Landmarks", "Food", "Sports", "Music"];

function FactsPage() {
  const today = factOfTheDay();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | FactCategory>("All");
  const [liked, setLiked] = useState<number[]>([]);

  useEffect(() => { setLiked(getLikedFacts()); }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return BRONX_FACTS.filter((f) =>
      (cat === "All" || f.category === cat) &&
      (!needle || f.fact.toLowerCase().includes(needle) || f.category.toLowerCase().includes(needle))
    );
  }, [q, cat]);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/" className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"><ArrowLeft className="h-4 w-4" /> Home</Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground inline-flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Bronx Daily
        </h1>
        <p className="text-muted-foreground mt-1">A new fact every day. Tap the heart to save the ones you love.</p>

        <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Today</p>
          <p className="mt-1 text-lg sm:text-xl font-semibold">{today.fact}</p>
          <p className="mt-2 text-xs text-muted-foreground">{today.category}</p>
        </div>

        <div className="mt-5 space-y-3">
          <label className="relative block">
            <span className="sr-only">Search Bronx facts</span>
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search facts (e.g. zoo, hip hop, Poe)"
              className="w-full ps-10 pe-3 py-3 rounded-xl border-2 border-border bg-card focus:outline-none focus:border-primary min-h-[48px]"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`no-min-h shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border-2 ${
                  cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"
                }`}
              >{c}</button>
            ))}
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {list.map((f, i) => {
            const isLiked = liked.includes(f.id);
            return (
              <li key={f.id} className="rounded-2xl border-2 border-border bg-card p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">{f.category}</span>
                    <span className="text-xs text-muted-foreground">{dateForFact(i)}</span>
                  </div>
                  <p className="text-sm sm:text-base text-foreground">{f.fact}</p>
                </div>
                <button
                  onClick={() => setLiked(toggleLikedFact(f.id))}
                  aria-pressed={isLiked}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  className={`no-min-h shrink-0 h-10 w-10 rounded-full grid place-items-center border-2 ${
                    isLiked ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border bg-card hover:border-destructive/40"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="text-center text-muted-foreground py-8">No facts match.</li>}
        </ul>
      </div>
    </AppShell>
  );
}
