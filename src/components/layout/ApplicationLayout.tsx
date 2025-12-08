"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ApplicationLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ApplicationLayout - Main application wrapper layout
 * Provides the base structure for all app pages
 */
export function ApplicationLayout({
  children,
  className,
}: ApplicationLayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-screen bg-white-50", className)}>
      {children}
    </div>
  );
}
