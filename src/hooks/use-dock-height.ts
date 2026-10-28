import { useCallback, useRef } from "react";

/**
 * Callback ref for a bar docked to the bottom of the screen (see
 * `app-dock-bottom` in styles.css). Publishes the bar's height as
 * `--app-dock-h` while it is mounted, so floating buttons lift above it
 * instead of covering its controls.
 */
export function useDockHeight() {
  const observer = useRef<ResizeObserver | null>(null);
  return useCallback((el: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    const root = document.documentElement;
    if (!el) {
      root.style.removeProperty("--app-dock-h");
      return;
    }
    observer.current = new ResizeObserver(() => {
      root.style.setProperty("--app-dock-h", `${el.offsetHeight}px`);
    });
    observer.current.observe(el);
  }, []);
}
