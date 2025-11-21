import type { CartItem } from "@/types/calculation/cart";
import { getAccounting } from "@/utils/calculation/salesCalculation/salesCalculation";
import some from "lodash/some";

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errorVariant?: "info" | "error" | "warning" | "success";
}

export interface RequestQuoteValidationParams {
  cart: CartItem[];
  selectedSellerPricing?: {
    hasProductsWithNegativeTotalPrice?: boolean;
    grandTotal?: number;
  };
  userId?: number | string | null;
  minimumQuoteValue?: string | number;
  isMinQuoteValueEnabled?: boolean;
  currency?: {
    currencyCode?: string;
    symbol?: string;
  };
  hasAccessPermission?: boolean; // MQUOTE_ECQ
}

export interface CreateOrderValidationParams {
  cart: CartItem[];
  selectedSellerPricing?: {
    hasProductsWithNegativeTotalPrice?: boolean;
    hasAllProductsAvailableInPriceList?: boolean;
    grandTotal?: number;
  };
  userId?: number | string | null;
  minimumOrderValue?: string | number;
  isMinOrderValueEnabled?: boolean;
  currency?: {
    currencyCode?: string;
    symbol?: string;
  };
  futureStock?: boolean;
  hasAccessPermission?: boolean; // MORDER_EPO
  buyerActive?: boolean; // For seller-fe scenarios
}

const NEGATIVE_VALUE_MSG =
  "Cart contains items with negative prices. Please remove them to proceed.";

/**
 * Check if cart has replacement products
 */
export function checkReplacementProducts(cart: CartItem[]): boolean {
  return some(cart, item => item.replacement === true);
}

/**
 * Check if cart has out-of-stock items
 */
export function checkInventoryStock(
  cart: CartItem[],
  futureStock?: boolean
): boolean {
  if (futureStock) {
    return false; // Future stock enabled, so no error
  }
  return some(cart, item => {
    const inventoryResponse = (item as any).inventoryResponse;
    return inventoryResponse?.inStock === false;
  });
}

/**
 * Check if all products have prices available
 */
export function checkPriceAvailability(cart: CartItem[]): boolean {
  return !some(cart, item => item.showPrice === false);
}

/**
 * Check minimum value requirement
 */
export function checkMinimumValue(
  minimumValue: string | number | undefined,
  isEnabled: boolean | undefined,
  cartTotal: number | undefined,
  currency?: {
    currencyCode?: string;
    symbol?: string;
  },
  isOrder: boolean = true
): ValidationResult {
  if (!isEnabled || !minimumValue || !cartTotal) {
    return { isValid: true };
  }

  const minValue =
    typeof minimumValue === "string" ? parseFloat(minimumValue) : minimumValue;

  if (minValue > cartTotal) {
    const valueType = isOrder ? "order" : "quote";
    // Format the minimum value using accounting format if currency is provided
    // This matches buyer-fe behavior: getAccounting(currency, minimumOrderValue, currency)
    // getAccounting handles partial currency objects and has defaults
    const formattedValue = currency
      ? getAccounting(currency as any, minValue, currency as any)
      : minValue.toFixed(2);
    return {
      isValid: false,
      errorMessage: `Minimum ${valueType} value ${formattedValue}`,
      errorVariant: "info",
    };
  }

  return { isValid: true };
}

/**
 * Validate request quote conditions
 */
export function validateRequestQuote(
  params: RequestQuoteValidationParams
): ValidationResult {
  const {
    cart,
    selectedSellerPricing,
    userId,
    minimumQuoteValue,
    isMinQuoteValueEnabled,
    currency,
    hasAccessPermission = true, // Default to true if not provided (for buyer-fe)
  } = params;

  // 1. Check user authentication
  if (!userId) {
    return {
      isValid: false,
      errorMessage: "Please login to continue",
      errorVariant: "info",
    };
  }

  // 2. Check access permission (for seller-fe)
  if (hasAccessPermission === false) {
    return {
      isValid: false,
      errorMessage: "You don't have permission to request quotes",
      errorVariant: "error",
    };
  }

  // 3. Check negative prices
  if (selectedSellerPricing?.hasProductsWithNegativeTotalPrice) {
    return {
      isValid: false,
      errorMessage: NEGATIVE_VALUE_MSG,
      errorVariant: "info",
    };
  }

  // 4. Check replacement products
  if (checkReplacementProducts(cart)) {
    return {
      isValid: false,
      errorMessage: "Few products are unavailable, try replacing items",
      errorVariant: "info",
    };
  }

  // 5. Check minimum quote value
  const minValueCheck = checkMinimumValue(
    minimumQuoteValue,
    isMinQuoteValueEnabled,
    selectedSellerPricing?.grandTotal,
    currency,
    false
  );
  if (!minValueCheck.isValid) {
    return minValueCheck;
  }

  return { isValid: true };
}

/**
 * Validate create order conditions
 */
export function validateCreateOrder(
  params: CreateOrderValidationParams
): ValidationResult {
  const {
    cart,
    selectedSellerPricing,
    userId,
    minimumOrderValue,
    isMinOrderValueEnabled,
    currency,
    futureStock,
    hasAccessPermission = true, // Default to true if not provided (for buyer-fe)
    buyerActive = true, // Default to true if not provided (for buyer-fe)
  } = params;

  // 1. Check user authentication
  if (!userId) {
    return {
      isValid: false,
      errorMessage: "Please login to continue",
      errorVariant: "info",
    };
  }

  // 2. Check access permission (for seller-fe)
  if (hasAccessPermission === false) {
    return {
      isValid: false,
      errorMessage: "You don't have permission to create orders",
      errorVariant: "error",
    };
  }

  // 3. Check buyer active status (for seller-fe)
  if (buyerActive === false) {
    return {
      isValid: false,
      errorMessage: "Deactivated buyer only allowed to raise a quote",
      errorVariant: "info",
    };
  }

  // 4. Check negative prices
  if (selectedSellerPricing?.hasProductsWithNegativeTotalPrice) {
    return {
      isValid: false,
      errorMessage: NEGATIVE_VALUE_MSG,
      errorVariant: "info",
    };
  }

  // 5. Check replacement products
  if (checkReplacementProducts(cart)) {
    return {
      isValid: false,
      errorMessage: "Few products are unavailable, try replacing items",
      errorVariant: "info",
    };
  }

  // 6. Check price availability
  const hasAllPrices = checkPriceAvailability(cart);
  const hasAllProductsInPriceList =
    selectedSellerPricing?.hasAllProductsAvailableInPriceList !== false;

  if (!hasAllPrices || !hasAllProductsInPriceList) {
    return {
      isValid: false,
      errorMessage:
        "Cart contains product(s) with price(s) unknown, ask for quote instead",
      errorVariant: "info",
    };
  }

  // 7. Check inventory stock
  if (checkInventoryStock(cart, futureStock)) {
    return {
      isValid: false,
      errorMessage: "Remove out of stock product(s) to place order",
      errorVariant: "info",
    };
  }

  // 8. Check minimum order value
  const minValueCheck = checkMinimumValue(
    minimumOrderValue,
    isMinOrderValueEnabled,
    selectedSellerPricing?.grandTotal,
    currency,
    true
  );
  if (!minValueCheck.isValid) {
    return minValueCheck;
  }

  return { isValid: true };
}
