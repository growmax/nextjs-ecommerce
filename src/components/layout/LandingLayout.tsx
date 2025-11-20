"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LandingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * LandingLayout - Used for landing/list pages like Orders Landing, Quotes Landing, etc.
 * Provides consistent spacing and layout for table-based landing pages
 */
export function LandingLayout({ children, className }: LandingLayoutProps) {
  return (
    <div
      className={cn(
        "landing-page flex flex-col w-full overflow-x-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
