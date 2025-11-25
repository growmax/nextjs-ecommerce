"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ElasticVariantAttributes } from "@/types/product/product-group";
import { memo, useCallback, useMemo } from "react";
import ColorVariantSelector from "@/components/product/ColorVariantSelector";
import SizeVariantSelector from "@/components/product/SizeVariantSelector";

interface AttributeOption {
  value: string;
  count: number;
  hexCode?: string;
  available?: boolean;
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
  variantAttributes?: ElasticVariantAttributes[]; // Optional: from Product Group
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
  displayType?: string;
}) {
  if (!options.length) return null;

  const displayName =
    attributeName.charAt(0).toUpperCase() + attributeName.slice(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {displayName}:
        </h3>
        {selectedValue && (
          <Badge variant="outline" className="text-xs">
            {selectedValue}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = selectedValue === option.value;
          const isDisabled = option.count === 0 || option.available === false;

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
  variantAttributes,
  className,
  showLabels = true,
}: VariantSelectorProps) {
  // Determine attribute order and display types from Product Group if available
  const attributeOrder = useMemo(() => {
    if (variantAttributes && variantAttributes.length > 0) {
      return variantAttributes.map(attr => ({
        key: attr.name.toLowerCase().replace(/\s+/g, "_"),
        name: attr.name,
        displayType: attr.displayType,
      }));
    }
    // Fallback: infer from variantGroups (backward compatibility)
    return Object.keys(variantGroups).map(key => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      displayType: key === "color" ? "color" : "text",
    }));
  }, [variantAttributes, variantGroups]);
  const handleColorChange = useCallback(
    (color: string) => {
      const newSelection = {
        ...selection,
        color: selection.color === color ? ("" as const) : color,
      };
      onSelectionChange(newSelection);
    },
    [selection, onSelectionChange]
  );

  const handleSizeChange = useCallback(
    (size: string) => {
      const newSelection = {
        ...selection,
        size: selection.size === size ? ("" as const) : size,
      };
      onSelectionChange(newSelection);
    },
    [selection, onSelectionChange]
  );

  const handleOtherAttributeChange = useCallback(
    (attributeName: string, value: string) => {
      const newSelection = {
        ...selection,
        [attributeName]:
          selection[attributeName] === value ? ("" as const) : value,
      };
      onSelectionChange(newSelection);
    },
    [selection, onSelectionChange]
  );

  const selectedAttributesCount =
    Object.values(selection).filter(Boolean).length;

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

      {/* Other Attributes - Use Product Group order if available */}
      {attributeOrder
        .filter(({ key }) => key !== "color" && key !== "size")
        .map(({ key, name, displayType }) => {
          const options = variantGroups[key];
          if (!options || options.length === 0) return null;

          return (
            <div key={key}>
              {(variantGroups.color || variantGroups.size) && <Separator />}
              <OtherAttributeSelector
                attributeName={name}
                options={options}
                selectedValue={selection[key] || ""}
                onChange={value => handleOtherAttributeChange(key, value)}
                displayType={displayType}
              />
            </div>
          );
        })}
    </div>
  );
}

export default memo(VariantSelector);
