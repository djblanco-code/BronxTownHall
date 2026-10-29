import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

/**
 * A page section with a heading and an optional action on the right
 * ("See all", "Show fewer"). `id` labels the section for screen readers.
 *
 * @example
 * <Section id="events" title="Upcoming events" action={<SectionAction asChild><Link to="/events">See all</Link></SectionAction>}>
 *   …
 * </Section>
 */
function Section({
  id,
  title,
  titleAside,
  action,
  ruled = false,
  className,
  children,
}: {
  id: string;
  title: React.ReactNode;
  /** Small text after the title, e.g. the chosen neighborhood. */
  titleAside?: React.ReactNode;
  action?: React.ReactNode;
  /** Title and action on one baseline (the heavy rule it once drew was softened). */
  ruled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={cn("mx-auto mt-8 max-w-5xl px-4", className)}>
      <div
        className={cn("mb-3 flex items-end justify-between gap-3", ruled && "mb-2 items-baseline")}
      >
        <h2 id={id} className="text-lg font-bold text-foreground sm:text-2xl">
          {title}
          {titleAside && (
            <span className="ms-1.5 align-middle font-sans text-sm font-medium text-muted-foreground">
              · {titleAside}
            </span>
          )}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** The text-style link or button beside a section title. Pass a router `<Link>` with `asChild`. */
const SectionAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild = false, className, type, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      className={cn(
        "no-min-h simplified-exempt shrink-0 text-sm font-bold text-primary hover:underline",
        className,
      )}
      {...props}
    />
  );
});
SectionAction.displayName = "SectionAction";

export { Section, SectionAction };
