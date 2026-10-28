import { createFileRoute, Link } from "@tanstack/react-router";
import { isNonSpecificAddress } from "@/lib/address";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { RESOURCES } from "@/lib/data";
import { useI18n } from "@/lib/i18n-context";
import { Phone, Loader2 } from "lucide-react";
import { DirectionsLink } from "@/components/DirectionsLink";

export const Route = createFileRoute("/pack/$slug")({
  staticData: { sitemap: false },
  component: PackPage,
  validateSearch: (s: Record<string, unknown>) => ({ ids: typeof s.ids === "string" ? s.ids : undefined }),
  head: () => ({
    meta: [
      { title: "Shared resource pack | The Bronx App" },
      { name: "description", content: "A hand-picked set of Bronx resources — food, legal help, health, jobs and more — shared with you." },
      { property: "og:title", content: "Shared resource pack | The Bronx App" },
      { property: "og:description", content: "A hand-picked set of Bronx resources shared with you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PackPage() {
  const { slug } = Route.useParams();
  const { ids: inlineIds } = Route.useSearch();
  const { lang } = useI18n();
  const [ids, setIds] = useState<string[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (slug === "inline") {
        setIds((inlineIds || "").split(",").filter(Boolean));
        return;
      }
      const { data, error } = await supabase
        .from("resource_packs")
        .select("resource_ids")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) { setMissing(true); setIds([]); return; }
      setIds(data.resource_ids as string[]);
    }
    void load();
    return () => { cancelled = true; };
  }, [slug, inlineIds]);

  const items = (ids || []).map((id) => RESOURCES.find((r) => r.id === id)).filter(Boolean);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold">Resources shared with you</h1>
        <p className="mt-1 text-sm text-muted-foreground">Someone put this pack together for you on The Bronx App.</p>

        {ids === null && (
          <div className="mt-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading pack…</div>
        )}

        {ids !== null && items.length === 0 && (
          <p className="mt-8 text-muted-foreground">{missing ? "This share link has expired or is invalid." : "No resources in this pack."}</p>
        )}

        <ul className="mt-6 space-y-3">
          {items.map((r) => r && (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <Link to="/resource/$id" params={{ id: r.id }} className="font-bold text-foreground hover:text-primary">
                {r.name[lang]}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{r.address}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.hours[lang]}</p>
              <div className="mt-3 flex gap-2">
                {r.phone && (
                  <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call
                  </a>
                )}
                {!isNonSpecificAddress(r.address) && (
                  <DirectionsLink address={r.address} label="Get Directions" className="rounded-xl border border-border px-3 py-2 text-sm hover:no-underline" />
                )}
              </div>
            </li>
          ))}
        </ul>

        <Link to="/" className="mt-8 inline-block text-sm font-bold text-primary underline">Explore all Bronx resources →</Link>
      </div>
    </AppShell>
  );
}
