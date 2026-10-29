import { ReactNode } from "react";
import { Languages } from "lucide-react";
import { listingLanguages } from "@/lib/languages";
import { useI18n } from "@/lib/i18n-context";

export type Attributes = {
  ownership?: string[];
  heritage?: string[];
  dietary?: string[];
  languages?: string[];
  accessibility?: string[];
};

// Text only: no flags or emoji beside the tags (docs/design-system.md).
const OWNERSHIP_LABEL: Record<string, { key: string }> = {
  women: { key: "womenOwned" },
  minority: { key: "minorityOwned" },
  immigrant: { key: "immigrantOwned" },
  family: { key: "familyOwned" },
  veteran: { key: "veteranOwned" },
  "fair-chance": { key: "fairChance" },
};

const DIETARY_LABEL: Record<string, { label: string }> = {
  halal: { label: "Halal" },
  kosher: { label: "Kosher" },
  vegetarian: { label: "Vegetarian" },
  vegan: { label: "Vegan" },
  "gluten-free": { label: "Gluten-Free" },
  "dairy-free": { label: "Dairy-Free" },
  "nut-free": { label: "Nut-Free" },
};

const ACCESS_LABEL: Record<string, { label: string }> = {
  wheelchair: { label: "Wheelchair Accessible" },
  restroom: { label: "Accessible Restroom" },
  "service-animals": { label: "Service Animals OK" },
  "large-print": { label: "Large Print Available" },
};

function cap(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
      {children}
    </span>
  );
}

/** `max` caps how many tags show (compact cards); the rest collapse into a "+N" tag. */
export function AttributeBadges({ a, max }: { a: Attributes; max?: number }) {
  const { t } = useI18n();
  const items: ReactNode[] = [];
  for (const k of a.ownership ?? []) {
    const normalized = k
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/-owned$/, "");
    const o = OWNERSHIP_LABEL[normalized];
    if (o) items.push(<Pill key={`o-${k}`}>{t(`interface.${o.key}`)}</Pill>);
  }
  for (const h of a.heritage ?? []) {
    items.push(<Pill key={`h-${h}`}>{cap(h)}-Owned</Pill>);
  }
  for (const d of a.dietary ?? []) {
    const o = DIETARY_LABEL[d];
    if (o) items.push(<Pill key={`d-${d}`}>{o.label}</Pill>);
  }
  for (const l of listingLanguages(a.languages)) {
    items.push(
      <Pill key={`l-${l}`}>
        <Languages className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
        {l}
      </Pill>,
    );
  }
  for (const x of a.accessibility ?? []) {
    const o = ACCESS_LABEL[x];
    if (o)
      items.push(
        <Pill key={`x-${x}`}>{x === "wheelchair" ? t("interface.wheelchair") : o.label}</Pill>,
      );
  }
  if (items.length === 0) return null;
  const hidden = max != null && items.length > max ? items.length - max : 0;
  return (
    <div className="flex flex-wrap gap-1.5">
      {hidden ? items.slice(0, max) : items}
      {hidden > 0 && <Pill key="more">+{hidden}</Pill>}
    </div>
  );
}
