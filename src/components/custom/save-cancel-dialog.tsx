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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "./loading-button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { BaseDialogProps } from "@/types/dialog";
import type { SaveCancelDialogProps } from "@/types/save-cancel";

const SaveCancelDialog = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  SaveCancelDialogProps
>(
  (
    {
      open,
      onOpenChange,
      onSave,
      onCancel,
      isLoading = false,
      disabled = false,
      title,
      description,
      children,
      saveText = "Save",
      cancelText = "Cancel",
      alertMode = false,
      size = "md",
      showCloseButton = true,
      contentClassName,
      ...props
    },
    ref
  ) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const handleOpenChange = (isOpen: boolean) => {
      if (!isOpen) {
        onCancel();
      }
      onOpenChange?.(isOpen);
    };

    if (isDesktop) {
      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent
            ref={ref}
            size={size}
            showCloseButton={showCloseButton}
            className={contentClassName}
            {...props}
          >
            {title && (
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {description && (
                  <DialogDescription>{description}</DialogDescription>
                )}
              </DialogHeader>
            )}

            {children}

            <DialogFooter className="flex-row justify-end gap-2">
              {!alertMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>

                  <LoadingButton
                    onClick={onSave}
                    loading={isLoading}
                    disabled={disabled}
                  >
                    {saveText}
                  </LoadingButton>
                </>
              ) : (
                <Button onClick={onCancel}>OK</Button>
              )}
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
          {title && (
            <DrawerHeader className="text-left">
              <DrawerTitle>{title}</DrawerTitle>
              {description && (
                <DrawerDescription>{description}</DrawerDescription>
              )}
            </DrawerHeader>
          )}

          <div className="px-4">{children}</div>

          <DrawerFooter className="flex-col-reverse gap-2 pt-2">
            {!alertMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="w-full"
                >
                  {cancelText}
                </Button>

                <LoadingButton
                  onClick={onSave}
                  loading={isLoading}
                  disabled={disabled}
                  className="w-full"
                >
                  {saveText}
                </LoadingButton>
              </>
            ) : (
              <Button onClick={onCancel} className="w-full">
                OK
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

SaveCancelDialog.displayName = "SaveCancelDialog";

export { SaveCancelDialog };
