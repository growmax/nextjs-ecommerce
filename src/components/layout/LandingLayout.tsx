"use client";

import { cn } from "@/lib/utils";
import React from "react";

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
        "landing-page flex flex-col w-full min-w-0 overflow-x-auto z-0",
        className
      )}
    >
      {children}
    </div>
  );
}
