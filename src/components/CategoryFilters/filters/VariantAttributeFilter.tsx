"use client";

import { useState } from "react";
import { Search, Palette } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { VariantAttributeGroup } from "@/types/category-filters";

interface VariantAttributeFilterProps {
  attributeGroups: VariantAttributeGroup[];
  selectedAttributes: Record<string, string[]>;
  onToggle: (attributeName: string, value: string) => void;
  isLoading?: boolean;
}

/**
 * VariantAttributeFilter Component
 * Dynamic component for variant attributes (Color, Size, etc.)
 */
export function VariantAttributeFilter({
  attributeGroups,
  selectedAttributes,
  onToggle,
  isLoading,
}: VariantAttributeFilterProps) {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {}
  );

  const handleSearchChange = (attributeName: string, value: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="space-y-1">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-3.5 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (attributeGroups.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No variant attributes available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attributeGroups.map((group) => {
        const searchQuery =
          searchQueries[group.attributeName]?.toLowerCase() || "";
        const filteredOptions = group.options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery)
        );

        return (
          <div key={group.attributeName} className="space-y-2">
            <h4 className="text-xs font-semibold flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              {group.attributeName}
            </h4>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${group.attributeName.toLowerCase()}...`}
                value={searchQueries[group.attributeName] || ""}
                onChange={(e) =>
                  handleSearchChange(group.attributeName, e.target.value)
                }
                className="pl-8 h-8 text-sm"
              />
            </div>

            {/* Options */}
            <ScrollArea className="h-[110px]">
              <div className="space-y-1 pr-4">
                {filteredOptions.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-2">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected =
                      selectedAttributes[group.attributeName]?.includes(
                        option.value
                      ) || false;

                    return (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 rounded-md p-1 transition-colors hover:bg-accent/50"
                      >
                        <Checkbox
                          id={`${group.attributeName}-${option.value}`}
                          checked={isSelected}
                          onCheckedChange={() =>
                            onToggle(group.attributeName, option.value)
                          }
                          className="shrink-0"
                        />
                        <Label
                          htmlFor={`${group.attributeName}-${option.value}`}
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
      })}
    </div>
  );
}

