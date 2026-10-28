import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, BriefcaseBusiness, MapPinned, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hiringActionHref, loadHiringPosts, type HiringPost } from "@/lib/business-support";

type Sort = "newest" | "employer";

export function HiringBoard() {
  const [posts, setPosts] = useState<HiringPost[]>([]);
  const [bronxOnly, setBronxOnly] = useState(false);
  const [fairChanceOnly, setFairChanceOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    void loadHiringPosts().then((rows) => setPosts(rows.filter((p) => p.status === "published")));
  }, []);
  const visible = useMemo(
    () =>
      posts
        .filter((p) => !bronxOnly || p.bronx_preferred)
        .filter((p) => !fairChanceOnly || p.fair_chance_employer)
        .sort((a, b) =>
          sort === "employer"
            ? a.employer_name.localeCompare(b.employer_name)
            : b.created_at.localeCompare(a.created_at),
        ),
    [posts, bronxOnly, fairChanceOnly, sort],
  );

  return (
    <section aria-labelledby="hiring-board-heading" className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase text-primary">Quick hiring board</p>
        <h2 id="hiring-board-heading" className="text-xl font-bold">
          Now Hiring
        </h2>
        <p className="text-sm text-muted-foreground">
          Short, active openings from Bronx businesses.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={bronxOnly ? "default" : "outline"}
          onClick={() => setBronxOnly((v) => !v)}
        >
          <MapPinned /> Bronx Preferred
        </Button>
        <Button
          size="sm"
          variant={fairChanceOnly ? "default" : "outline"}
          onClick={() => setFairChanceOnly((v) => !v)}
        >
          <Scale /> Fair Chance Employers
        </Button>
        <label className="ms-auto inline-flex items-center gap-2 text-xs font-semibold">
          <ArrowUpDown className="h-4 w-4" /> Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-border bg-background px-2 py-1.5"
          >
            <option value="newest">Newest</option>
            <option value="employer">Employer</option>
          </select>
        </label>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No active openings match these filters yet.
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {visible.map((post) => {
            const href = hiringActionHref(post.application_method);
            return (
              <li key={post.id} className="rounded-md border border-border bg-card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold">{post.role_title}</h3>
                    <p className="text-sm text-muted-foreground">{post.employer_name}</p>
                  </div>
                </div>
                <p className="text-sm">{post.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.bronx_preferred && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      Bronx Preferred
                    </span>
                  )}
                  {post.fair_chance_employer && (
                    <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-bold text-success">
                      Fair Chance Employer · self-reported
                    </span>
                  )}
                </div>
                {href ? (
                  <Button asChild size="sm">
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      Apply or contact
                    </a>
                  </Button>
                ) : (
                  <p className="rounded-md bg-secondary p-2 text-xs">
                    <strong>How to apply:</strong> {post.application_method}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
