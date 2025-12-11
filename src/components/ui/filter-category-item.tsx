"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface FilterCategoryItemProps {
  label: string;
  count?: number;
  value: string;
  hasChildren?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onNavigate?: () => void;
}

/**
 * FilterCategoryItem
 * Combines radio button with collapsible dropdown for category navigation
 * - Radio button for selection
 * - Chevron to expand/collapse children
 * - Children shown in collapsible dropdown
 */
export function FilterCategoryItem({
  label,
  count,
  value,
  hasChildren = false,
  children,
  disabled = false,
  className,
  onNavigate,
}: FilterCategoryItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      // Toggle children dropdown
      setIsOpen(!isOpen);
    } else if (onNavigate) {
      // Navigate to category page
      onNavigate();
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("space-y-0.5", className)}>
        {/* Category Item with Radio Button */}
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-2 rounded-md transition-colors",
            "hover:bg-accent/30 cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleClick}
        >
          {/* Radio Button */}
          <RadioGroupItem
            value={value}
            className="shrink-0"
            disabled={disabled}
          />

          {/* Label */}
          <span className="truncate flex-1 text-sm text-left">{label}</span>

          {/* Count and Chevron */}
          <div className="flex items-center gap-1.5 shrink-0">
            {count !== undefined && (
              <span className="text-xs text-muted-foreground">{count}</span>
            )}
            {hasChildren && (
              <CollapsibleTrigger asChild>
                <button
                  className="p-0.5 hover:bg-accent rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>

        {/* Collapsible Children */}
        {hasChildren && (
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <div className="pl-6 space-y-0.5 pt-1">
              {children}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}

interface FilterCategoryChildItemProps {
  label: string;
  count?: number;
  onNavigate?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * FilterCategoryChildItem
 * Child category item (no radio button, just clickable link)
 */
export function FilterCategoryChildItem({
  label,
  count,
  onNavigate,
  disabled = false,
  className,
}: FilterCategoryChildItemProps) {
  return (
    <button
      onClick={onNavigate}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between gap-2 py-2 px-2 rounded-md text-sm transition-colors",
        "hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <span className="truncate flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground shrink-0">
          {count}
        </span>
      )}
    </button>
  );
}
