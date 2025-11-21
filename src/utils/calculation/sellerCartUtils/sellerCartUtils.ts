import { find, groupBy } from "lodash";
import { cartCalculation, VolumeDiscountCalculation } from "../cartCalculation";
import { processDiscountDetails } from "../product-utils";

export const groupCartItemsBySeller = (cartItems: any, _debugMode = true) => {
  if (!cartItems || cartItems.length === 0) {
    return {};
  }

  const groupedItems = groupBy(cartItems, (item: any) => {
    // Group by sellerId, vendorId, or "no-seller" if neither exists
    const groupKey = item.sellerId || item.vendorId || "no-seller";
    return groupKey;
  });

  const sellerCarts: any = {};

  Object.keys(groupedItems).forEach(groupKey => {
    const items = groupedItems[groupKey] || [];
    const firstItem = items[0];
    // Create seller information from cart item data
    const sellerInfo = {
      id: groupKey,
      sellerId: firstItem.sellerId,
      name: firstItem.sellerName || firstItem.vendorName || "Unknown Seller",
      location:
        firstItem.sellerLocation ||
        firstItem.vendorLocation ||
        "Location not specified",
    };
    sellerCarts[groupKey] = {
      seller: sellerInfo,
      items,
      itemCount: items.length,
      totalQuantity: items.reduce(
        (sum: any, item: any) => sum + (item.quantity || 0),
        0
      ),
    };
  });
  return sellerCarts;
};

/**
 * Calculates price details for a specific seller's cart
 * @param {Array} sellerItems - Cart items for a specific seller
 * @param {boolean} isInter - Inter-state tax calculation
 * @param {number} insuranceCharges - Insurance charges
 * @param {number} precision - Decimal precision
 * @param {object} Settings - Settings object
 * @param {boolean} isSeller - Is seller flag
 * @param {boolean} taxExemption - Tax exemption flag
 * @returns {object} - Calculated price details for seller
 */
export const calculateSellerCartPricing = (
  sellerItems: any,
  isInter = true,
  insuranceCharges = 0,
  precision = 2,
  Settings: any = {},
  _isSeller = false,
  taxExemption = false
) => {
  if (!sellerItems || sellerItems.length === 0) {
    return {
      pricing: {
        totalItems: 0,
        totalValue: 0,
        totalTax: 0,
        grandTotal: 0,
        totalLP: 0,
        pfRate: 0,
        totalShipping: 0,
        hideListPricePublic: false,
        hasProductsWithNegativeTotalPrice: false,
        hasAllProductsAvailableInPriceList: true,
      },
      processedItems: [],
    };
  }

  // Apply discount details processing
  // Use processDiscountDetails (TypeScript version) instead of discountDetails (JS version)
  const processedItems = processDiscountDetails(
    sellerItems,
    taxExemption,
    precision
  );

  // Calculate cart totals using existing calculation function
  const calculatedPricing = cartCalculation(
    processedItems,
    isInter,
    insuranceCharges,
    precision,
    Settings
  );

  return {
    pricing: calculatedPricing,
    processedItems,
  };
};

/**
 * Calculates pricing for all seller carts
 * @param {object} sellerCarts - Object containing seller carts
 * @param {object} calculationParams - Parameters for calculation
 * @returns {object} - Seller carts with calculated pricing
 */
export const calculateAllSellerCartPricing = (
  sellerCarts: any,
  calculationParams: any = {}
) => {
  const {
    isInter = true,
    insuranceCharges = 0,
    precision = 2,
    Settings = {},
    isSeller: _isSellerParam = false,
    taxExemption = false,
  } = calculationParams;

  const sellerCartsWithPricing: any = {};

  Object.keys(sellerCarts).forEach((sellerId: any) => {
    const sellerCart = sellerCarts[sellerId];
    const { pricing, processedItems } = calculateSellerCartPricing(
      sellerCart.items,
      isInter,
      insuranceCharges,
      precision,
      Settings,
      _isSellerParam,
      taxExemption
    );

    sellerCartsWithPricing[sellerId] = {
      ...sellerCart,
      items: processedItems, // Use processed items with unitPrice calculated
      pricing,
    };
  });

  return sellerCartsWithPricing;
};

