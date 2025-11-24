"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { SaveCancelToolbarProps } from "@/types/save-cancel";
import * as React from "react";
import { createPortal } from "react-dom";
import { LoadingButton } from "./loading-button";

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
      style,
      anchorSelector,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const [mounted, setMounted] = React.useState(false);
    const [sidebarLeftOffset, setSidebarLeftOffset] = React.useState(0);
    const [anchorOffset, setAnchorOffset] = React.useState<number | null>(null);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Calculate sidebar offset by measuring SidebarInset (main content area)
    // This matches how the layout positions content relative to the sidebar
    React.useEffect(() => {
      const calculateSidebarOffset = () => {
        if (isMobile) {
          setSidebarLeftOffset(0);
          return;
        }

        // Find the SidebarInset (main element) - this is positioned by the sidebar system
        const sidebarWrapper = document.querySelector('[class*="group/sidebar-wrapper"]');
        if (sidebarWrapper) {
          const mainContent = sidebarWrapper.querySelector('main') as HTMLElement;
          if (mainContent) {
            const rect = mainContent.getBoundingClientRect();
            // The left position of main content is where the sidebar ends
            setSidebarLeftOffset(rect.left);
            return;
          }
        }

        // Fallback: find any main element
        const mainElements = document.querySelectorAll('main');
        for (const mainEl of Array.from(mainElements)) {
          const el = mainEl as HTMLElement;
          const rect = el.getBoundingClientRect();
          if (rect.left > 0) {
            setSidebarLeftOffset(rect.left);
            return;
          }
        }

        // Default fallback
        setSidebarLeftOffset(0);
      };

      calculateSidebarOffset();

      // Use ResizeObserver to watch for changes in main content position
      let resizeObserver: ResizeObserver | null = null;
      const sidebarWrapper = document.querySelector('[class*="group/sidebar-wrapper"]');
      if (sidebarWrapper) {
        const mainContent = sidebarWrapper.querySelector('main') as HTMLElement;
        if (mainContent && 'ResizeObserver' in window) {
          resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
              calculateSidebarOffset();
            });
          });
          resizeObserver.observe(mainContent);
        }
      }

      // Watch for sidebar state changes
      const mutationObserver = new MutationObserver(() => {
        requestAnimationFrame(() => {
          calculateSidebarOffset();
        });
      });

      mutationObserver.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ["class", "style", "data-state", "data-collapsible"],
      });

      window.addEventListener("resize", calculateSidebarOffset);

      return () => {
        resizeObserver?.disconnect();
        mutationObserver.disconnect();
        window.removeEventListener("resize", calculateSidebarOffset);
      };
    }, [isMobile]);

    React.useEffect(() => {
      if (!anchorSelector) {
        setAnchorOffset(null);
        return;
      }

      const updateOffset = () => {
        const element = document.querySelector(anchorSelector);
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          setAnchorOffset(rect.bottom);
        }
      };

      updateOffset();

      window.addEventListener("resize", updateOffset);
      window.addEventListener("scroll", updateOffset, true);

      let observer: ResizeObserver | null = null;
      const anchorElement = document.querySelector(anchorSelector);
      if (anchorElement instanceof HTMLElement && "ResizeObserver" in window) {
        observer = new ResizeObserver(updateOffset);
        observer.observe(anchorElement);
      }

      return () => {
        window.removeEventListener("resize", updateOffset);
        window.removeEventListener("scroll", updateOffset, true);
        observer?.disconnect();
      };
    }, [anchorSelector]);

    if (!show || !mounted) return null;

    const computedTop = anchorOffset ?? (isMobile ? 68 : 64);

    const toolbarContent = (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-200",
          className
        )}
        style={{
          position: "fixed !important" as React.CSSProperties["position"],
          top: `${computedTop}px !important`,
          left: isMobile ? "0 !important" : `${sidebarLeftOffset}px !important`,
          right: "0 !important",
          zIndex: "51 !important",
          transform: "none !important",
          willChange: "auto !important",
          ...style,
        }}
        {...props}
      >
        <div className="flex items-center justify-between p-4 max-w-none mx-auto">
          {!isMobile && (
            <span className="text-sm text-muted-foreground">Save changes?</span>
          )}

          <div className={cn("flex gap-2", isMobile ? "w-full" : "ml-auto")}>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className={cn(isMobile && "flex-1")}
              disabled={isLoading}
            >
              {cancelText}
            </Button>

            <LoadingButton
              size="sm"
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

    return createPortal(toolbarContent, document.body);
  }
);

SaveCancelToolbar.displayName = "SaveCancelToolbar";

export { SaveCancelToolbar };
