import type { CartItem } from "@/types/calculation/cart";
import { round } from "lodash";

interface ProductDiscountsData {
  MasterPrice?: number | null;
  BasePrice?: number | null;
  isProductAvailableInPriceList?: boolean;
  isOveridePricelist?: boolean;
}

interface GetProductPricingResult {
  final_Price: number;
  discounted_Price: number | undefined;
  discount_Percentage: number | undefined;
  final_listing_price: number;
  isPriceNotAvailable: boolean;
}

/**
 * Calculate product pricing with discounts and tax handling
 * Adapted from buyer-fe pricing logic
 *
 * @param productData - Cart item with discount details
 * @param productDiscountsData - Discount data from API
 * @param taxExempted - Whether user is tax exempted
 * @returns Pricing calculation result
 */
export function getProductPricing(
  productData: CartItem = {} as CartItem,
  productDiscountsData: ProductDiscountsData = {},
  taxExempted: boolean = false
): GetProductPricingResult {
  const { discount, discountPercentage, hsnDetails, taxInclusive } =
    productData;

  // Check if price is available
  const isPriceNotAvailable =
    productDiscountsData.MasterPrice === null ||
    productDiscountsData.BasePrice === null ||
    !productDiscountsData.isProductAvailableInPriceList;

  const MASTER_PRICE = productDiscountsData.MasterPrice ?? 0;
  const BASE_PRICE = productDiscountsData.BasePrice ?? 0;

  // Handle tax-inclusive pricing for tax-exempted users
  const adjustedBasePrice =
    taxInclusive && taxExempted && hsnDetails?.tax
      ? round(BASE_PRICE / (1 + parseFloat(String(hsnDetails.tax)) / 100), 2)
      : BASE_PRICE;

  let final_Price = adjustedBasePrice;
  let discounted_Price: number | undefined;
  let discount_Percentage: number | undefined;

  // Use discountPercentage or discount from productData
  const appliedDiscount = discountPercentage ?? discount ?? 0;

  // Calculate discount
  if (
    productDiscountsData.isOveridePricelist === false &&
    MASTER_PRICE !== adjustedBasePrice &&
    MASTER_PRICE > 0
  ) {
    // Calculate override discount (difference between Master and Base)
    const overrideDiscountPercent =
      ((MASTER_PRICE - adjustedBasePrice) / MASTER_PRICE) * 100;
    discount_Percentage = overrideDiscountPercent;

    // Add additional discount if available
    if (appliedDiscount > 0) {
      discount_Percentage = overrideDiscountPercent + appliedDiscount;
      discounted_Price =
        MASTER_PRICE - (MASTER_PRICE * discount_Percentage) / 100;
    } else {
      discounted_Price = adjustedBasePrice;
    }
    final_Price = MASTER_PRICE;
  } else {
    // Apply discount directly to base price
    if (appliedDiscount > 0) {
      discounted_Price =
        adjustedBasePrice - (adjustedBasePrice * appliedDiscount) / 100;
      discount_Percentage = appliedDiscount;
    }
  }

  return {
    final_Price,
    discounted_Price,
    discount_Percentage,
    final_listing_price: discounted_Price ?? final_Price,
    isPriceNotAvailable,
  };
}
