"use client";

import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProductSpecificationGroup } from "@/types/category-filters";

interface ProductSpecificationFilterProps {
  specificationGroups: ProductSpecificationGroup[];
  selectedSpecifications: Record<string, string[]>;
  onToggle: (specKey: string, value: string) => void;
  isLoading?: boolean;
}

/**
 * ProductSpecificationFilter Component
 * Filter by product specifications
 */
export function ProductSpecificationFilter({
  specificationGroups,
  selectedSpecifications,
  onToggle,
  isLoading,
}: ProductSpecificationFilterProps) {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {}
  );

  const handleSearchChange = (specKey: string, value: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [specKey]: value,
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

  if (specificationGroups.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No specifications available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {specificationGroups.map((group) => {
        const searchQuery = searchQueries[group.specKey]?.toLowerCase() || "";
        const filteredOptions = group.options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery)
        );

        return (
          <div key={group.specKey} className="space-y-2">
            <h4 className="text-xs font-semibold flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {group.specName}
            </h4>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${group.specName.toLowerCase()}...`}
                value={searchQueries[group.specKey] || ""}
                onChange={(e) =>
                  handleSearchChange(group.specKey, e.target.value)
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
                      selectedSpecifications[group.specKey]?.includes(
                        option.value
                      ) || false;

                    return (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 rounded-md p-1 transition-colors hover:bg-accent/50"
                      >
                        <Checkbox
                          id={`${group.specKey}-${option.value}`}
                          checked={isSelected}
                          onCheckedChange={() =>
                            onToggle(group.specKey, option.value)
                          }
                          className="shrink-0"
                        />
                        <Label
                          htmlFor={`${group.specKey}-${option.value}`}
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

