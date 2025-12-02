"use client";

import { DiscountItem } from "@/lib/api/services/DiscountService/DiscountService";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface ProductPriceProps {
  productId: number;
  unitListPrice?: number;
  discountData?: DiscountItem[];
  discountLoading: boolean;
  discountError?: Error | null;
}

/**
 * ProductPrice Component
 * Displays product price with loading state
 * Shows unitListPrice initially (for SEO), updates to BasePrice when discount data loads
 */
export function ProductPrice({
  productId,
  unitListPrice,
  discountData,
  discountLoading,
  discountError,
}: ProductPriceProps) {
  // Find discount data for this product
  const productDiscount = useMemo(() => {
    return discountData?.find(
      item => item.ProductVariantId === productId
    );
  }, [discountData, productId]);

  // Determine final price to display
  const displayPrice = useMemo(() => {
    // If discount data is loaded and has BasePrice, use it
    if (productDiscount?.BasePrice !== undefined) {
      return productDiscount.BasePrice;
    }
    // Otherwise use unitListPrice (for SEO fallback)
    return unitListPrice || 0;
  }, [productDiscount?.BasePrice, unitListPrice]);

  // Show skeleton while loading
  if (discountLoading) {
    return (
      <div className="inline-flex items-center gap-2 whitespace-nowrap">
        <Skeleton className="h-6 w-20" />
      </div>
    );
  }

  // Show error state (graceful degradation - show unitListPrice)
  if (discountError) {
    return (
      <div className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="text-lg font-bold text-blue-600">
          ₹{unitListPrice || 0}
        </span>
      </div>
    );
  }

  // Show final price
  return (
    <div className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="text-lg font-bold text-blue-600">
        ₹{displayPrice}
      </span>
    </div>
  );
}












