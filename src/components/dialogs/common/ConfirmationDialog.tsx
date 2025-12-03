"use client";

import * as React from "react";
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
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/custom/loading-button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { ConfirmationDialogProps } from "@/types/dialog";

/**
 * ConfirmationDialog - A standardized confirmation dialog component
 *
 * Use this for dialogs that require user confirmation before proceeding with an action.
 * Provides consistent styling, mobile responsiveness, and loading states.
 *
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item? This action cannot be undone."
 *   onConfirm={handleDelete}
 *   confirmVariant="destructive"
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  disabled = false,
  confirmVariant = "default",
  icon,
  size = "md",
  showCloseButton = true,
  preventCloseOnOverlayClick = false,
  preventCloseOnEscape = false,
  className,
  contentClassName,
}: ConfirmationDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      if (!preventCloseOnOverlayClick) {
        onOpenChange(false);
      }
    } catch (error) {
      // Error handling should be done by parent component
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting && !isLoading) {
      onCancel?.();
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting && !isLoading) {
      if (!preventCloseOnOverlayClick) {
        handleCancel();
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
          {(title || icon) && (
            <DialogHeader>
              <DialogTitle className={cn("flex items-center gap-2", className)}>
                {icon}
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || isSubmitting}
            >
              {cancelText}
            </Button>
            <LoadingButton
              onClick={handleConfirm}
              loading={isLoading || isSubmitting}
              disabled={disabled}
              variant={confirmVariant}
            >
              {confirmText}
            </LoadingButton>
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
        {(title || icon) && (
          <DrawerHeader className="text-left">
            <DrawerTitle className={cn("flex items-center gap-2", className)}>
              {icon}
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}

        <DrawerFooter className="flex-col-reverse gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
            className="w-full"
          >
            {cancelText}
          </Button>
          <LoadingButton
            onClick={handleConfirm}
            loading={isLoading || isSubmitting}
            disabled={disabled}
            variant={confirmVariant}
            className="w-full"
          >
            {confirmText}
          </LoadingButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
