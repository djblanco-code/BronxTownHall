import { useEffect, useState } from "react";
import { loadOfficialUpdates, type OfficialUpdate } from "@/lib/org-accounts";
import { BadgeCheck, Megaphone } from "lucide-react";

type Item = OfficialUpdate & {
  org?: {
    org_name: string;
    office_name: string | null;
    status: string;
    verified_at: string | null;
  };
};

export function OfficialUpdatesFeed() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    void loadOfficialUpdates(10).then((r) => setItems(r as Item[]));
  }, []);

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border-2 border-border bg-card p-4">
        <h2 className="font-bold text-lg inline-flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Latest from your officials
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Nothing posted yet — check back soon. Only posts made by a verified government office
          through its own Bronx App account appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
      <h2 className="font-bold text-lg inline-flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" /> Latest from your officials
      </h2>
      <ul className="space-y-3">
        {items.map((u) => (
          <li key={u.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
            <p className="text-sm font-semibold inline-flex items-center gap-1.5">
              {u.org?.office_name || u.org?.org_name || "Bronx official"}
              {u.org?.status === "verified" && (
                <BadgeCheck className="h-4 w-4 text-success" aria-label="Verified office" />
              )}
            </p>
            <p className="text-sm mt-0.5">{u.body}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(u.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Posted directly by the offices themselves through their Bronx App account.
      </p>
    </section>
  );
}
