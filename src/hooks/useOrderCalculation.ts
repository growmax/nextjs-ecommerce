/**
 * useOrderCalculation Hook
 *
 * A comprehensive calculation hook for order editing functionality.
 * Pass in your service data, get back fully calculated order data.
 *
 * Usage:
 * ```tsx
 * const { calculatedData, isCalculating, recalculate } = useOrderCalculation({
 *   products: orderData.products,
 *   isInter: orderData.isInter,
 *   taxExemption: orderData.taxExemption,
 *   settings: calculationSettings,
 *   options: { applyVolumeDiscount: true }
 * });
 * ```
 */

import cloneDeep from "lodash/cloneDeep";
import round from "lodash/round";
import { useCallback, useMemo } from "react";

import type {
  CalculationSettings,
  CartItem,
  CartValue,
} from "@/types/calculation/cart";
import type { VolumeDiscountData } from "@/types/calculation/discount";

import { calculateCart } from "@/utils/calculation/cart-calculation";
import { getSuitableDiscountByQuantity } from "@/utils/calculation/discountCalculation";
import { handleBundleProductsLogic } from "@/utils/calculation/product-utils";
import { calculateVolumeDiscount } from "@/utils/calculation/volume-discount-calculation";

// ============================================================================
// TYPES
// ============================================================================

export interface OrderCalculationInput {
  products: CartItem[];
  isInter?: boolean;
  taxExemption?: boolean;
  insuranceCharges?: number;
  shippingCharges?: number;
  pfRate?: number;
  currencyFactor?: number;
  precision?: number;
  settings: CalculationSettings;
  options?: CalculationOptions;
}

export interface CalculationOptions {
  applyVolumeDiscount?: boolean;
  applyCashDiscount?: boolean;
  applyBasicDiscount?: boolean;
  handleBundles?: boolean;
  checkMOQ?: boolean;
  applyRounding?: boolean;
  resetShipping?: boolean;
  resetDiscounts?: boolean;
}

export interface OrderCalculationResult {
  products: CartItem[];
  cartValue: CartValue;
  breakup: TaxBreakup;
  warnings: CalculationWarning[];
  metadata: CalculationMetadata;
}

export interface TaxBreakup {
  [taxName: string]: number;
}

export interface CalculationWarning {
  type: "moq" | "pricing" | "discount" | "tax" | "negative_price";
  productId: string | number;
  message: string;
}

