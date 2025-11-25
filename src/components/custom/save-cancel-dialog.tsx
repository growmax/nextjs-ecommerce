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
import { useIsMobile } from "@/hooks/use-mobile/use-mobile";
import { cn } from "@/lib/utils";
import type { SaveCancelDialogProps } from "@/types/save-cancel";
import * as React from "react";
import { LoadingButton } from "@/components/custom/loading-button";

const SaveCancelDialog = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  SaveCancelDialogProps
>(
  (
    {
      open,
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
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();

    return (
      <Dialog open={open} onOpenChange={isOpen => !isOpen && onCancel()}>
        <DialogContent ref={ref} {...props}>
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          {children}

          <DialogFooter
            className={cn(
              isMobile && "flex-col-reverse gap-2",
              !isMobile && "flex-row justify-end gap-2"
            )}
          >
            {!alertMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className={cn(isMobile && "w-full")}
                >
                  {cancelText}
                </Button>

                <LoadingButton
                  onClick={onSave}
                  loading={isLoading}
                  disabled={disabled}
                  className={cn(isMobile && "w-full")}
                >
                  {saveText}
                </LoadingButton>
              </>
            ) : (
              <Button onClick={onCancel} className={cn(isMobile && "w-full")}>
                OK
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

SaveCancelDialog.displayName = "SaveCancelDialog";

export { SaveCancelDialog };
