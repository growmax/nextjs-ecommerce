"use client";

import PricingFormat from "@/components/PricingFormat";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductPricingProps {
  pricingResult: {
    final_Price: number;
    discounted_Price?: number;
    final_listing_price: number;
    discount_Percentage?: number;
    isPriceNotAvailable?: boolean;
  } | null;
  pricingConditions: {
    ShowRequestPrice: boolean;
    ShowBasePrice: boolean;
    ShowDiscount: boolean;
  };
  loading?: boolean;
  variant?: "default" | "compact" | "large";
  showDiscountBadge?: boolean;
  className?: string;
  showMRPLabel?: boolean;
}

/**
 * Reusable ProductPricing component
 * Based on buyer-fe ProductPricingNew.jsx
 * Displays final listing price, strikethrough master/base price, and discount badge
 */
export default function ProductPricing({
  pricingResult,
  pricingConditions,
  loading = false,
  variant = "default",
  showDiscountBadge = true,
  className = "",
  showMRPLabel = true,
}: ProductPricingProps) {
  // Size variants
  const sizeClasses = {
    large: "text-3xl font-bold",
    default: "text-xl font-bold",
    compact: "text-base font-bold",
  };

  const strikethroughSizeClasses = {
    large: "text-base",
    default: "text-sm",
    compact: "text-xs",
  };

  const discountSizeClasses = {
    large: "text-sm",
    default: "text-sm",
    compact: "text-xs",
  };

  if (loading) {
    return <Skeleton className={`h-5 w-20 ${className}`} />;
  }

  // Show Request Price
  if (
    pricingConditions.ShowRequestPrice ||
    pricingResult?.isPriceNotAvailable
  ) {
    return (
      <span className={`font-bold ${sizeClasses[variant]} ${className}`}>
        Request Price
      </span>
    );
  }

  // Show pricing if we have data
  if (pricingResult && pricingResult.final_listing_price > 0) {
    const showStrikethrough =
      pricingResult.final_Price &&
      pricingResult.final_Price !== pricingResult.final_listing_price &&
      pricingResult.discounted_Price;

    const showDiscount =
      showDiscountBadge &&
      pricingConditions.ShowDiscount &&
      pricingResult.discount_Percentage &&
      pricingResult.discount_Percentage > 0;

    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        {/* Final Listing Price (after discount) */}
        {pricingConditions.ShowBasePrice && (
          <span className={`${sizeClasses[variant]} whitespace-nowrap`}>
            <PricingFormat value={pricingResult.final_listing_price} />
          </span>
        )}

        {/* Strikethrough Original Price (MRP/Master Price) */}
        {showStrikethrough && !pricingConditions.ShowRequestPrice && (
          <span
            className={`text-gray-500 line-through ${strikethroughSizeClasses[variant]} whitespace-nowrap`}
          >
            {showMRPLabel && "MRP "}
            <PricingFormat value={pricingResult.final_Price} />
          </span>
        )}

        {/* Discount Badge */}
        {showDiscount && (
          <span
            className={`font-bold text-green-600 ${discountSizeClasses[variant]}`}
          >
            {pricingResult.discount_Percentage?.toFixed(0)}% Off
          </span>
        )}
      </div>
    );
  }

  // Fallback: Show Request Price
  return (
    <span className={`font-bold ${sizeClasses[variant]} ${className}`}>
      Request Price
    </span>
  );
}
