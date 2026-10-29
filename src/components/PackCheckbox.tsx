import { Check } from "lucide-react";
import { usePack, PACK_MAX } from "@/lib/pack";

export function PackCheckbox({ id, label }: { id: string; label: string }) {
  const { has, toggle, count } = usePack();
  const checked = has(id);
  const disabled = !checked && count >= PACK_MAX;
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={checked ? `Remove ${label} from share pack` : `Add ${label} to share pack`}
      className={`no-min-h shrink-0 h-10 w-10 rounded-md border-2 flex items-center justify-center transition disabled:opacity-40 ${
        checked
          ? "border-primary bg-primary-fill text-primary-fill-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary"
      }`}
    >
      <Check className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
