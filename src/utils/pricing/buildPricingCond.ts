import type { CartItem } from "@/types/calculation/cart";
import type { DiscountRange } from "@/types/calculation/discount";

interface BuildPricingCondResult {
  ShowRequestPrice: boolean;
  ShowBasePrice: boolean;
  ShowDiscount: boolean;
}

/**
 * Build pricing display conditions based on product data and discount
 * Adapted from buyer-fe getPriceInfo logic
 *
 * @param data - Cart item data
 * @param suitableDiscount - Selected discount range
 * @returns Conditions for what to display
 */
export function BuildPricingCond(
  data: CartItem,
  suitableDiscount?: DiscountRange
): BuildPricingCondResult {
  const { listPricePublic, showPrice, priceNotAvailable } = data || {};

  const isPriceNotAvailable = priceNotAvailable ?? false;

  const result: BuildPricingCondResult = {
    ShowRequestPrice: false,
    ShowBasePrice: false,
    ShowDiscount: false,
  };

  // Show discounted price and unit list price when showPrice and listPricePublic are true
  if (showPrice && listPricePublic && !isPriceNotAvailable) {
    result.ShowBasePrice = true;
    result.ShowDiscount = !!suitableDiscount;
  }

  // Show discounted price only when showPrice is true but listPricePublic is false
  if (showPrice && !listPricePublic && !isPriceNotAvailable) {
    result.ShowBasePrice = true;
  }

  // Show request price when showPrice is false
  if ((!showPrice && !listPricePublic) || (!showPrice && listPricePublic)) {
    result.ShowRequestPrice = true;
  }

  return result;
}

