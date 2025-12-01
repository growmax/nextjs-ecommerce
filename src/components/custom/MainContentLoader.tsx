"use client";

import { PageLoader } from "@/components/Loaders/PageLoader/page-loader";
import { useSidebar } from "@/components/ui/sidebar";
import { useLoading } from "@/hooks/useGlobalLoader";
import { cn } from "@/lib/utils";

export function MainContentLoader() {
  const { isLoading, message } = useLoading();
  const { state: sidebarState } = useSidebar();
  
  if (!isLoading) return null;

  const isSidebarCollapsed = sidebarState === "collapsed";

  return (
    <div 
      className={cn(
        "fixed right-0 z-30 pointer-events-auto bg-background",
        // Position just below header border to avoid covering it
        "top-[calc(3.5rem+1px)] sm:top-[calc(4rem+1px)]",
        // Mobile: Full width (sidebar is overlay)
        "left-0",
        // Desktop: Adjust for sidebar
        "md:left-[var(--sidebar-width-icon)]",
        !isSidebarCollapsed && "md:left-[var(--sidebar-width)]"
      )}
    >
      <PageLoader message={message || "Loading page..."} />
    </div>
  );
}
