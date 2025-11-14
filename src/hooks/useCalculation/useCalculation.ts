import { useMemo } from "react";
import cloneDeep from "lodash/cloneDeep";
import {
  cartCalculation,
  discountDetails,
} from "@/utils/calculation/cartCalculation";
import { calculateShippingTax } from "@/utils/calculation/tax-breakdown";

interface CalculationParams {
  products: any[];
  isInter: boolean;
  taxExemption?: boolean;
  insuranceCharges?: number;
  precision?: number;
  Settings?: any;
  isSeller?: boolean;
  overallShipping?: number;
  isBeforeTax?: boolean;
}

interface CalculationResult {
  cartValue: any;
  products: any[];
  breakup?: any[];
}

/**
 * Hook for calculating cart values, taxes, and totals
 */
export function useCalculation() {
  /**
   * Main calculation function that processes products and returns cart values
   */
  const globalCalc = useMemo(
    () =>
      (params: CalculationParams): CalculationResult => {
        const {
          products,
          isInter = true,
          taxExemption = false,
          insuranceCharges = 0,
          precision = 2,
          Settings = {},
          isSeller = false,
          overallShipping = 0,
          isBeforeTax = false,
        } = params;

        if (!products || products.length === 0) {
          return {
            cartValue: {
              totalItems: 0,
              totalLP: 0,
              totalValue: 0,
              totalTax: 0,
              totalShipping: 0,
              pfRate: 0,
              taxableAmount: 0,
              grandTotal: 0,
            },
            products: [],
            breakup: [],
          };
        }

        try {
          // Clone products to avoid mutation
          const clonedProducts = cloneDeep(products);

          // Normalize products
          const normalizedProducts = clonedProducts.map((product: any) => ({
            ...product,
            quantity: product.quantity || product.askedQuantity || 1,
            askedQuantity: product.quantity || product.askedQuantity || 1,
            unitPrice: product.unitPrice || product.discountedPrice || 0,
            unitListPrice: product.unitListPrice || product.unitLP || 0,
            discount: product.discount || product.discountPercentage || 0,
            discountPercentage:
              product.discount || product.discountPercentage || 0,
            pfItemValue: product.pfItemValue || product.pfPercentage || 0,
            shippingCharges: product.shippingCharges || 0,
            cashdiscountValue: product.cashdiscountValue || 0,
            showPrice:
              product.showPrice !== undefined ? product.showPrice : true,
            priceNotAvailable: product.priceNotAvailable || false,
          }));

          // Apply discount details
          const processedProducts = discountDetails(
            normalizedProducts,
            isSeller,
            taxExemption,
            precision
          );

          // Calculate cart totals
          const calculatedValue = cartCalculation(
            processedProducts,
            isInter,
            insuranceCharges,
            precision,
            Settings
          );

          // Check if products have hsnDetails for tax calculation
          const hasHsnDetails = processedProducts.some(
            (p: any) =>
              p.hsnDetails && (p.hsnDetails.interTax || p.hsnDetails.intraTax)
          );

          if (hasHsnDetails) {
            try {
              const shippingTaxResult = calculateShippingTax(
                overallShipping || calculatedValue.totalShipping || 0,
                calculatedValue,
                processedProducts,
                isBeforeTax,
                isInter,
                precision,
                false
              );

              return {
                cartValue: shippingTaxResult.cartValue,
                products: shippingTaxResult.products,
                breakup: shippingTaxResult.breakup,
              };
            } catch (error) {
              console.error("Error calculating shipping tax:", error);
              return {
                cartValue: calculatedValue,
                products: processedProducts,
                breakup: [],
              };
            }
          }

          return {
            cartValue: calculatedValue,
            products: processedProducts,
            breakup: [],
          };
        } catch (error) {
          console.error("Error in globalCalc:", error);
          return {
            cartValue: {
              totalItems: products.length,
              totalLP: 0,
              totalValue: 0,
              totalTax: 0,
              totalShipping: overallShipping,
              pfRate: 0,
              taxableAmount: 0,
              grandTotal: 0,
            },
            products,
            breakup: [],
          };
        }
      },
    []
  );

  return {
    globalCalc,
  };
}
