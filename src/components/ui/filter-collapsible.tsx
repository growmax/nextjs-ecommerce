"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const FilterCollapsible = CollapsiblePrimitive.Root;

const FilterCollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const FilterCollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

interface FilterCollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: string | number;
}

/**
 * FilterCollapsibleSection
 * A collapsible section designed for filter sidebars
 * - Uses + and - icons for expand/collapse
 * - No connecting lines between items
 * - Minimal indentation for child items
 */
function FilterCollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
  badge,
}: FilterCollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <FilterCollapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("border-b border-border/40 last:border-b-0", className)}>
        <FilterCollapsibleTrigger className="flex w-full items-center justify-between py-3 px-0 group">
          <div className="flex items-center gap-2 text-left flex-1">
            <span className="text-sm font-medium text-foreground">{title}</span>
            {badge !== undefined && (
              <span className="text-xs text-muted-foreground">
                ({badge})
              </span>
            )}
          </div>
          <div className="shrink-0 ml-2">
            {isOpen ? (
              <Minus className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            ) : (
              <Plus className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            )}
          </div>
        </FilterCollapsibleTrigger>
        <FilterCollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-300">
          <div className="pb-3 pt-1">
            {children}
          </div>
        </FilterCollapsibleContent>
      </div>
    </FilterCollapsible>
  );
}

export {
    FilterCollapsible,
    FilterCollapsibleContent,
    FilterCollapsibleSection,
    FilterCollapsibleTrigger
};

