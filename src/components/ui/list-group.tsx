import * as React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Rows grouped in one rounded card with dividers, like a settings screen. */
function ListGroup({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(
        "divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
      {...props}
    />
  );
}

const iconVariants = cva("grid h-10 w-10 shrink-0 place-items-center rounded-full", {
  variants: {
    tone: {
      default: "bg-primary/15 text-primary",
      destructive: "bg-destructive text-destructive-foreground",
    },
  },
  defaultVariants: { tone: "default" },
});

type ListRowProps = VariantProps<typeof iconVariants> & {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The interactive element, usually a router `<Link>`; the row fills it. Omit for a button. */
  children?: React.ReactElement<{ className?: string; children?: React.ReactNode }>;
  onClick?: () => void;
  id?: string;
};

/**
 * One tappable row: icon, title, optional description, and a chevron that
 * flips for right-to-left languages.
 *
 * @example
 * <ListRow icon={Phone} tone="destructive" title="Emergency help" description="911, 311, 988">
 *   <Link to="/emergency" />
 * </ListRow>
 */
function ListRow({ icon: Icon, tone, title, description, children, onClick, id }: ListRowProps) {
  const rowClass =
    "no-min-h flex min-h-16 w-full items-center gap-3 px-4 py-3 text-start hover:bg-secondary";
  const content = (
    <>
      {Icon && (
        <span className={iconVariants({ tone })}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-bold",
            tone === "destructive" ? "text-destructive" : "text-sm text-foreground",
          )}
        >
          {title}
        </span>
        {description && (
          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180"
        aria-hidden="true"
      />
    </>
  );

  return (
    <li>
      {children ? (
        React.cloneElement(children, {
          className: cn(rowClass, children.props.className),
          children: content,
          ...(id ? { id } : {}),
        })
      ) : (
        <button type="button" id={id} onClick={onClick} className={rowClass}>
          {content}
        </button>
      )}
    </li>
  );
}

export { ListGroup, ListRow };
