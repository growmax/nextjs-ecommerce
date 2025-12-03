"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { ActionDialogProps } from "@/types/dialog";

/**
 * ActionDialog - A flexible dialog component with custom actions
 *
 * Use this for dialogs that need custom action buttons or layouts.
 * Provides consistent styling and structure while allowing full customization.
 *
 * @example
 * ```tsx
 * <ActionDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Custom Dialog"
 *   actions={
 *     <>
 *       <Button variant="outline">Cancel</Button>
 *       <Button>Custom Action</Button>
 *     </>
 *   }
 * >
 *   <p>Custom content here</p>
 * </ActionDialog>
 * ```
 */
export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  actions,
  children,
  size = "md",
  showCloseButton = true,
  preventCloseOnOverlayClick = false,
  preventCloseOnEscape = false,
  className,
  contentClassName,
}: ActionDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !preventCloseOnOverlayClick) {
      onOpenChange(newOpen);
    } else if (newOpen) {
      onOpenChange(newOpen);
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          size={size}
          showCloseButton={showCloseButton}
          className={contentClassName}
          onEscapeKeyDown={e => {
            if (preventCloseOnEscape) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={e => {
            if (preventCloseOnOverlayClick) {
              e.preventDefault();
            }
          }}
        >
          {(title || description) && (
            <DialogHeader className={className}>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          <div className="space-y-4">{children}</div>

          {actions && (
            <div className="flex flex-row justify-end gap-2 pt-4">
              {actions}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        showCloseButton={showCloseButton}
        className={contentClassName}
      >
        {(title || description) && (
          <DrawerHeader className={cn("text-left", className)}>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}

        <div className="space-y-4 px-4">{children}</div>

        {actions && (
          <DrawerFooter className="flex-col-reverse gap-2 pt-2">
            {actions}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
