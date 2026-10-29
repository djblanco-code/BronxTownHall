import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/features/shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin_/questions")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Resident Questions — Bronx Town Hall Admin" },
      {
        name: "description",
        content: "Anonymized questions residents asked, to find gaps in listings.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Resident Questions — Bronx Town Hall Admin" },
      { property: "og:description", content: "Anonymized resident questions report." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuestionsPage,
});

type Row = {
  id: string;
  question: string;
  category: string | null;
  outcome: string;
  match_count: number;
  created_at: string;
};

function QuestionsPage() {
  const { user, isAdmin, loading } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("ask_questions")
      .select("id,question,category,outcome,match_count,created_at")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, [isAdmin]);
  const gaps = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows ?? [])
      if (r.outcome === "no_match")
        m.set(r.category ?? "unclear", (m.get(r.category ?? "unclear") ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  if (loading || !isAdmin) {
    return (
      <AppShell>
        <div className="mx-auto max-w-sm space-y-4 px-4 py-12 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-2xl">Resident questions</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : "This page is for Bronx Town Hall staff. Sign in with a staff account."}
          </p>
          {!loading && !user && (
            <Link
              to="/auth"
              className="inline-block rounded-md bg-primary-fill px-4 py-2.5 font-semibold text-primary-fill-foreground"
            >
              Sign in
            </Link>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl">Resident questions</h1>
        <p className="text-sm text-muted-foreground">
          Anonymized. Emails and phone numbers are removed before saving, and questions are kept for
          90 days.
        </p>
        {rows === null ? (
          <p className="mt-4">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4">No questions in the last 90 days.</p>
        ) : (
          <>
            <h2 className="font-semibold mt-6">Unanswered by category (gaps)</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {gaps.map(([c, n]) => (
                <li key={c} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {c}: {n}
                </li>
              ))}
            </ul>
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="py-2">When</th>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border align-top">
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="pr-2">{r.question}</td>
                    <td className="pr-2">{r.category ?? "—"}</td>
                    <td>
                      {r.outcome === "answered"
                        ? `${r.match_count} match${r.match_count === 1 ? "" : "es"}`
                        : r.outcome === "no_match"
                          ? "No match"
                          : "Off-topic"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </AppShell>
  );
}
