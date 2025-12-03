"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "transition-opacity duration-200",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  hideOverlay = false,
  size = "md",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  hideOverlay?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full" | "auto";
}) {
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
    full: "sm:max-w-[95vw]",
    auto: "sm:max-w-fit",
  };

  const contentRef = React.useRef<HTMLDivElement>(null);

  // Prevent layout shift by preserving scrollbar space when dialog opens
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Calculate scrollbar width before any changes (while scrollbar is visible)
    const calculateScrollbarWidth = () => {
      // Create a temporary div to measure scrollbar width
      const outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.overflow = "scroll";
      (outer.style as any).msOverflowStyle = "scrollbar";
      document.body.appendChild(outer);

      const inner = document.createElement("div");
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      outer.parentNode?.removeChild(outer);
      return scrollbarWidth;
    };

    const scrollbarWidth = calculateScrollbarWidth();

    // Store original values
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const originalHtmlPaddingRight =
      document.documentElement.style.paddingRight;

    // Check if dialog is open
    const checkDialogState = () => {
      const isOpen = content.getAttribute("data-state") === "open";

      if (isOpen) {
        // Preserve scrollbar space to prevent layout shift
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
          document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
        }
        // Radix UI already sets overflow: hidden, but we ensure it
        document.body.style.overflow = "hidden";
      } else {
        // Restore original styles
        document.body.style.overflow = originalBodyOverflow || "";
        document.body.style.paddingRight = originalBodyPaddingRight || "";
        document.documentElement.style.paddingRight =
          originalHtmlPaddingRight || "";
      }
    };

    // Observe data-state changes
    const observer = new MutationObserver(checkDialogState);
    observer.observe(content, {
      attributes: true,
      attributeFilter: ["data-state"],
    });

    // Initial check with a small delay to ensure state is set
    setTimeout(checkDialogState, 0);

    // Cleanup function
    return () => {
      observer.disconnect();
      document.body.style.overflow = originalBodyOverflow || "";
      document.body.style.paddingRight = originalBodyPaddingRight || "";
      document.documentElement.style.paddingRight =
        originalHtmlPaddingRight || "";
    };
  }, []);

  return (
    <DialogPortal data-slot="dialog-portal">
      {!hideOverlay && <DialogOverlay />}
      <DialogPrimitive.Content
        ref={contentRef}
        data-slot="dialog-content"
        className={cn(
          "bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg p-6 shadow-lg duration-200 border border-black/10",
          sizeClasses[size],
          "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out",
          "origin-center",
          "max-h-[90vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-6 z-10 flex items-center justify-center h-5 w-5 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <XIcon className="h-4 w-4 text-gray-500" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
