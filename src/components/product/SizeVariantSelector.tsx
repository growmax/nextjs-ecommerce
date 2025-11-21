"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SizeOption {
  value: string;
  count: number;
}

interface SizeVariantSelectorProps {
  options: SizeOption[];
  selectedSize?: string;
  onSizeChange: (size: string) => void;
  className?: string;
}

// Common size patterns
const SIZE_PATTERNS = [
  /^(XXS|XS|S|M|L|XL|XXL|XXXL)$/i,
  /^(Small|Medium|Large|Extra Small|Extra Large)$/i,
  /^\d+\s*(cm|mm|inch|in|ft)$/i,
  /^\d+$/,
];

function getSizeCategory(size: string | null | undefined): "standard" | "text" | "numeric" | "other" {
  if (!size) return "other";
  const sizeStr = size.trim();
  
  if (!sizeStr) return "other";
  
  try {
    if (SIZE_PATTERNS[0]?.test(sizeStr)) {
      return "standard";
    } else if (SIZE_PATTERNS[1]?.test(sizeStr)) {
      return "text";
    } else if (SIZE_PATTERNS[2]?.test(sizeStr) || SIZE_PATTERNS[3]?.test(sizeStr)) {
      return "numeric";
    }
  } catch (error) {
    console.warn("Error testing size patterns:", error);
  }
  
  return "other";
}

function SizeButton({
  size,
  isSelected,
  isDisabled,
  onClick,
}: {
  size: SizeOption;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) {
  const category = getSizeCategory(size.value);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "min-w-[60px] px-4 py-2 border-2 rounded-lg font-medium text-sm transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-105",
        category === "numeric" && "min-w-[70px]",
        category === "text" && "min-w-[80px]"
      )}
      aria-label={`Select size ${size.value}${size.count > 0 ? "" : " (out of stock)"}`}
      title={`${size.value}${size.count > 0 ? "" : " (out of stock)"}`}
    >
      <div className="flex flex-col items-center space-y-1">
        <span>{size.value}</span>
        {size.count === 0 && (
          <span className="text-xs text-red-500">Out</span>
        )}
        {size.count > 0 && size.count < 5 && (
          <span className="text-xs text-orange-500">{size.count} left</span>
        )}
      </div>
    </button>
  );
}

const MemoizedSizeButton = memo(SizeButton);

function SizeVariantSelector({
  options,
  selectedSize,
  onSizeChange,
  className,
}: SizeVariantSelectorProps) {
  if (!options.length) {
    return null;
  }

  // Group sizes by category for better organization
  const groupedOptions = options.reduce((groups, size) => {
    const category = getSizeCategory(size.value);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(size);
    return groups;
  }, {} as Record<string, SizeOption[]>);

  const categoryOrder = ["standard", "text", "numeric", "other"];
  const categoryLabels = {
    standard: "Standard Sizes",
    text: "Text Sizes",
    numeric: "Numeric Sizes",
    other: "Other Sizes",
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Size:</h3>
        {selectedSize && (
          <Badge variant="outline" className="text-xs">
            {selectedSize}
          </Badge>
        )}
      </div>

      {categoryOrder.map((category) => {
        const categoryOptions = groupedOptions[category] || [];
        if (!categoryOptions.length) return null;

        return (
          <div key={category} className="space-y-2">
            {Object.keys(groupedOptions).length > 1 && (
              <h4 className="text-sm font-medium text-muted-foreground capitalize">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>
            )}
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((size) => {
                const isSelected = selectedSize === size?.value;
                const isDisabled = size?.count === 0;

                return (
                  <MemoizedSizeButton
                    key={`${size.value}-${size.count}`}
                    size={size}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    onClick={() => onSizeChange(size.value)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedSize && (
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium">{selectedSize}</span>
        </p>
      )}

      {/* Size guide tooltip */}
      <div className="text-xs text-muted-foreground">
        <span className="underline cursor-help" title="Click to see size guide">
          Size Guide
        </span>
      </div>
    </div>
  );
}

export default memo(SizeVariantSelector);
