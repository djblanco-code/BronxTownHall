import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { PagePhoto } from "@/features/photos";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { CATEGORIES } from "@/lib/data";

export const Route = createFileRoute("/request-resource")({
  staticData: { sitemap: true },
  component: RequestResource,
  head: () => ({
    meta: [
      { title: "Request a resource — Bronx Town Hall" },
      { name: "description", content: "Can't find what you need? Tell us and we'll add it." },
    ],
  }),
});

function RequestResource() {
  const { user } = useAuth();
  const [need, setNeed] = useState("");
  const [category, setCategory] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!need.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("resource_requests").insert({
      user_id: user?.id ?? null,
      need: need.trim(),
      category: category || null,
      neighborhood: neighborhood.trim() || null,
      note: note.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-3xl text-foreground sm:text-4xl">Thanks — request received</h1>
          <div className="mt-6 flex items-start gap-3 border-y border-border py-5">
            <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground">
                Our team will review it and add the resource if we can find it.
              </p>
              <Link
                to="/"
                className="no-min-h mt-4 inline-flex h-11 items-center rounded-md bg-primary-fill px-5 font-semibold text-primary-fill-foreground hover:bg-primary-fill-hover"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <PagePhoto slug={"hostos"} />
        <h1 className="text-3xl text-foreground sm:text-4xl">
          Can't find what you're looking for?
        </h1>
        <p className="mt-1 mb-6 text-muted-foreground">
          Tell us what you need and we'll work to add it. No account required.
        </p>
        <form onSubmit={submit} className="space-y-4 rounded-md border border-border p-4">
          <label className="block text-sm">
            <span className="mb-1 block font-bold">What do you need? *</span>
            <input
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              required
              maxLength={200}
              placeholder="e.g. Free dental clinic open on weekends"
              className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-base focus-visible:border-primary focus-visible:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-bold">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-base focus-visible:border-primary focus-visible:outline-none"
            >
              <option value="">Any</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-bold">Neighborhood</span>
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              maxLength={80}
              placeholder="e.g. Fordham, Mott Haven"
              className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-base focus-visible:border-primary focus-visible:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-bold">Anything else?</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              maxLength={1000}
              className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-base focus-visible:border-primary focus-visible:outline-none"
            />
          </label>
          <button
            disabled={loading}
            className="no-min-h h-11 rounded-md bg-primary-fill px-5 font-semibold text-primary-fill-foreground hover:bg-primary-fill-hover disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
