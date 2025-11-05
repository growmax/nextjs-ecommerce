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
    centered: "max-w-7xl mx-auto px-6 sm:px-8 lg:px-10",
    auto: "max-w-8xl mx-auto px-2 sm:px-4 sm:mx-12 lg:mx-60", // Added px-2 for mobile spacing
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