/**
 * Gets the total summary across all sellers
 * @param {object} sellerCartsWithPricing - Seller carts with pricing
 * @returns {object} - Overall summary
 */
export const getOverallCartSummary = (sellerCartsWithPricing: any) => {
  const sellerIds = Object.keys(sellerCartsWithPricing);

  if (sellerIds.length === 0) {
    return {
      totalSellers: 0,
      totalItems: 0,
      totalValue: 0,
      totalTax: 0,
      grandTotal: 0,
    };
  }

  const summary = sellerIds.reduce(
    (acc, sellerId) => {
      const sellerCart = sellerCartsWithPricing[sellerId];
      const { pricing } = sellerCart;

      acc.totalItems += pricing.totalItems;
      acc.totalValue += pricing.totalValue;
      acc.totalTax += pricing.totalTax;
      acc.grandTotal += pricing.grandTotal;

      return acc;
    },
    {
      totalSellers: sellerIds.length,
      totalItems: 0,
      totalValue: 0,
      totalTax: 0,
      grandTotal: 0,
    }
  );

  return summary;
};

/**
 * Gets mock seller data for testing purposes
 * @param {string} sellerId - Seller ID
 * @returns {object} - Mock seller data
 */

export const getMockSellerData = (sellerId: any) => {
  const mockSellers: any = {
    "seller-1": {
      id: "seller-1",
      name: "Vashi Electricals",
      location: "Mumbai, Maharashtra",
      rating: 4.8,
      reviewCount: 156,
      isVerified: true,
      deliveryDays: "3-5 days",
      shippingType: "Free shipping",
    },
    "seller-2": {
      id: "seller-2",
      name: "Deekay Electricals",
      location: "Chennai, Tamil Nadu",
      rating: 4.6,
      reviewCount: 89,
      isVerified: true,
      deliveryDays: "2-4 days",
      shippingType: "Express available",
    },
    "seller-3": {
      id: "seller-3",
      name: "PowerTech Solutions",
      location: "Delhi, NCR",
      rating: 4.5,
      reviewCount: 234,
      isVerified: true,
      deliveryDays: "5-7 days",
      shippingType: "Standard shipping",
    },
  };

  return (
    (mockSellers as any)[sellerId] || {
      id: sellerId,
      name: "Unknown Seller",
      location: "Location not specified",
      rating: 4.0,
      reviewCount: 0,
      isVerified: false,
      deliveryDays: "3-5 days",
      shippingType: "Standard shipping",
    }
  );
};

/**
 * Handles volume discount calculations for seller carts
 * @param {object} sellerCarts - Seller carts with items
 * @param {object} volumeDiscountData - Volume discount data
 * @param {object} calculationParams - Calculation parameters
 * @returns {object} - Seller carts with volume discount applied
 */

export const applyVolumeDiscountsToSellerCarts = (
  sellerCarts: any,
  volumeDiscountData: any = {},
  calculationParams: any = {}
) => {
  const {
    isInter = true,
    precision = 2,
    Settings = {},
    beforeTax = false,
    beforeTaxPercentage = 0,
  } = calculationParams;

  const sellerCartsWithVD: any = {};

  Object.keys(sellerCarts).forEach(sellerId => {
    const sellerCart = sellerCarts[sellerId];
    const sellerVDData = volumeDiscountData[sellerId] || [];

    if (sellerVDData.length > 0) {
      // Calculate subtotal for this seller
      const subTotal = sellerCart.items.reduce(
        (sum: number, item: any) => sum + (item.totalPrice || 0),
        0
      );
      const overallShipping = sellerCart.items.reduce(
        (sum: number, item: any) => sum + (item.shippingCharges || 0),
        0
      );

      // Apply volume discount calculation
      const vdResult = VolumeDiscountCalculation(
        isInter,
        sellerCart.items,
        sellerVDData,
        subTotal,
        overallShipping,
        Settings,
        beforeTax,
        beforeTaxPercentage,
        precision
      );

      sellerCartsWithVD[sellerId] = {
        ...sellerCart,
        items: vdResult.products,
        volumeDiscountDetails: vdResult.vdDetails,
        pfRate: vdResult.pfRate,
      };
    } else {
      sellerCartsWithVD[sellerId] = sellerCart;
    }
  });

  return sellerCartsWithVD;
};

