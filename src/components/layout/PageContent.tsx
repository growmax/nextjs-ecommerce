"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
    auto: "container mx-auto px-2 sm:px-3 lg:px-4 py-6 sm:py-8 max-w-[80%] relative",
    "full-width": "w-full px-2 sm:px-3 lg:px-4 py-6 sm:py-8 relative", 
    centered: "container mx-auto px-2 sm:px-3 lg:px-4 py-6 sm:py-8 max-w-4xl relative",
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
