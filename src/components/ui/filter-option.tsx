"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { ChevronRight } from "lucide-react";

interface FilterOptionProps {
  label: string;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  showChevron?: boolean;
}

/**
 * FilterOption
 * Single filter option item (for categories, brands, etc.)
 */
export function FilterOption({
  label,
  count,
  selected = false,
  onClick,
  disabled = false,
  className,
  showChevron = false,
}: FilterOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between gap-2 py-2 px-2 rounded-md text-sm transition-colors",
        "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        selected && "bg-accent text-accent-foreground font-medium",
        className
      )}
    >
      <span className="truncate flex-1 text-left">{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">
            {count}
          </span>
        )}
        {showChevron && !selected && (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        {selected && (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
    </button>
  );
}

interface FilterCheckboxOptionProps {
  label: string;
  count?: number;
  checked?: boolean;
  onCheckedChange?: (checked: CheckedState) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * FilterCheckboxOption
 * Filter option with checkbox (for multi-select filters)
 */
export function FilterCheckboxOption({
  label,
  count,
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  className,
}: FilterCheckboxOptionProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-colors hover:bg-accent/30",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
      <span className="text-sm truncate flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground shrink-0">
          {count}
        </span>
      )}
    </label>
  );
}

interface FilterRadioOptionProps {
  label: string;
  count?: number;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  hasChildren?: boolean;
  isChild?: boolean;
  showLine?: boolean;
  value?: string;
}

/**
 * FilterRadioOption
 * Filter option with radio button for categories
 * Shows chevron only when hasChildren is true
 * Supports line indentation for child items
 */
export function FilterRadioOption({
  label,
  count,
  onClick,
  disabled = false,
  className,
  hasChildren = false,
  isChild = false,
  showLine = false,
  value = "",
}: FilterRadioOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2 py-2 px-2 rounded-md text-sm transition-colors relative",
        "hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {/* Line indentation for child items */}
      {isChild && showLine && (
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      )}
      
      {/* Radio button or indentation spacing */}
      {!isChild ? (
        <RadioGroupItem
          value={value}
          className="shrink-0"
          disabled={disabled}
        />
      ) : (
        <div className="w-6 shrink-0" />
      )}
      
      <span className="truncate flex-1 text-left">{label}</span>
      
      <div className="flex items-center gap-1.5 shrink-0">
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">
            {count}
          </span>
        )}
        {hasChildren && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}

interface FilterOptionListProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

/**
 * FilterOptionList
 * Container for filter options with optional scroll
 */
export function FilterOptionList({
  children,
  maxHeight = "240px",
  className,
}: FilterOptionListProps) {
  return (
    <ScrollArea style={{ maxHeight }} className={cn("w-full", className)}>
      <div className="space-y-0.5 pr-2">
        {children}
      </div>
    </ScrollArea>
  );
}
