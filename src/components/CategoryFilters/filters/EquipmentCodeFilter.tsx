"use client";

import { useState } from "react";
import { Search, Wrench } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FilterOption } from "@/types/category-filters";

interface EquipmentCodeFilterProps {
  options: FilterOption[];
  selectedCodes: string[];
  onToggle: (code: string) => void;
  isLoading?: boolean;
}

/**
 * EquipmentCodeFilter Component
 * Filter by equipment codes
 */
export function EquipmentCodeFilter({
  options,
  selectedCodes,
  onToggle,
  isLoading = false,
}: EquipmentCodeFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No equipment codes available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold flex items-center gap-1.5">
        <Wrench className="h-3.5 w-3.5" />
        Equipment Codes
      </h4>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search equipment codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Options */}
      <ScrollArea className="h-[140px]">
        <div className="space-y-1 pr-4">
          {filteredOptions.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2">
              No codes found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedCodes.includes(option.value);

              return (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 rounded-md p-1 transition-colors hover:bg-accent/50"
                >
                  <Checkbox
                    id={`equipment-${option.value}`}
                    checked={isSelected}
                    onCheckedChange={() => onToggle(option.value)}
                    className="shrink-0"
                  />
                  <Label
                    htmlFor={`equipment-${option.value}`}
                    className="flex-1 cursor-pointer text-sm font-normal leading-tight"
                  >
                    {option.label}
                  </Label>
                  {option.count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({option.count})
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

