/**
 * VariantAttributeFilters Component
 * 
 * Dynamic multi-select filters for variant attributes (Color, Size, Material, etc.).
 * Each attribute group is rendered as a separate collapsible section.
 */

"use client";

import { CollapsibleSection } from "@/components/ui/collapsible";
import { FilterOption, FilterOptionList } from "../FilterOptionList";

export interface VariantAttributeOption {
  /** Option value */
  value: string;
  
  /** Display label */
  label: string;
  
  /** Product count */
  count?: number;
}

export interface VariantAttributeGroup {
  /** Attribute name (e.g., "Color", "Size") */
  attributeName: string;
  
  /** Available options */
  options: VariantAttributeOption[];
}

interface VariantAttributeFiltersProps {
  /** Attribute groups from aggregations */
  attributeGroups: VariantAttributeGroup[];
  
  /** Currently selected attributes */
  selectedAttributes: Record<string, string[]>;
  
  /** Toggle handler */
  onToggle: (attributeName: string, value: string) => void;
  
  /** Loading state */
  isLoading?: boolean;
}

/**
 * VariantAttributeFilters
 * 
 * Renders collapsible sections for each variant attribute group.
 * Users can select multiple values per attribute.
 */
export function VariantAttributeFilters({
  attributeGroups,
  selectedAttributes,
  onToggle,
  isLoading = false,
}: VariantAttributeFiltersProps) {
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
  
  if (attributeGroups.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        No variant attributes available
      </div>
    );
  }
  
  return (
    <div className="space-y-0">
      {attributeGroups.map((group) => {
        const selectedValues = selectedAttributes[group.attributeName] || [];
        
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
            key={group.attributeName}
            title={group.attributeName}
            defaultOpen={selectedValues.length > 0}
            {...(selectedValues.length > 0 && { badge: selectedValues.length })}
          >
            <div className="px-4 pb-4">
              <FilterOptionList
                options={options}
                onToggle={(value) => onToggle(group.attributeName, value)}
                multiple={true}
                searchable={group.options.length > 8}
                searchPlaceholder={`Search ${group.attributeName.toLowerCase()}...`}
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
