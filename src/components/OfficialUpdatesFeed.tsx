import { useEffect, useState } from "react";
import { loadOfficialUpdates, type OfficialUpdate } from "@/lib/org-accounts";
import { BadgeCheck, Megaphone } from "lucide-react";
import { Section } from "@/components/ui/section";
import { isDemoMode, SAMPLE_UPDATES } from "@/features/demo";

type Item = OfficialUpdate & {
  org?: {
    org_name: string;
    office_name: string | null;
    status: string;
    verified_at: string | null;
  };
};

/** Posts from verified offices, as a ruled section of rows on the Town Hall page. */
export function OfficialUpdatesFeed() {
  const [items, setItems] = useState<Item[]>([]);
  const [sample, setSample] = useState(false);

  useEffect(() => {
    // Demo mode (labeled by a banner) shows sample announcements, never as verified posts.
    if (isDemoMode()) {
      setSample(true);
      setItems(
        SAMPLE_UPDATES.map((u) => ({
          id: u.id,
          org_id: "demo",
          user_id: "demo",
          body: u.body,
          status: "published" as const,
          created_at: u.created_at,
          org: { org_name: u.office, office_name: u.office, status: "sample", verified_at: null },
        })),
      );
      return;
    }
    void loadOfficialUpdates(10).then((r) => setItems(r as Item[]));
  }, []);

  return (
    <Section id="official-updates-title" title="Latest from your officials" ruled className="px-0">
      {items.length === 0 ? (
        <p className="flex items-start gap-3 border-b border-border py-3 text-sm text-muted-foreground">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span dir="auto">
            Nothing posted yet — check back soon. Only posts made by a verified government office
            through its own Bronx App account appear here.
          </span>
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border border-b border-border">
            {items.map((u) => (
              <li key={u.id} className="flex items-start gap-3 py-3">
                <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="label-caps inline-flex items-center gap-1.5 text-primary">
                    <span dir="auto">
                      {u.org?.office_name || u.org?.org_name || "Bronx official"}
                    </span>
                    {u.org?.status === "verified" && (
                      <BadgeCheck className="h-4 w-4 text-success" aria-label="Verified office" />
                    )}
                  </p>
                  <p dir="auto" className="mt-0.5 text-sm text-foreground">
                    {u.body}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {!sample && (
            <p dir="auto" className="mt-2 text-xs text-muted-foreground">
              Posted directly by the offices themselves through their Bronx App account.
            </p>
          )}
        </>
      )}
    </Section>
  );
}
