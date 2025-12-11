/**
 * ProductSpecificationFilters Component
 * 
 * Multi-select filters for product specifications (nested structure).
 * Each spec group is rendered as a separate collapsible section.
 */

"use client";

import { CollapsibleSection } from "@/components/ui/collapsible";
import { FilterOption, FilterOptionList } from "../FilterOptionList";

export interface SpecificationOption {
  /** Spec value */
  value: string;
  
  /** Display label */
  label: string;
  
  /** Product count */
  count?: number;
}

export interface SpecificationGroup {
  /** Specification key (e.g., "Material", "Voltage") */
  specKey: string;
  
  /** Available values */
  options: SpecificationOption[];
}

interface ProductSpecificationFiltersProps {
  /** Specification groups from aggregations */
  specGroups: SpecificationGroup[];
  
  /** Currently selected specifications */
  selectedSpecs: Record<string, string[]>;
  
  /** Toggle handler */
  onToggle: (specKey: string, value: string) => void;
  
  /** Loading state */
  isLoading?: boolean;
}

/**
 * ProductSpecificationFilters
 * 
 * Renders collapsible sections for each product specification group.
 * Users can select multiple values per specification.
 */
export function ProductSpecificationFilters({
  specGroups,
  selectedSpecs,
  onToggle,
  isLoading = false,
}: ProductSpecificationFiltersProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
            <div className="space-y-1.5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (specGroups.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        No specifications available
      </div>
    );
  }
  
  return (
    <div className="space-y-0">
      {specGroups.map((group) => {
        const selectedValues = selectedSpecs[group.specKey] || [];
        
        // Convert to FilterOption format
        const options: FilterOption[] = group.options.map((option) => {
          const filterOption: FilterOption = {
            value: option.value,
            label: option.label,
            selected: selectedValues.includes(option.value),
          };
          if (option.count !== undefined) {
            filterOption.count = option.count;
          }
          return filterOption;
        });
        
        return (
          <CollapsibleSection
            key={group.specKey}
            title={group.specKey}
            defaultOpen={selectedValues.length > 0}
            {...(selectedValues.length > 0 && { badge: selectedValues.length })}
          >
            <div className="px-4 pb-4">
              <FilterOptionList
                options={options}
                onToggle={(value) => onToggle(group.specKey, value)}
                multiple={true}
                searchable={group.options.length > 8}
                searchPlaceholder={`Search ${group.specKey.toLowerCase()}...`}
                showCounts={true}
                maxHeight="200px"
              />
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
