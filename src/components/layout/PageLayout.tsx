"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: "toolbar" | "content";
}

/**
 * PageLayout - Used for detail pages like Order Details, Quote Details, etc.
 * Provides consistent spacing and layout matching the landing page style
 *
 * @param variant - "toolbar" for header/toolbar areas (mt-[10px] mb-[15px]), "content" for main content areas (pb-[20px])
 */
export function PageLayout({
  children,
  className,
  variant = "toolbar",
}: PageLayoutProps) {
  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === "collapsed";

  if (variant === "content") {
    return (
      <div className={cn("w-full min-w-0 overflow-x-auto z-0", className)}>
        <div
          className={cn(
            "pb-5",
            // Use responsive padding instead of hardcoded values
            isSidebarCollapsed ? "px-2 md:px-8" : "px-2 md:px-6"
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full min-w-0 overflow-x-auto", className)}>
      <div
        className={cn(
          "mt-1 mb-2",
          // Use responsive padding instead of hardcoded values
          isSidebarCollapsed ? "px-6 md:px-8" : "px-4 md:px-6"
        )}
      >
        {children}
      </div>
    </div>
  );
}
