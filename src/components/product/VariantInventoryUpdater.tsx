"use client";

import { Badge } from "@/components/ui/badge";
import { useProductVariantContext } from "@/contexts/ProductVariantContext";
import { cn } from "@/lib/utils";
import type { InventoryInfo } from "@/types/product/product-detail";
import { useMemo } from "react";

interface VariantInventoryUpdaterProps {
  baseInventory: InventoryInfo[];
}

export default function VariantInventoryUpdater({
  baseInventory,
}: VariantInventoryUpdaterProps) {
  const { selectedVariant } = useProductVariantContext();

  // Use variant inventory if selected, otherwise use base inventory
  const displayInventory = useMemo(() => {
    if (selectedVariant && selectedVariant.inventory) {
      return selectedVariant.inventory;
    }
    return baseInventory;
  }, [selectedVariant, baseInventory]);

  // Check inventory status
  const hasInventory = displayInventory && displayInventory.length > 0;
  const totalAvailableQty = hasInventory
    ? displayInventory.reduce(
        (sum, inv) => sum + (inv.availableQuantity || 0),
        0
      )
    : 0;
  const isInStock = hasInventory && displayInventory.some(inv => inv.inStock);

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
