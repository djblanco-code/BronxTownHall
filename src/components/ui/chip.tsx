import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "no-min-h simplified-exempt inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors",
  {
    variants: {
      variant: {
        outline: "border border-border bg-card text-foreground hover:bg-secondary",
        soft: "bg-secondary text-foreground hover:bg-secondary/70",
      },
      selected: {
        true: "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        false: "",
      },
    },
    defaultVariants: { variant: "outline", selected: false },
  },
);

type ChipProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  VariantProps<typeof chipVariants> & {
    icon?: LucideIcon;
    /**
     * Text, or a router `<Link>` element when `asChild` is set: the link
     * keeps its own props and gets the chip's look.
     */
    children: React.ReactNode;
    asChild?: boolean;
  };

/**
 * Small rounded action or filter: "Ask a question", "Open now", "Free".
 * As a filter button, pass `selected` (it also sets `aria-pressed`).
 */
function Chip({
  icon: Icon,
  variant,
  selected,
  asChild = false,
  className,
  children,
  type = "button",
  ...props
}: ChipProps) {
  const classes = cn(chipVariants({ variant, selected }), className);
  const icon = Icon && (
    <Icon
      className={cn("h-4 w-4", selected ? "text-current" : "text-primary")}
      aria-hidden="true"
    />
  );

  if (
    asChild &&
    React.isValidElement<{ className?: string; children?: React.ReactNode }>(children)
  ) {
    return React.cloneElement(children, {
      className: cn(classes, children.props.className),
      children: (
        <>
          {icon}
          {children.props.children}
        </>
      ),
    });
  }

  return (
    <button
      type={type}
      aria-pressed={selected == null ? undefined : !!selected}
      className={classes}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export { Chip, chipVariants };
