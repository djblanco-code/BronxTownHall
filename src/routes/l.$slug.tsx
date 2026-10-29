import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useEffect, useState } from "react";
import { fetchListBySlug, type List, type ListItem } from "@/lib/cloud-lists";
import { RESOURCES } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/l/$slug")({
  staticData: { sitemap: false },
  component: PublicListPage,
  head: () => ({
    meta: [
      { title: "Shared resource list — The Bronx App" },
      { name: "description", content: "A community-curated list of Bronx resources." },
    ],
  }),
});

function PublicListPage() {
  const { slug } = Route.useParams();
  const { lang } = useI18n();
  const [data, setData] = useState<{ list: List; items: ListItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListBySlug(slug)
      .then(setData)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-4 py-10">Loading…</div>
      </AppShell>
    );
  if (!data)
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-4 py-10">List not found or no longer public.</div>
      </AppShell>
    );
  const { list, items } = data;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 print-area">
        <h1 className="text-2xl sm:text-3xl mb-1">{list.name}</h1>
        <p className="text-muted-foreground mb-4">A shared resource list from The Bronx App</p>
        <button
          onClick={() => window.print()}
          className="print-hide mb-6 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
        >
          <Printer className="h-4 w-4" /> Print this list
        </button>

        {items.length === 0 ? (
          <p className="text-muted-foreground">This list is empty.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => {
              const r = RESOURCES.find((x) => x.id === it.resource_id);
              if (!r) return null;
              return (
                <li key={it.id} className="rounded-2xl border border-border bg-card p-4">
                  <Link
                    to="/resource/$id"
                    params={{ id: r.id }}
                    className="font-semibold hover:underline"
                  >
                    {r.name[lang]}
                  </Link>
                  <p className="text-sm text-muted-foreground">{r.address}</p>
                  <p className="text-sm">📞 {r.phone}</p>
                  <p className="text-sm text-muted-foreground">{r.hours[lang]}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
