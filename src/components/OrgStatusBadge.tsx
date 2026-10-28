import { badgeFor, type OrgAccount } from "@/lib/org-accounts";
import { BadgeCheck, CircleAlert, CircleHelp } from "lucide-react";

const TONE: Record<string, string> = {
  green: "bg-success/15 text-success border-success/40",
  amber: "bg-warning/15 text-warning-foreground border-warning/40",
  neutral: "bg-muted text-muted-foreground border-border",
};

/**
 * Tier 1 = "Not yet verified" (self-reported, live immediately).
 * Tier 2 = "Verified [date]" — only after a Bronx App reviewer confirms by hand.
 */
export function StatusBadge({
  org,
}: {
  org: Pick<OrgAccount, "status" | "verified_at" | "verified_fields">;
}) {
  const b = badgeFor(org);
  const Icon = b.tone === "green" ? BadgeCheck : b.tone === "amber" ? CircleAlert : CircleHelp;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-semibold ${TONE[b.tone]}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {b.label}
    </span>
  );
}

export function SelfReportedNote() {
  return (
    <p className="text-xs text-muted-foreground">
      Details on this page were provided by the organization itself. A green badge means a Bronx App
      reviewer confirmed them by phone or in person.
    </p>
  );
}
