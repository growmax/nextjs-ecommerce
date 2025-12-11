"use client";

import { Button } from "@/components/ui/button";
import { FilterCollapsibleSection } from "@/components/ui/filter-collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

interface FilterSidebarProps {
  children: React.ReactNode;
  className?: string | undefined;
  activeFilterCount?: number;
  onClearAll?: () => void;
  isLoading?: boolean;
}

/**
 * FilterSidebar
 * Main container for product filters with shadcn-inspired design
 * - Border around the container
 * - Filter icon + label in header
 * - Collapsible sections with + and - icons
 * - Clean, minimal design
 */
export function FilterSidebar({
  children,
  className,
  activeFilterCount = 0,
  onClearAll,
  isLoading = false,
}: FilterSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:block w-64 shrink-0",
        className
      )}
    >
      <div className="sticky top-4 flex flex-col border border-border rounded-lg bg-background overflow-hidden max-h-[calc(100vh-2rem)]">
        {/* Filter Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full min-w-[20px]">
                {activeFilterCount}
              </span>
            )}
          </div>

          {activeFilterCount > 0 && onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-7 text-xs px-2 hover:bg-muted"
              disabled={isLoading}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Filter Body - Scrollable */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-2">
            {children}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

export { FilterCollapsibleSection };

