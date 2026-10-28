import type { ReactNode } from "react";

/** A swipeable row of cards on phones, a grid on desktop. */
export function CardRow({ children }: { children: ReactNode }) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
      {children}
    </ul>
  );
}

export function CardRowItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex w-[70%] max-w-[16rem] shrink-0 snap-start lg:w-auto lg:max-w-none">
      {children}
    </li>
  );
}

/** Placeholder while a row loads; `label` is read to screen readers. */
export function CardRowSkeleton({ label }: { label: string }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-hidden px-4 lg:mx-0 lg:px-0" aria-busy="true">
      <span className="sr-only">{label}</span>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="h-32 w-[70%] max-w-[16rem] shrink-0 animate-pulse rounded-2xl bg-muted lg:flex-1"
        />
      ))}
    </div>
  );
}
