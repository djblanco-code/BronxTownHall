import { List, Map as MapIcon, Table2 } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

export type ViewMode = "list" | "map" | "sheet";

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (m: ViewMode) => void }) {
  const { t } = useI18n();
  const opts: { id: ViewMode; label: string; icon: typeof List }[] = [
    { id: "list", label: t("interface.list"), icon: List },
    { id: "map", label: t("interface.map"), icon: MapIcon },
    { id: "sheet", label: t("interface.sheet"), icon: Table2 },
  ];
  return (
    <div role="tablist" aria-label={t("interface.view")} className="inline-flex rounded-full border border-border bg-card p-0.5">
      {opts.map((o) => {
        const Icon = o.icon;
        const active = value === o.id;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={`no-min-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold min-h-[36px] ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {o.label}
          </button>
        );
      })}
    </div>
  );
}
