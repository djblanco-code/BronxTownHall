import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * What a list shows when it has nothing to show: no results, nothing saved
 * yet, or a request that failed. Keep `title` to one plain sentence.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A link or button that gets the person unstuck. */
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 border-y border-border py-4 text-sm", className)}>
      {Icon && (
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground">
          {title} {action}
        </p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export { EmptyState };
