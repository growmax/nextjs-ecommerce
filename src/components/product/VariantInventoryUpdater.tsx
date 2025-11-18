"use client";

import { useMemo } from "react";
import { useProductVariantContext } from "@/contexts/ProductVariantContext";
import { getProductAvailability } from "@/utils/product/product-formatter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/types/product/product-detail";
import type { InventoryInfo } from "@/types/product/product-detail";

interface VariantInventoryUpdaterProps {
  baseInventory: InventoryInfo[];
  baseProduct: ProductDetail;
}

export default function VariantInventoryUpdater({
  baseInventory,
  baseProduct,
}: VariantInventoryUpdaterProps) {
  const { selectedVariant } = useProductVariantContext();

  // Use variant inventory if selected, otherwise use base inventory
  const displayInventory = useMemo(() => {
    if (selectedVariant && selectedVariant.inventory) {
      return selectedVariant.inventory;
    }
    return baseInventory;
  }, [selectedVariant, baseInventory]);

  // Create a product-like object for availability calculation
  const displayProduct = useMemo(() => {
    if (selectedVariant) {
      return {
        ...baseProduct,
        inventory: selectedVariant.inventory,
      };
    }
    return baseProduct;
  }, [selectedVariant, baseProduct]);

  const availability = useMemo(() => {
    return getProductAvailability(displayProduct);
  }, [displayProduct]);

  // Check inventory status
  const hasInventory = displayInventory && displayInventory.length > 0;
  const totalAvailableQty = hasInventory
    ? displayInventory.reduce(
        (sum, inv) => sum + (inv.availableQuantity || 0),
        0
      )
    : 0;
  const isInStock =
    hasInventory && displayInventory.some(inv => inv.inStock);

  return (
    <div role="status" aria-live="polite">
      <Badge
        variant={isInStock ? "default" : "destructive"}
        className={cn(
          "text-sm py-2 px-4 font-medium",
          isInStock
            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        )}
        aria-label={isInStock ? "In stock" : "Out of stock"}
      >
        {isInStock ? "✓ In Stock" : "✕ Out of Stock"}
      </Badge>
      {hasInventory && isInStock && totalAvailableQty > 0 && (
        <span className="text-sm text-muted-foreground ml-3">
          ({totalAvailableQty} available)
        </span>
      )}
    </div>
  );
}

