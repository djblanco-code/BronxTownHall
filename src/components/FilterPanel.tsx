import { useState } from "react";
import { BRONX_NEIGHBORHOODS } from "@/lib/neighborhoods";
import { A11yDialog } from "./A11yDialog";
import { useI18n } from "@/lib/i18n-context";

export type FilterState = {
  ownership: string[];
  heritage: string;
  dietary: string[];
  languages: string[];
  accessibility: string[];
  neighborhood: string;
};

export const EMPTY_FILTERS: FilterState = {
  ownership: [], heritage: "", dietary: [], languages: [], accessibility: [], neighborhood: "",
};

export function isFilterActive(f: FilterState) {
  return f.ownership.length + f.dietary.length + f.languages.length + f.accessibility.length > 0
    || !!f.heritage.trim() || !!f.neighborhood;
}

const OWNERSHIP = [
  ["women", "womenOwned"], ["minority", "minorityOwned"],
  ["immigrant", "immigrantOwned"], ["family", "familyOwned"], ["veteran", "veteranOwned"],
] as const;
const DIETARY = [
  ["halal", "Halal"], ["kosher", "Kosher"], ["vegetarian", "Vegetarian"],
  ["vegan", "Vegan"], ["gluten-free", "Gluten-Free"],
] as const;
const LANGS = [
  ["spanish", "Spanish"], ["french", "French"], ["bengali", "Bengali"],
  ["arabic", "Arabic"], ["mandarin", "Mandarin"],
] as const;
const ACCESS = [["wheelchair", "Wheelchair Accessible"]] as const;

function toggle(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function FilterPanel({
  open, onClose, value, onApply, showDietary, showFairChance = false, resultCount,
}: {
  open: boolean; onClose: () => void; value: FilterState;
  onApply: (next: FilterState) => void; showDietary: boolean; showFairChance?: boolean; resultCount: number;
}) {
  const { t } = useI18n();
  const [local, setLocal] = useState<FilterState>(value);
  return (
    <A11yDialog open={open} onClose={onClose} title={t("interface.filters")}>
      <div className="space-y-5">
        <Group title={t("interface.neighborhood")}>
          <label htmlFor="flt-nbhd" className="sr-only">{t("interface.neighborhood")}</label>
          <select id="flt-nbhd" value={local.neighborhood} onChange={(e) => setLocal({ ...local, neighborhood: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm min-h-[44px]">
            <option value="">{t("interface.anyNeighborhood")}</option>
            {BRONX_NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Group>
        <Fieldset legend={t("interface.ownership")}>
          {OWNERSHIP.map(([id, key]) => (
            <Check key={id} checked={local.ownership.includes(id)} onChange={() => setLocal({ ...local, ownership: toggle(local.ownership, id) })}>{t(`interface.${key}`)}</Check>
          ))}
          {showFairChance && <Check checked={local.ownership.includes("fair-chance")} onChange={() => setLocal({ ...local, ownership: toggle(local.ownership, "fair-chance") })}>{t("interface.fairChance")}</Check>}
        </Fieldset>
        <Group title={t("interface.heritage")}>
          <label htmlFor="flt-heritage" className="sr-only">{t("interface.heritage")}</label>
          <input id="flt-heritage" value={local.heritage} onChange={(e) => setLocal({ ...local, heritage: e.target.value })} placeholder={t("interface.heritagePlaceholder")} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm min-h-[44px]" />
        </Group>
        {showDietary && (
          <Fieldset legend={t("interface.dietary")}>
            {DIETARY.map(([id, label]) => (
              <Check key={id} checked={local.dietary.includes(id)} onChange={() => setLocal({ ...local, dietary: toggle(local.dietary, id) })}>{label}</Check>
            ))}
          </Fieldset>
        )}
        <Fieldset legend={t("interface.languageSpoken")}>
          {LANGS.map(([id, label]) => (
            <Check key={id} checked={local.languages.includes(id)} onChange={() => setLocal({ ...local, languages: toggle(local.languages, id) })}>{label}</Check>
          ))}
        </Fieldset>
        <Fieldset legend={t("interface.accessibility")}>
          {ACCESS.map(([id, label]) => (
            <Check key={id} checked={local.accessibility.includes(id)} onChange={() => setLocal({ ...local, accessibility: toggle(local.accessibility, id) })}>{label}</Check>
          ))}
        </Fieldset>
      </div>
      <div className="pt-4 mt-4 border-t border-border flex items-center gap-2 sticky bottom-0 bg-card">
        <button onClick={() => setLocal(EMPTY_FILTERS)} className="no-min-h px-4 py-3 rounded-xl border border-border bg-card text-sm font-semibold min-h-[44px]">{t("interface.clearAll")}</button>
        <button onClick={() => { onApply(local); onClose(); }} className="no-min-h flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold min-h-[44px]">{t("interface.showResults", { count: resultCount })}</button>
      </div>
    </A11yDialog>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="font-semibold mb-2">{title}</h3><div className="space-y-2">{children}</div></section>;
}
function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return <fieldset><legend className="font-semibold mb-2">{legend}</legend><div className="space-y-2">{children}</div></fieldset>;
}
function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-secondary min-h-[44px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5" />
      <span className="text-sm font-medium">{children}</span>
    </label>
  );
}

export function matchesFilters(item: { ownership?: string[]; heritage?: string[]; dietary?: string[]; languages?: string[]; accessibility?: string[]; neighborhood?: string }, f: FilterState) {
  const o = (item.ownership ?? []).map((s) => s.toLowerCase().replace(/\s+/g, "-").replace(/-owned$/, "")); const h = (item.heritage ?? []).map((s) => s.toLowerCase());
  const d = item.dietary ?? []; const l = (item.languages ?? []).map((s) => s.toLowerCase()); const x = item.accessibility ?? [];
  if (f.ownership.some((v) => !o.includes(v))) return false;
  if (f.dietary.some((v) => !d.includes(v))) return false;
  if (f.languages.some((v) => !l.includes(v))) return false;
  if (f.accessibility.some((v) => !x.includes(v))) return false;
  const hq = f.heritage.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (hq.some((v) => !h.some((hi) => hi.includes(v)))) return false;
  if (f.neighborhood && (item.neighborhood ?? "").toLowerCase() !== f.neighborhood.toLowerCase()) return false;
  return true;
}
