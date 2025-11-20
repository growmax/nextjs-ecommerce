"use client";

import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
      <div className={cn("w-full overflow-x-hidden", className)}>
        <div
          className={cn(
            "pb-[20px]",
            isSidebarCollapsed ? "px-[60px]" : "px-[15px]"
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-hidden", className)}>
      <div
        className={cn(
          "mt-[10px] mb-[15px]",
          isSidebarCollapsed ? "px-[45px]" : "px-[0px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
