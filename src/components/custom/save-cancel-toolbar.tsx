"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile/use-mobile";
import { cn } from "@/lib/utils";
import type { SaveCancelToolbarProps } from "@/types/save-cancel";
import * as React from "react";
import { createPortal } from "react-dom";
import { LoadingButton } from "@/components/custom/loading-button";

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
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [anchorOffset, setAnchorOffset] = React.useState<number | null>(null);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 0);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    React.useEffect(() => {
      const checkSidebarState = () => {
        let isOpen = false;

        // Method 1: Check for settings sidebar specifically
        const settingsSidebar = document.querySelector(
          'div[class*="w-64"][class*="min-h-full"][class*="border-r"]'
        );

        // Method 2: Check if we're on a settings page and screen is large enough
        const isSettingsPage = window.location.pathname.includes("/settings");
        const isLargeScreen = window.innerWidth >= 1024;

        if (isSettingsPage && isLargeScreen && settingsSidebar) {
          const styles = window.getComputedStyle(settingsSidebar);
          // Check if the sidebar is actually visible (not hidden)
          if (styles.display !== "none" && styles.visibility !== "hidden") {
            isOpen = true;
          }
        }

        // Method 3: Check for mobile/fixed sidebar elements that might be visible
        const fixedSidebarElements = document.querySelectorAll(
          '[class*="w-64"][class*="fixed"]'
        );
        fixedSidebarElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          const transform = styles.transform;
          // If transform doesn't contain translateX(-100%) or translate3d(-100%, it's visible
          if (
            !transform.includes("translateX(-") &&
            !transform.includes("translate3d(-")
          ) {
            isOpen = true;
          }
        });

        // Method 4: Check for overlay (mobile sidebar open)
        const hasOverlay =
          document.querySelector('[class*="bg-black/50"]') ||
          document.querySelector('[class*="bg-black\\/50"]');

        if (hasOverlay) {
          isOpen = true;
        }

        setIsSidebarOpen(isOpen);
      };

      // Check initially with a small delay to ensure DOM is ready
      setTimeout(checkSidebarState, 100);

      // Add resize listener for window size changes
      window.addEventListener("resize", checkSidebarState);

      // Use MutationObserver to watch for changes
      const observer = new MutationObserver(() => {
        setTimeout(checkSidebarState, 10);
      });

      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ["class", "style"],
      });

      return () => {
        window.removeEventListener("resize", checkSidebarState);
        observer.disconnect();
      };
    }, []);

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

    if (!show || !mounted || isScrolled) return null;

    const computedTop = anchorOffset ?? (isMobile ? 68 : 64);

    const toolbarContent = (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 bg-white border-b border-gray-200 shadow-sm",
          isMobile
            ? "top-17 left-0 right-0"
            : "top-17 bottom-150 left-1 right-0",
          className
        )}
        style={{
          position: "fixed !important" as React.CSSProperties["position"],
          top: `${computedTop}px !important`,
          left: isMobile
            ? "0 !important"
            : isSidebarOpen
              ? "64px !important"
              : "64px !important",
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
