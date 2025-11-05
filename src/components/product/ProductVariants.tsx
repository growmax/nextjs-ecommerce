"use client";

import { useState, useMemo } from "react";
import { ProductAttribute } from "@/types/product/product-detail";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProductVariantsProps {
  attributes?: ProductAttribute[];
  onVariantChange?: (selectedVariants: VariantSelection) => void;
}

export interface VariantSelection {
  color?: string;
  size?: string;
  [key: string]: string | undefined;
}

interface ParsedVariants {
  colors: ColorVariant[];
  sizes: string[];
  other: Record<string, string[]>;
}

interface ColorVariant {
  name: string;
  hexCode?: string;
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

// Common size variations
const SIZE_PATTERNS = [
  /^(XXS|XS|S|M|L|XL|XXL|XXXL)$/i,
  /^(Small|Medium|Large|Extra Small|Extra Large)$/i,
  /^\d+\s*(cm|mm|inch|in|ft)$/i,
  /^\d+$/,
];

function parseColorValue(value: string): ColorVariant {
  const lowerValue = value.toLowerCase().trim();
  
  // Check if it's a hex code
  if (/^#[0-9A-F]{6}$/i.test(value)) {
    return { name: value, hexCode: value };
  }
  
  // Check if it matches a known color name
  if (COLOR_HEX_MAP[lowerValue]) {
    return { name: value, hexCode: COLOR_HEX_MAP[lowerValue] };
  }
  
  // Return just the name if no hex code found
  return { name: value };
}

function isSizeAttribute(name: string, value: string): boolean {
  const lowerName = name.toLowerCase();
  
  // Check attribute name
  if (lowerName.includes("size")) return true;
  
  // Check if value matches size patterns
  return SIZE_PATTERNS.some((pattern) => pattern.test(value.trim()));
}

function isColorAttribute(name: string, value: string): boolean {
  const lowerName = name.toLowerCase();
  const lowerValue = value.toLowerCase().trim();
  
  // Check attribute name
  if (lowerName.includes("color") || lowerName.includes("colour")) return true;
  
  // Check if value is a known color name or hex code
  if (COLOR_HEX_MAP[lowerValue]) return true;
  if (/^#[0-9A-F]{6}$/i.test(value)) return true;
  
  return false;
}

function parseAttributes(attributes: ProductAttribute[]): ParsedVariants {
  const colors: ColorVariant[] = [];
  const sizes: string[] = [];
  const other: Record<string, string[]> = {};

  attributes.forEach((attr) => {
    const name = attr.attributeName;
    const value = attr.attributeValue;

    if (isColorAttribute(name, value)) {
      colors.push(parseColorValue(value));
    } else if (isSizeAttribute(name, value)) {
      if (!sizes.includes(value)) {
        sizes.push(value);
      }
    } else {
      if (!other[name]) {
        other[name] = [];
      }
      if (!other[name].includes(value)) {
        other[name].push(value);
      }
    }
  });

  return { colors, sizes, other };
}

export default function ProductVariants({
  attributes,
  onVariantChange,
}: ProductVariantsProps) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedOther, setSelectedOther] = useState<Record<string, string>>({});

  const variants = useMemo(() => {
    if (!attributes || attributes.length === 0) {
      return { colors: [], sizes: [], other: {} };
    }
    return parseAttributes(attributes);
  }, [attributes]);

  const hasVariants =
    variants.colors.length > 0 ||
    variants.sizes.length > 0 ||
    Object.keys(variants.other).length > 0;

  if (!hasVariants) {
    return null;
  }

  const handleColorChange = (color: string) => {
    const newColor = selectedColor === color ? undefined : color;
    setSelectedColor(newColor);
    onVariantChange?.({
      color: newColor,
      size: selectedSize,
      ...selectedOther,
    });
  };

  const handleSizeChange = (size: string) => {
    const newSize = selectedSize === size ? undefined : size;
    setSelectedSize(newSize);
    onVariantChange?.({
      color: selectedColor,
      size: newSize,
      ...selectedOther,
    });
  };

  const handleOtherChange = (attrName: string, value: string) => {
    const newOther = { ...selectedOther };
    if (newOther[attrName] === value) {
      delete newOther[attrName];
    } else {
      newOther[attrName] = value;
    }
    setSelectedOther(newOther);
    onVariantChange?.({
      color: selectedColor,
      size: selectedSize,
      ...newOther,
    });
  };

  return (
    <div className="space-y-6">
      <Separator />

      {/* Colors */}
      {variants.colors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Colors:</h3>
          <div className="flex flex-wrap gap-3">
            {variants.colors.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorChange(color.name)}
                className={cn(
                  "relative rounded-full transition-all",
                  selectedColor === color.name
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:scale-110"
                )}
                aria-label={`Select ${color.name}`}
                title={color.name}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2",
                    color.hexCode
                      ? "border-gray-300"
                      : "border-gray-400 bg-gradient-to-br from-gray-200 to-gray-400"
                  )}
                  style={
                    color.hexCode
                      ? { backgroundColor: color.hexCode }
                      : undefined
                  }
                />
                {selectedColor === color.name && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full border-2 border-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {selectedColor && (
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium">{selectedColor}</span>
            </p>
          )}
        </div>
      )}

      {/* Sizes */}
      {variants.sizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Sizes:</h3>
          <div className="flex flex-wrap gap-2">
            {variants.sizes.map((size, index) => (
              <button
                key={index}
                onClick={() => handleSizeChange(size)}
                className={cn(
                  "min-w-[60px] px-4 py-2 border-2 rounded-lg font-medium text-sm transition-all",
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                )}
                aria-label={`Select size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Other Attributes */}
      {Object.entries(variants.other).map(([attrName, values]) => (
        <div key={attrName} className="space-y-3">
          <h3 className="text-lg font-semibold capitalize">{attrName}:</h3>
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <Badge
                key={index}
                variant={selectedOther[attrName] === value ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm transition-all",
                  selectedOther[attrName] === value
                    ? ""
                    : "hover:bg-gray-100"
                )}
                onClick={() => handleOtherChange(attrName, value)}
              >
                {value}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

