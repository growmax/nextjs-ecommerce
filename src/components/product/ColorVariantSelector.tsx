"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ColorOption {
  value: string;
  count: number;
  hexCode?: string;
}

interface ColorVariantSelectorProps {
  options: ColorOption[];
  selectedColor?: string;
  onColorChange: (color: string) => void;
  className?: string;
}

// Common color name to hex mapping
const COLOR_HEX_MAP: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#F59E0B",
  purple: "#A855F7",
  pink: "#EC4899",
  orange: "#F97316",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#6B7280",
  grey: "#6B7280",
  brown: "#92400E",
  navy: "#1E3A8A",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  lime: "#84CC16",
  indigo: "#6366F1",
};

function getColorHexCode(colorName: string): string | undefined {
  const lowerName = colorName.toLowerCase().trim();
  
  // Check if it's already a hex code
  if (/^#[0-9A-F]{6}$/i.test(colorName)) {
    return colorName;
  }
  
  return COLOR_HEX_MAP[lowerName];
}

function ColorSwatch({
  color,
  isSelected,
  onClick,
  isDisabled = false,
}: {
  color: ColorOption;
  isSelected: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}) {
  const hexCode = color.hexCode || getColorHexCode(color.value);
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || color.count === 0}
      className={cn(
        "relative rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      aria-label={`Select ${color.value} color${color.count > 0 ? "" : " (out of stock)"}`}
      title={`${color.value}${color.count > 0 ? "" : " (out of stock)"}`}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full border-2 transition-all",
          hexCode
            ? "border-gray-300"
            : "border-gray-400 bg-gradient-to-br from-gray-200 to-gray-400",
          isDisabled && "opacity-50 cursor-not-allowed",
          isSelected && "border-primary"
        )}
        style={
          hexCode
            ? { backgroundColor: hexCode }
            : undefined
        }
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full border-2 border-black shadow-sm" />
        </div>
      )}
      
      {/* Out of stock indicator */}
      {isDisabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-red-500 rotate-45" />
        </div>
      )}
    </button>
  );
}

const MemoizedColorSwatch = memo(ColorSwatch);

function ColorVariantSelector({
  options,
  selectedColor,
  onColorChange,
  className,
}: ColorVariantSelectorProps) {
  if (!options.length) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Color:</h3>
        {selectedColor && (
          <Badge variant="outline" className="text-xs">
            {selectedColor}
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {options.map((color) => {
          const isSelected = selectedColor === color.value;
          const isDisabled = color.count === 0;
          
          return (
            <MemoizedColorSwatch
              key={`${color.value}-${color.count}`}
              color={color}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onClick={() => onColorChange(color.value)}
            />
          );
        })}
      </div>
      
      {selectedColor && (
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium">{selectedColor}</span>
        </p>
      )}
    </div>
  );
}

export default memo(ColorVariantSelector);

