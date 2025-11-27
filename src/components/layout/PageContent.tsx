"use client";

import { cn } from "@/lib/utils";
import React from "react";

export type LayoutType = "full-width" | "centered" | "auto";

interface PageContentProps {
  children: React.ReactNode;
  layout?: "auto" | "full-width" | "centered";
  className?: string;
}

export function PageContent({
  children,
  layout = "auto",
  className,
}: PageContentProps) {
  const layoutClasses = {
    auto: "container mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 max-w-[80%] relative",
    "full-width": "w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-3 relative", 
    centered: "container mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 max-w-4xl relative",
  };

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {children}
    </div>
  );
}

// Individual layout components for more explicit usage
export function FullWidthLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PageContent layout="full-width" {...(className && { className })}>
      {children}
    </PageContent>
  );
}

export function CenteredLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PageContent layout="centered" {...(className && { className })}>
      {children}
    </PageContent>
  );
}