/**
 * Finds the best matching pricing data for a product from discount service
 * @param {object} item - Cart item
 * @param {object} sellerPricingData - Seller-specific pricing data from discount service
 * @returns {object | null} - Best matching pricing data or null
 */

export const findBestPricingMatch = (item: any, sellerPricingData: any) => {
  const productId = item.productId;
  const sellerId = item.sellerId;
  const vendorId = item.vendorId;

  const sellerIdentifiers = [sellerId, vendorId].filter(Boolean);

  // Find seller-specific pricing (by sellerId or vendorId)
  for (const identifier of sellerIdentifiers) {
    if (sellerPricingData && sellerPricingData[identifier]) {
      const specificPricing = find(
        sellerPricingData[identifier],
        price => String(price.ProductVariantId) === String(productId)
      );
      if (specificPricing) {
        return {
          ...specificPricing,
          pricingSource: "seller-specific",
          matchedSellerId: identifier,
        };
      }
    }
  }

  // If no seller-specific pricing found, try "no-seller-id" group
  if (sellerPricingData && sellerPricingData["no-seller-id"]) {
    const noSellerPricing = find(
      sellerPricingData["no-seller-id"],
      price => String(price.ProductVariantId) === String(productId)
    );
    if (noSellerPricing) {
      return {
        ...noSellerPricing,
        pricingSource: "no-seller-id",
        matchedSellerId: "no-seller-id",
      };
    }
  }

  return null;
};

/**
 * Merges seller-specific pricing data
 * @param {object} sellerPricingData - Seller-specific pricing from discount service
 * @returns {object} - Pricing data (no merging needed as all data comes from discount service)
 * @deprecated This function is no longer needed as all pricing comes from discount service
 */

export const mergeSellerPricing = (sellerPricingData: any) => {
  // All pricing data comes from discount service, so no merging is needed
  return { ...sellerPricingData };
};

/**
 * Checks if an item has valid pricing data
 * @param {object} pricingData - Pricing data object
 * @returns {boolean} - True if pricing is valid
 */

export const isValidPricing = (pricingData: any) => {
  return (
    pricingData &&
    (pricingData.MasterPrice !== null || pricingData.BasePrice !== null) &&
    !pricingData.priceNotAvailable
  );
};

/**
 * Gets pricing resolution summary for debugging
 * @param {object} sellerCarts - Seller carts with pricing
 * @returns {object} - Summary of pricing resolution
 */

export const getPricingResolutionSummary = (sellerCarts: any) => {
  const summary: any = {
    totalSellers: 0,
    totalProducts: 0,
    pricingBySources: {
      "seller-specific": 0,
      "no-seller-id": 0,
      "no-pricing": 0,
    },
    productsWithoutPricing: [],
  };

  Object.entries(sellerCarts).forEach(([sellerId, cart]: [string, any]) => {
    summary.totalSellers++;
    (cart as any).items?.forEach((item: any) => {
      summary.totalProducts++;

      if (item.pricingSource) {
        summary.pricingBySources[
          item.pricingSource as keyof typeof summary.pricingBySources
        ]++;
      } else if (item.priceNotAvailable) {
        summary.pricingBySources["no-pricing"]++;
        summary.productsWithoutPricing.push({
          productId: item.productId,
          productName: item.productName,
          sellerId,
        });
      }
    });
  });

  return summary;
};
