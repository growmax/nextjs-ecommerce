"use client";

import { Badge } from "@/components/ui/badge";
import { useProductVariantContext } from "@/contexts/ProductVariantContext";
import { formatPrice } from "@/utils/product/product-formatter";
import { Info } from "lucide-react";
import { useMemo } from "react";

interface VariantPriceUpdaterProps {
  basePrice: number;
  baseMrp?: number;
  showPrice?: boolean;
  isTaxInclusive?: boolean;
}

export default function VariantPriceUpdater({
  basePrice,
  baseMrp,
  showPrice = true,
  isTaxInclusive = false,
}: VariantPriceUpdaterProps) {
  const { selectedVariant } = useProductVariantContext();

  // Use variant price if selected, otherwise use base price
  const displayPrice = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.pricing.unit_list_price;
    }
    return basePrice;
  }, [selectedVariant, basePrice]);

  const displayMrp = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.pricing.unit_mrp;
    }
    return baseMrp;
  }, [selectedVariant, baseMrp]);

  return (
    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-green-700">
          {showPrice !== false ? (
            formatPrice(displayPrice)
          ) : (
            <span className="text-2xl text-green-600">Contact for Price</span>
          )}
        </span>
        {displayMrp && displayMrp > displayPrice && (
          <span className="text-xl text-gray-500 line-through">
            {formatPrice(displayMrp)}
          </span>
        )}
      </div>
      {isTaxInclusive && (
        <div className="mt-3">
          <Badge
            variant="outline"
            className="bg-transparent border-green-300 text-green-700 text-xs font-medium"
          >
            Tax Inclusive
          </Badge>
        </div>
      )}
      {showPrice === false && (
        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
          <Info className="h-4 w-4" />
          Contact seller for pricing information
        </p>
      )}
    </div>
  );
}

