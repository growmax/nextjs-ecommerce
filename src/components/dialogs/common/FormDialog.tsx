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
import type { FormDialogProps } from "@/types/dialog";

/**
 * FormDialog - A standardized form dialog component
 *
 * Use this for dialogs that contain forms. Provides consistent styling,
 * mobile responsiveness, and form submission handling.
 *
 * @example
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Edit Profile"
 *   description="Make changes to your profile here."
 *   onSubmit={handleSubmit}
 *   isLoading={isSubmitting}
 * >
 *   <form className="space-y-4">
 *     <Input name="name" />
 *   </form>
 * </FormDialog>
 * ```
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  disabled = false,
  children,
  size = "md",
  showCloseButton = true,
  preventCloseOnOverlayClick = false,
  preventCloseOnEscape = false,
  className,
  contentClassName,
  onOpenAutoFocus,
}: FormDialogProps & {
  onOpenAutoFocus?: (event: Event) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(e);
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
          onOpenAutoFocus={onOpenAutoFocus}
        >
          {(title || description) && (
            <DialogHeader className={className}>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {children}

            <DialogFooter className="flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading || isSubmitting}
              >
                {cancelText}
              </Button>
              <LoadingButton
                type="submit"
                loading={isLoading || isSubmitting}
                disabled={disabled}
              >
                {submitText}
              </LoadingButton>
            </DialogFooter>
          </form>
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

        <form onSubmit={handleSubmit} className="space-y-4 px-4">
          {children}

          <DrawerFooter className="flex-col-reverse gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || isSubmitting}
              className="w-full"
            >
              {cancelText}
            </Button>
            <LoadingButton
              type="submit"
              loading={isLoading || isSubmitting}
              disabled={disabled}
              className="w-full"
            >
              {submitText}
            </LoadingButton>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
