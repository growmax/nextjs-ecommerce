"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "./loading-button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SaveCancelToolbarProps } from "@/types/save-cancel";

const SaveCancelToolbar = React.forwardRef<
  HTMLDivElement,
  SaveCancelToolbarProps
>(
  (
    {
      show,
      onSave,
      onCancel,
      isLoading = false,
      disabled = false,
      saveText = "Save",
      cancelText = "Cancel",
      className,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();

    if (!show) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 w-full bg-background/95 backdrop-blur-sm border-t transition-all duration-200",
          isMobile ? "bottom-0 left-0" : "top-16 left-0",
          "animate-in slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          {!isMobile && (
            <span className="text-sm text-muted-foreground">Save changes?</span>
          )}

          <div className={cn("flex gap-2", isMobile ? "w-full" : "ml-auto")}>
            <Button
              variant="outline"
              onClick={onCancel}
              className={cn(isMobile && "flex-1")}
              disabled={isLoading}
            >
              {cancelText}
            </Button>

            <LoadingButton
              onClick={onSave}
              loading={isLoading}
              disabled={disabled}
              className={cn(isMobile && "flex-1")}
            >
              {saveText}
            </LoadingButton>
          </div>
        </div>
      </div>
    );
  }
);

SaveCancelToolbar.displayName = "SaveCancelToolbar";

export { SaveCancelToolbar };
