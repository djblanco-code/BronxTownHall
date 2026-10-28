import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
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
      { title: "Request a resource — The Bronx App" },
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
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <Inbox className="h-12 w-12 text-success mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Thanks — request received</h1>
          <p className="text-muted-foreground mb-4">
            Our team will review it and add the resource if we can find it.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Back to home
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Can't find what you're looking for?</h1>
        <p className="text-muted-foreground mb-6">
          Tell us what you need and we'll work to add it. No account required.
        </p>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <label className="block text-sm">
            <span className="block font-medium mb-1">What do you need? *</span>
            <input
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              required
              maxLength={200}
              placeholder="e.g. Free dental clinic open on weekends"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </label>
          <label className="block text-sm">
            <span className="block font-medium mb-1">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            >
              <option value="">Any</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.id}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="block font-medium mb-1">Neighborhood</span>
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              maxLength={80}
              placeholder="e.g. Fordham, Mott Haven"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </label>
          <label className="block text-sm">
            <span className="block font-medium mb-1">Anything else?</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </label>
          <button
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
