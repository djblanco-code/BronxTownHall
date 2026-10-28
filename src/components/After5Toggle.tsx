import { Clock } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";

type Props = {
  active: boolean;
  onToggle: (v: boolean) => void;
  count: number;
  className?: string;
};

export function After5Toggle({ active, onToggle, count, className = "" }: Props) {
  const [hover, setHover] = useState(false);
  const { t } = useI18n();
  const tooltip = t("interface.after5Tip");
  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={t("interface.after5")}
        title={tooltip}
        onClick={() => onToggle(!active)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className={`no-min-h inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition min-h-[44px] ${
          active
            ? "bg-primary text-primary-foreground border-primary shadow-md"
            : "bg-card text-foreground border-border hover:border-primary/60 hover:bg-secondary"
        }`}
      >
        <Clock className="h-4 w-4" aria-hidden />
        <span>{t("interface.after5")}</span>
        <span
          className={`inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-bold ${
            active
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
          aria-label={t("interface.matches", { count })}
        >
          {count}
        </span>
      </button>
      {hover && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 max-w-[16rem] rounded-lg bg-foreground text-background text-xs px-3 py-2 shadow-lg"
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}
