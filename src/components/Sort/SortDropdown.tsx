"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SortDropdownProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const SORT_OPTIONS = [
  { value: 1, label: "Relevance" },
  { value: 2, label: "Price: Low to High" },
  { value: 3, label: "Price: High to Low" },
] as const;

/**
 * SortDropdown Component
 * Allows users to sort products by different criteria
 */
export function SortDropdown({ value, onChange, disabled = false }: SortDropdownProps) {
  return (
    <Select value={value.toString()} onValueChange={(val) => onChange(parseInt(val, 10))} disabled={disabled}>
      <SelectTrigger 
        className="w-[180px] h-10 border-border bg-background dark:bg-background hover:bg-accent hover:text-accent-foreground transition-colors" 
        disabled={disabled}
      >
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

