import { useEffect, useRef, ReactNode, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Accessible modal dialog.
 * - role="dialog" + aria-modal
 * - aria-labelledby wired to the visible title
 * - Escape closes
 * - Initial focus to first focusable
 * - Focus returns to opener on close
 * - Background body scroll locked while open
 */
export function A11yDialog({
  open,
  onClose,
  title,
  children,
  className = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Initial focus
    requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // Simple focus trap
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-card text-card-foreground rounded-2xl shadow-2xl w-full ${className} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="no-min-h h-11 w-11 rounded-full grid place-items-center hover:bg-secondary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
