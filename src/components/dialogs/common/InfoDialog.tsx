"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { InfoDialogProps } from "@/types/dialog";

/**
 * InfoDialog - A standardized information/display dialog component
 *
 * Use this for dialogs that display information without requiring form input.
 * Provides consistent styling and mobile responsiveness.
 *
 * @example
 * ```tsx
 * <InfoDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Information"
 *   description="This is some important information."
 * >
 *   <p>Additional content here</p>
 * </InfoDialog>
 * ```
 */
export function InfoDialog({
  open,
  onOpenChange,
  title,
  description,
  onClose,
  closeText = "Close",
  children,
  size = "md",
  showCloseButton = true,
  preventCloseOnOverlayClick = false,
  preventCloseOnEscape = false,
  className,
  contentClassName,
}: InfoDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (!preventCloseOnOverlayClick) {
        handleClose();
      }
    } else {
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

          <DialogFooter className="flex-row justify-end gap-2">
            <Button onClick={handleClose}>{closeText}</Button>
          </DialogFooter>
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

        <DrawerFooter className="pt-2">
          <Button onClick={handleClose} className="w-full">
            {closeText}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
