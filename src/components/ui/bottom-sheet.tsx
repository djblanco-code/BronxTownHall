import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Responsive sheet: slides up from the bottom on phones and tablets, and
 * becomes a centred dialog on desktop. Built on Radix Dialog, so focus
 * trapping, Escape-to-close and the aria wiring come for free.
 */
const BottomSheet = DialogPrimitive.Root;
const BottomSheetTrigger = DialogPrimitive.Trigger;
const BottomSheetClose = DialogPrimitive.Close;

type BottomSheetContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  "title"
> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  closeLabel?: string;
};

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BottomSheetContentProps
>(({ className, children, title, description, closeLabel = "Close", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
    <DialogPrimitive.Content
      ref={ref}
      // Radix wires up the description itself; without one, opt out explicitly.
      {...(description ? {} : { "aria-describedby": undefined })}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[90] flex max-h-[85dvh] flex-col rounded-t-3xl border-t border-border bg-card text-card-foreground shadow-2xl pb-[env(safe-area-inset-bottom)] duration-200",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
        "lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:border lg:pb-0",
        "lg:data-[state=open]:slide-in-from-bottom-0 lg:data-[state=open]:zoom-in-95 lg:data-[state=closed]:slide-out-to-bottom-0 lg:data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-muted-foreground/30 lg:hidden"
      />
      <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-3 lg:pt-5">
        <div className="min-w-0">
          <DialogPrimitive.Title className="text-lg font-bold leading-tight">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          ) : null}
        </div>
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="no-min-h simplified-exempt -me-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </DialogPrimitive.Close>
      </div>
      <div className="overflow-y-auto px-5 pb-5">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
BottomSheetContent.displayName = "BottomSheetContent";

export { BottomSheet, BottomSheetTrigger, BottomSheetClose, BottomSheetContent };
