"use client";

import { cn } from "@/lib/utils";

export type LayoutType = "full-width" | "centered" | "auto";

interface PageContentProps {
  children: React.ReactNode;
  layout?: LayoutType;
  className?: string;
}

export function PageContent({
  children,
  layout = "auto",
  className,
}: PageContentProps) {
  // Layout-specific classes
  const layoutClasses = {
    "full-width": "w-full",
    centered: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
    auto: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", // Default fallback
  };

  return <div className={cn(layoutClasses[layout], className)}>{children}</div>;
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
