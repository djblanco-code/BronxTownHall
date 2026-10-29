import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, BriefcaseBusiness, MapPinned, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
    <section aria-labelledby="hiring-board-heading" className="space-y-3">
      <div className="border-t-[3px] border-foreground pt-2">
        <p className="label-caps text-primary">Quick hiring board</p>
        <h2 id="hiring-board-heading" className="text-lg font-bold sm:text-2xl">
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
        <EmptyState icon={BriefcaseBusiness} title="No active openings match these filters yet." />
      ) : (
        <ul className="divide-y divide-border border-y border-border sm:grid sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0 sm:border-b-0">
          {visible.map((post) => {
            const href = hiringActionHref(post.application_method);
            return (
              <li key={post.id} className="space-y-3 py-3 sm:border-b sm:border-border">
                <div className="flex items-start gap-3">
                  <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <h3 className="font-bold">{post.role_title}</h3>
                    <p className="text-sm text-muted-foreground">{post.employer_name}</p>
                  </div>
                </div>
                <p className="text-sm">{post.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.bronx_preferred && (
                    <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                      Bronx Preferred
                    </span>
                  )}
                  {post.fair_chance_employer && (
                    <span className="rounded-sm bg-success/15 px-1.5 py-0.5 text-xs font-bold text-success">
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
