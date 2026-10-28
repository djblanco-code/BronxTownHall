import { ReactNode, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type CoachMarkProps = {
  storageKey: string;
  message: string;
  children: ReactNode;
  placement?: "below-start" | "below-end" | "above";
  delay?: number;
};

/** A lightweight, one-time hint anchored to the control it explains. */
export function CoachMark({
  storageKey,
  message,
  children,
  placement = "below-start",
  delay = 0,
}: CoachMarkProps) {
  const [visible, setVisible] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || localStorage.getItem(storageKey)) return;

    let cancelled = false;
    let timer = 0;
    const tryShow = () => {
      if (cancelled) return;
      // Responsive layouts may mount two copies while hiding one with CSS.
      if (!anchorRef.current?.getClientRects().length) return;
      // Let blocking dialogs (such as the daily fact) finish first so a hint
      // is never counted as shown while hidden behind another overlay.
      if (document.querySelector("[aria-modal='true'], [data-coach-mark-active='true']")) {
        timer = window.setTimeout(tryShow, 250);
        return;
      }
      // Record on first appearance, not only on dismissal, so it never repeats.
      localStorage.setItem(storageKey, "shown");
      setVisible(true);
    };
    timer = window.setTimeout(tryShow, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [delay, storageKey]);

  const close = () => setVisible(false);
  const position =
    placement === "below-end"
      ? "top-[calc(100%+0.75rem)] end-0"
      : placement === "above"
        ? "bottom-[calc(100%+0.75rem)] start-1/2 -translate-x-1/2"
        : "top-[calc(100%+0.75rem)] start-0";

  return (
    <div ref={anchorRef} className="relative" data-coach-mark-active={visible ? "true" : undefined}>
      {children}
      {visible && (
        <>
          <button
            type="button"
            className="no-min-h fixed inset-0 z-40 cursor-default bg-foreground/15"
            aria-label="Dismiss tip"
            onClick={close}
          />
          <div
            role="status"
            className={`absolute ${position} z-50 w-[min(18rem,calc(100vw-2rem))] rounded-lg border-2 border-primary bg-card p-3 text-start text-sm font-semibold text-card-foreground shadow-xl`}
          >
            <span
              className="absolute -top-2 start-6 h-3.5 w-3.5 rotate-45 border-s-2 border-t-2 border-primary bg-card"
              aria-hidden="true"
            />
            <div className="flex items-start gap-2">
              <p className="flex-1 leading-snug">{message}</p>
              <button
                type="button"
                onClick={close}
                aria-label="Dismiss tip"
                className="no-min-h -me-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-secondary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
