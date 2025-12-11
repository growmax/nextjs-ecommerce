/**
 * FilterOptionList Component
 * 
 * Reusable component for displaying checkbox/radio filter options.
 * Used for variant attributes, specifications, brands, etc.
 */

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export interface FilterOption {
  /** Unique value identifier */
  value: string;
  
  /** Display label */
  label: string;
  
  /** Product count */
  count?: number;
  
  /** Is this option selected */
  selected?: boolean;
  
  /** Is this option disabled */
  disabled?: boolean;
}

interface FilterOptionListProps {
  /** Filter options to display */
  options: FilterOption[];
  
  /** Toggle option callback */
  onToggle: (value: string) => void;
  
  /** Allow multiple selections */
  multiple?: boolean;
  
  /** Show search input */
  searchable?: boolean;
  
  /** Placeholder for search input */
  searchPlaceholder?: string;
  
  /** Maximum height for scroll area */
  maxHeight?: string;
  
  /** Show product counts */
  showCounts?: boolean;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * FilterOptionList
 * 
 * Displays a searchable, scrollable list of filter options with checkboxes.
 */
export function FilterOptionList({
  options,
  onToggle,
  multiple = true,
  searchable = false,
  searchPlaceholder = "Search...",
  maxHeight = "240px",
  showCounts = true,
  isLoading = false,
  emptyMessage = "No options available",
}: FilterOptionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 flex-1 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }
  
  // Render empty state
  if (options.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Search Input */}
      {searchable && options.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      )}
      
      {/* Options List */}
      <ScrollArea style={{ height: maxHeight }}>
        <div className="space-y-1 pr-3">
          {filteredOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2 text-center">
              No results found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <FilterOptionItem
                key={option.value}
                option={option}
                onToggle={() => onToggle(option.value)}
                multiple={multiple}
                showCount={showCounts}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * FilterOptionItem Component
 * Individual filter option with checkbox
 */
interface FilterOptionItemProps {
  option: FilterOption;
  onToggle: () => void;
  multiple: boolean;
  showCount: boolean;
}

function FilterOptionItem({
  option,
  onToggle,
  multiple,
  showCount,
}: FilterOptionItemProps) {
  return (
    <button
      onClick={onToggle}
      disabled={option.disabled}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-2 rounded-md",
        "text-left text-sm transition-colors",
        "hover:bg-accent/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
      )}
    >
      {/* Checkbox */}
      {multiple && (
        <Checkbox
          checked={option.selected || false}
          disabled={option.disabled}
          className="shrink-0"
        />
      )}
      
      {/* Radio-style indicator for single selection */}
      {!multiple && (
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2 shrink-0 transition-colors",
            option.selected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30"
          )}
        >
          {option.selected && (
            <div className="h-full w-full rounded-full bg-white scale-50" />
          )}
        </div>
      )}
      
      {/* Label and count */}
      <div className="flex items-center justify-between flex-1 min-w-0 gap-2">
        <span className={cn(
          "truncate",
          option.selected && "font-medium"
        )}>
          {option.label}
        </span>
        
        {showCount && option.count !== undefined && (
          <span className="text-xs text-muted-foreground shrink-0">
            ({option.count})
          </span>
        )}
      </div>
    </button>
  );
}
