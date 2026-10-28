import { ReactNode } from "react";
import { listingLanguages } from "@/lib/languages";
import { useI18n } from "@/lib/i18n-context";

export type Attributes = {
  ownership?: string[];
  heritage?: string[];
  dietary?: string[];
  languages?: string[];
  accessibility?: string[];
};

const OWNERSHIP_LABEL: Record<string, { emoji: string; key: string }> = {
  women: { emoji: "👩", key: "womenOwned" },
  minority: { emoji: "🌟", key: "minorityOwned" },
  immigrant: { emoji: "🌍", key: "immigrantOwned" },
  family: { emoji: "👨‍👩‍👧‍👦", key: "familyOwned" },
  veteran: { emoji: "🎖️", key: "veteranOwned" },
  "fair-chance": { emoji: "⚖️", key: "fairChance" },
};

const DIETARY_LABEL: Record<string, { emoji: string; label: string }> = {
  halal: { emoji: "☪️", label: "Halal" },
  kosher: { emoji: "✡️", label: "Kosher" },
  vegetarian: { emoji: "🌱", label: "Vegetarian" },
  vegan: { emoji: "🌿", label: "Vegan" },
  "gluten-free": { emoji: "🌾", label: "Gluten-Free" },
  "dairy-free": { emoji: "🥛", label: "Dairy-Free" },
  "nut-free": { emoji: "🥜", label: "Nut-Free" },
};

const ACCESS_LABEL: Record<string, { emoji: string; label: string }> = {
  wheelchair: { emoji: "♿", label: "Wheelchair Accessible" },
  restroom: { emoji: "♿", label: "Accessible Restroom" },
  "service-animals": { emoji: "🐕", label: "Service Animals OK" },
  "large-print": { emoji: "🔠", label: "Large Print Available" },
};

const HERITAGE_FLAGS: Record<string, string> = {
  guinean: "🇬🇳", senegalese: "🇸🇳", nigerian: "🇳🇬", ghanaian: "🇬🇭", ivorian: "🇨🇮", malian: "🇲🇱",
  dominican: "🇩🇴", "puerto rican": "🇵🇷", mexican: "🇲🇽", ecuadorian: "🇪🇨", honduran: "🇭🇳", colombian: "🇨🇴",
  bengali: "🇧🇩", bangladeshi: "🇧🇩", indian: "🇮🇳", pakistani: "🇵🇰",
  yemeni: "🇾🇪", moroccan: "🇲🇦", egyptian: "🇪🇬", lebanese: "🇱🇧", syrian: "🇸🇾",
  haitian: "🇭🇹", jamaican: "🇯🇲", trinidadian: "🇹🇹",
  chinese: "🇨🇳", vietnamese: "🇻🇳", korean: "🇰🇷", filipino: "🇵🇭",
};

function cap(s: string) { return s.replace(/\b\w/g, (c) => c.toUpperCase()); }

function Pill({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">{children}</span>;
}

export function AttributeBadges({ a }: { a: Attributes }) {
  const { t } = useI18n();
  const items: ReactNode[] = [];
  for (const k of a.ownership ?? []) {
    const normalized = k.toLowerCase().replace(/\s+/g, "-").replace(/-owned$/, "");
    const o = OWNERSHIP_LABEL[normalized]; if (o) items.push(<Pill key={`o-${k}`}>{o.emoji} {t(`interface.${o.key}`)}</Pill>);
  }
  for (const h of a.heritage ?? []) {
    const flag = HERITAGE_FLAGS[h.toLowerCase()] ?? "🌍";
    items.push(<Pill key={`h-${h}`}>{flag} {cap(h)}-Owned</Pill>);
  }
  for (const d of a.dietary ?? []) {
    const o = DIETARY_LABEL[d]; if (o) items.push(<Pill key={`d-${d}`}>{o.emoji} {o.label}</Pill>);
  }
  for (const l of listingLanguages(a.languages)) {
    items.push(<Pill key={`l-${l}`}>🗣️ {l}</Pill>);
  }
  for (const x of a.accessibility ?? []) {
    const o = ACCESS_LABEL[x]; if (o) items.push(<Pill key={`x-${x}`}>{o.emoji} {x === "wheelchair" ? t("interface.wheelchair") : o.label}</Pill>);
  }
  if (items.length === 0) return null;
  return <div className="flex flex-wrap gap-1.5">{items}</div>;
}