export interface CalculationMetadata {
  totalProducts: number;
  productsWithPrice: number;
  productsWithoutPrice: number;
  hasVolumeDiscount: boolean;
  hasCashDiscount: boolean;
  hasNegativePrices: boolean;
  calculationTimestamp: number;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useOrderCalculation(input: OrderCalculationInput) {
  const {
    products,
    isInter = true,
    taxExemption: _taxExemption = false,
    insuranceCharges = 0,
    shippingCharges = 0,
    pfRate = 0,
    precision = 2,
    settings,
    options = {},
  } = input;

  // ============================================================================
  // CALCULATION LOGIC
  // ============================================================================

  const calculatedData = useMemo<OrderCalculationResult>(() => {
    const startTime = Date.now();
    const warnings: CalculationWarning[] = [];

    // Default options - moved inside useMemo to avoid dependency issues
    const calculationOptions: Required<CalculationOptions> = {
      applyVolumeDiscount: options.applyVolumeDiscount ?? true,
      applyCashDiscount: options.applyCashDiscount ?? true,
      applyBasicDiscount: options.applyBasicDiscount ?? true,
      handleBundles: options.handleBundles ?? true,
      checkMOQ: options.checkMOQ ?? true,
      applyRounding: options.applyRounding ?? true,
      resetShipping: options.resetShipping ?? false,
      resetDiscounts: options.resetDiscounts ?? false,
    };

    // Ensure products is always an array
    if (!Array.isArray(products) || products.length === 0) {
      return {
        products: [],
        cartValue: {
          totalItems: 0,
          totalLP: 0,
          totalBasicDiscount: 0,
          totalCashDiscount: 0,
          cashDiscountValue: 0,
          totalValue: 0,
          totalTax: 0,
          totalShipping: 0,
          pfRate: 0,
          taxableAmount: 0,
          grandTotal: 0,
          hideListPricePublic: false,
        },
        breakup: {},
        warnings: [],
        metadata: {
          totalProducts: 0,
          productsWithPrice: 0,
          productsWithoutPrice: 0,
          hasVolumeDiscount: false,
          hasCashDiscount: false,
          hasNegativePrices: false,
          calculationTimestamp: startTime,
        },
      };
    }

    // Step 1: Clone products to avoid mutation
    let processedProducts = cloneDeep(products);

    // Ensure processedProducts is still an array after cloneDeep
    if (!Array.isArray(processedProducts)) {
      processedProducts = [];
    }

    // Step 2: Reset fields if needed (for edit/reorder scenarios)
    if (calculationOptions.resetShipping || calculationOptions.resetDiscounts) {
      processedProducts = resetProductFields(
        processedProducts,
        calculationOptions.resetShipping,
        calculationOptions.resetDiscounts
      );
    }

    // Step 3: Handle bundles
    if (calculationOptions.handleBundles) {
      processedProducts = processedProducts.map(product =>
        handleBundleProductsLogic(product)
      );
    }

    // Step 4: Apply discounts (basic, quantity-based, cash)
    processedProducts = processedProducts.map(product => {
      const updatedProduct = { ...product };

      // Initialize prices
      if (!updatedProduct.unitPrice && updatedProduct.BasePrice) {
        updatedProduct.unitPrice = updatedProduct.BasePrice;
      }

      // Check MOQ
      if (calculationOptions.checkMOQ && updatedProduct.minOrderQuantity) {
        if (updatedProduct.quantity < updatedProduct.minOrderQuantity) {
          warnings.push({
            type: "moq",
            productId: updatedProduct.productId,
            message: `Quantity ${updatedProduct.quantity} is below minimum order quantity ${updatedProduct.minOrderQuantity}`,
          });
        }
      }

      // Apply discount based on quantity
      if (
        updatedProduct.disc_prd_related_obj?.discounts &&
        calculationOptions.applyBasicDiscount
      ) {
        const { suitableDiscount, nextSuitableDiscount } =
          getSuitableDiscountByQuantity(
            updatedProduct.quantity,
            updatedProduct.disc_prd_related_obj.discounts,
            0
          );

        if (suitableDiscount) {
          updatedProduct.discount = suitableDiscount.Value;
          updatedProduct.discountPercentage = suitableDiscount.Value;
          updatedProduct.appliedDiscount = suitableDiscount.Value;
          updatedProduct.CantCombineWithOtherDisCounts =
            suitableDiscount.CantCombineWithOtherDisCounts ?? false;
          updatedProduct.pricingConditionCode =
            suitableDiscount.pricingConditionCode ?? null;
        }

        if (nextSuitableDiscount) {
          updatedProduct.nextSuitableDiscount = nextSuitableDiscount;
        }
      }

      // Calculate discounted price
      if (updatedProduct.discount && updatedProduct.unitListPrice) {
        updatedProduct.unitPrice = round(
          updatedProduct.unitListPrice * (1 - updatedProduct.discount / 100),
          precision
        );
      }

      // Apply cash discount if enabled
      if (
        calculationOptions.applyCashDiscount &&
        updatedProduct.cashdiscountValue
      ) {
        if (!updatedProduct.originalUnitPrice) {
          updatedProduct.originalUnitPrice = updatedProduct.unitPrice;
        }
        updatedProduct.unitPrice = round(
          updatedProduct.originalUnitPrice *
            (1 - updatedProduct.cashdiscountValue / 100),
          precision
        );
      }

      // Check for pricing issues
      if (!updatedProduct.unitPrice || updatedProduct.priceNotAvailable) {
        warnings.push({
          type: "pricing",
          productId: updatedProduct.productId,
          message: "Price not available for this product",
        });
      }

      // Check for negative prices
      if (updatedProduct.unitPrice < 0) {
        warnings.push({
          type: "negative_price",
          productId: updatedProduct.productId,
          message: "Product has negative price after discounts",
        });
      }

      return updatedProduct;
    });

    // Step 5: Apply PF (Packaging & Forwarding) rate
    if (pfRate > 0) {
      processedProducts = processedProducts.map(product => ({
        ...product,
        pfItemValue: pfRate,
      }));
    }

    // Step 6: Calculate cart totals
    const { cartValue, processedItems } = calculateCart({
      cartData: processedProducts,
      isInter,
      insuranceCharges,
      precision,
      settings: {
        ...settings,
        roundingAdjustment: calculationOptions.applyRounding,
      },
    });

    processedProducts = processedItems;

    // Step 7: Apply volume discount if enabled
    let finalCartValue = cartValue;
    if (calculationOptions.applyVolumeDiscount) {
      // Check if any product has volume discount data
      const hasVolumeDiscount = processedProducts.some(
        p => p.volumeDiscountApplied || p.volumeDiscount
      );

      if (hasVolumeDiscount) {
        const volumeDiscountData: VolumeDiscountData[] = processedProducts
          .filter(p => p.itemNo && p.volumeDiscount)
          .map(p => ({
            itemNo: p.itemNo!,
            volumeDiscount: p.volumeDiscount!,
            appliedDiscount: p.appliedDiscount || 0,
          }));

        if (volumeDiscountData.length > 0) {
          // Calculate subtotal and overall shipping for volume discount
          const subTotal = cartValue.totalValue || 0;
          const overallShipping = cartValue.totalShipping || 0;

          const volumeResult = calculateVolumeDiscount(
            isInter,
            processedProducts,
            volumeDiscountData,
            subTotal,
            overallShipping,
            settings,
            false, // beforeTax
            0, // beforeTaxPercentage
            precision
          );

          if (volumeResult) {
            processedProducts = volumeResult.products;
            // Update cart value with volume discount results
            finalCartValue = {
              ...cartValue,
              totalValue: volumeResult.vdDetails.subTotal,
              grandTotal: volumeResult.vdDetails.grandTotal,
              taxableAmount: volumeResult.vdDetails.taxableAmount,
              totalTax: volumeResult.vdDetails.overallTax,
            };
          }
        }
      }
    }

    // Step 8: Add shipping charges
    if (shippingCharges > 0) {
      finalCartValue.totalShipping = round(
        finalCartValue.totalShipping + shippingCharges,
        precision
      );
      finalCartValue.grandTotal = round(
        finalCartValue.grandTotal + shippingCharges,
        precision
      );
    }

    // Step 9: Extract tax breakup
    const breakup = extractTaxBreakup(finalCartValue);

    // Step 10: Calculate metadata
    const metadata: CalculationMetadata = {
      totalProducts: processedProducts.length,
      productsWithPrice: processedProducts.filter(p => p.unitPrice > 0).length,
      productsWithoutPrice: processedProducts.filter(
        p => !p.unitPrice || p.priceNotAvailable
      ).length,
      hasVolumeDiscount: processedProducts.some(p => p.volumeDiscountApplied),
      hasCashDiscount: processedProducts.some(
        p => p.cashdiscountValue && p.cashdiscountValue > 0
      ),
      hasNegativePrices:
        finalCartValue.hasProductsWithNegativeTotalPrice || false,
      calculationTimestamp: Date.now(),
    };

    return {
      products: processedProducts,
      cartValue: finalCartValue,
      breakup,
      warnings,
      metadata,
    };
  }, [
    products,
    isInter,
    insuranceCharges,
    shippingCharges,
    pfRate,
    precision,
    settings,
    options,
  ]);

  // ============================================================================
  // RECALCULATE FUNCTION (Manual trigger)
  // ============================================================================

  const recalculate = useCallback(() => {
    // Since we're using useMemo, changing deps will trigger recalc
    // This is a placeholder for manual recalculation if needed
    return calculatedData;
  }, [calculatedData]);

  return {
    calculatedData,
    isCalculating: false, // Can be extended with loading state
    recalculate,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Reset product fields for edit/reorder scenarios
 */
function resetProductFields(
  products: CartItem[],
  resetShipping: boolean,
  resetDiscounts: boolean
): CartItem[] {
  return products.map(product => {
    const updated = { ...product };

    if (resetShipping) {
      updated.shippingCharges = 0;
    }

    if (resetDiscounts) {
      updated.cashdiscountValue = 0;
      updated.cashDiscountedPrice = 0;
      updated.discount = 0;
      updated.discountPercentage = 0;
      updated.originalUnitPrice = 0;
    }

    return updated;
  });
}

/**
 * Extract tax breakup from cart value
 */
function extractTaxBreakup(cartValue: CartValue): TaxBreakup {
  const breakup: TaxBreakup = {};

  Object.keys(cartValue).forEach(key => {
    if (key.endsWith("Total") && typeof cartValue[key] === "number") {
      const taxName = key.replace("Total", "");
      breakup[taxName] = cartValue[key] as number;
    }
  });

  return breakup;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useOrderCalculation;
