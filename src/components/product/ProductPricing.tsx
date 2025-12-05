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
  discountPercentage?: number; // Optional discount percentage from discount params
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
  showMRPLabel: _showMRPLabel = true,
  discountPercentage: discountPercentageProp,
}: ProductPricingProps) {
  // Size variants - Responsive for mobile
  const sizeClasses = {
    large: "text-2xl sm:text-3xl font-bold",
    default: "text-xs sm:text-xl font-bold",
    compact: "text-sm sm:text-base font-bold",
  };

  const strikethroughSizeClasses = {
    large: "text-sm sm:text-base",
    default: "text-[10px] sm:text-sm",
    compact: "text-[10px] sm:text-xs",
  };

  const discountSizeClasses = {
    large: "text-xs sm:text-sm",
    default: "text-[10px] sm:text-sm",
    compact: "text-[10px] sm:text-xs",
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
        {/* Final Listing Price (after discount) with inline discount percentage */}
        {pricingConditions.ShowBasePrice && (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={sizeClasses[variant]}>
              <PricingFormat value={pricingResult.final_listing_price} />
            </span>
            {/* Discount Percentage Badge - Show next to overridden price when discount params > 0 */}
         
          </div>
        )}

        {/* Strikethrough Original Price (MRP/Master Price) */}
        {showStrikethrough && !pricingConditions.ShowRequestPrice && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`text-gray-500 line-through ${strikethroughSizeClasses[variant]} whitespace-nowrap`}
          >
            
            <PricingFormat value={pricingResult.final_Price} />
          </span>
          {(() => {
              // Use discount percentage from pricingResult or from prop (discount params)
              const discountPercent =  discountPercentageProp ?? 0;
              
              if (discountPercent > 0) {
                return (
                  <span className={`font-bold text-green-600 ${discountSizeClasses[variant]}`}>
                    {Math.round(discountPercent)}%
                  </span>
                );
              }
              return null;
            })()}
          </div>
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
