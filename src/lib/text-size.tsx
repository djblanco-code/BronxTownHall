import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TextSize = "normal" | "large" | "xl";
export const TEXT_SIZES: { id: TextSize; label: string; short: string }[] = [
  { id: "normal", label: "Normal", short: "A" },
  { id: "large", label: "Large", short: "A+" },
  { id: "xl", label: "Extra Large", short: "A++" },
];
const KEY = "bronx.textSize";
const EVT = "bronx:textsize";

const isSize = (v: unknown): v is TextSize => v === "normal" || v === "large" || v === "xl";

export function getTextSize(): TextSize {
  if (typeof window === "undefined") return "normal";
  try { const v = localStorage.getItem(KEY); return isSize(v) ? v : "normal"; } catch { return "normal"; }
}

function apply(size: TextSize) {
  if (typeof document === "undefined") return;
  if (size === "normal") document.documentElement.removeAttribute("data-text-size");
  else document.documentElement.setAttribute("data-text-size", size);
}

/** Saves on this device, and to the account when signed in. */
export function setTextSize(size: TextSize) {
  try { localStorage.setItem(KEY, size); } catch { /* ignore */ }
  apply(size);
  window.dispatchEvent(new CustomEvent(EVT));
  void supabase.auth.getSession().then(({ data }) => {
    if (data.session) void supabase.auth.updateUser({ data: { text_size: size } });
  });
}

export function useTextSize(): TextSize {
  const [size, setSize] = useState<TextSize>("normal");
  useEffect(() => {
    const sync = () => setSize(getTextSize());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return size;
}

/** Applies the saved size on load and adopts the account's size after sign-in. */
export function TextSizeEffect() {
  useEffect(() => {
    apply(getTextSize());
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const remote = s?.user?.user_metadata?.text_size;
      if (isSize(remote) && remote !== getTextSize()) {
        try { localStorage.setItem(KEY, remote); } catch { /* ignore */ }
        apply(remote);
        window.dispatchEvent(new CustomEvent(EVT));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}

/** Compact A / A+ / A++ control. */
export function TextSizeControl({ className = "" }: { className?: string }) {
  const size = useTextSize();
  return (
    <div role="group" aria-label="Text size" className={`inline-flex items-center rounded-full border border-border bg-card p-0.5 ${className}`}>
      {TEXT_SIZES.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setTextSize(s.id)}
          aria-pressed={size === s.id}
          aria-label={`Text size: ${s.label}`}
          title={s.label}
          className={`no-min-h simplified-exempt min-h-[40px] min-w-[40px] px-2 rounded-full font-bold leading-none ${size === s.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
          style={{ fontSize: `${0.8 + i * 0.15}rem` }}
        >
          {s.short}
        </button>
      ))}
    </div>
  );
}
