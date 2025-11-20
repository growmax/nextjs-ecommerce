"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
    <div className={cn("flex flex-col min-h-screen bg-gray-50", className)}>
      {children}
    </div>
  );
}
