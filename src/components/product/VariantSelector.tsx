"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import ColorVariantSelector from "./ColorVariantSelector";
import SizeVariantSelector from "./SizeVariantSelector";
import { Badge } from "@/components/ui/badge";

interface AttributeOption {
  value: string;
  count: number;
  hexCode?: string;
}

interface VariantGroups {
  color?: AttributeOption[];
  size?: AttributeOption[];
  [key: string]: AttributeOption[] | undefined;
}

interface VariantSelection {
  color?: string;
  size?: string;
  [key: string]: string | undefined;
}

interface VariantSelectorProps {
  variantGroups: VariantGroups;
  selection: VariantSelection;
  onSelectionChange: (selection: VariantSelection) => void;
  className?: string;
  showLabels?: boolean;
}

function OtherAttributeSelector({
  attributeName,
  options,
  selectedValue,
  onChange,
}: {
  attributeName: string;
  options: AttributeOption[];
  selectedValue?: string;
  onChange: (value: string) => void;
}) {
  if (!options.length) return null;

  const displayName = attributeName.charAt(0).toUpperCase() + attributeName.slice(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{displayName}:</h3>
        {selectedValue && (
          <Badge variant="outline" className="text-xs">
            {selectedValue}
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const isDisabled = option.count === 0;
          
          return (
            <button
              key={`${attributeName}-${option.value}`}
              onClick={() => !isDisabled && onChange(option.value)}
              disabled={isDisabled}
              className={cn(
                "px-4 py-2 border-2 rounded-lg font-medium text-sm transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-105"
              )}
              aria-label={`Select ${option.value} ${displayName.toLowerCase()}${option.count > 0 ? "" : " (out of stock)"}`}
            >
              {option.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VariantSelector({
  variantGroups,
  selection,
  onSelectionChange,
  className,
  showLabels = true,
}: VariantSelectorProps) {
  const handleColorChange = useCallback(
    (color: string) => {
      const newSelection = { 
        ...selection, 
        color: selection.color === color ? "" as const : color 
      };
      onSelectionChange(newSelection);
    },
    [selection, onSelectionChange]
  );

  const handleSizeChange = useCallback(
    (size: string) => {
      const newSelection = { 
        ...selection, 
        size: selection.size === size ? "" as const : size 
      };
      onSelectionChange(newSelection);
    },
    [selection, onSelectionChange]
  );

  const handleOtherAttributeChange = useCallback(
    (attributeName: string, value: string) => {
      const newSelection = {
        ...selection,
        [attributeName]: selection[attributeName] === value ? "" as const : value,
      };
      onSelectionChange(newSelection);
    },
    [selection, onSelectionChange]
  );

  const selectedAttributesCount = Object.values(selection).filter(Boolean).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Selection Summary */}
      {showLabels && selectedAttributesCount > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Selected:</span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(selection).map(([key, value]) => {
              if (!value) return null;
              return (
                <Badge key={key} variant="secondary" className="text-xs">
                  {value}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {variantGroups.color && (
        <ColorVariantSelector
          options={variantGroups.color}
          selectedColor={selection.color || ""}
          onColorChange={handleColorChange}
        />
      )}

      {/* Size Selector */}
      {variantGroups.size && (
        <>
          {variantGroups.color && <Separator />}
          <SizeVariantSelector
            options={variantGroups.size}
            selectedSize={selection.size || ""}
            onSizeChange={handleSizeChange}
          />
        </>
      )}

      {/* Other Attributes */}
      {Object.entries(variantGroups)
        .filter(([key]) => key !== "color" && key !== "size")
        .map(([attributeName, options]) => {
          return (
            <div key={attributeName}>
              {(variantGroups.color || variantGroups.size) && <Separator />}
              <OtherAttributeSelector
                attributeName={attributeName}
                options={options || []}
                selectedValue={selection[attributeName] || ""}
                onChange={(value) => handleOtherAttributeChange(attributeName, value)}
              />
            </div>
          );
        })}
    </div>
  );
}

export default memo(VariantSelector);
