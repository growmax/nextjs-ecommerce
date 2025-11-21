"use client";

import { assign_pricelist_discounts_data_to_products } from "@/utils/functionalUtils";
import { cartCalculation } from "@/utils/calculation/cartCalculation";
import { processDiscountDetails } from "@/utils/calculation/product-utils";
import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import map from "lodash/map";
import { useEffect, useMemo, useState } from "react";
import { useCart as useCartContext } from "@/contexts/CartContext";
import useProductDiscounts from "./useProductDiscounts";
import { useCurrentUser } from "./useCurrentUser";
import type { CartItem } from "@/types/calculation/cart";
import type { CartValue } from "@/types/calculation/cart";

/**
 * Hook that orchestrates the complete cart pricing calculation flow
 * Similar to buyer-fe/src/hooks/useCartPrice.js
 *
 * Flow:
 * 1. Fetch discount data for cart items
 * 2. Map discount data to cart items using assign_pricelist_discounts_data_to_products
 * 3. Apply processDiscountDetails to calculate discounted prices
 * 4. Call cartCalculation with processed items
 * 5. Return cartValue with calculated totals
 *
 * @param cart - Array of cart items (optional, defaults to cart from context)
 * @returns Object with cartValue containing calculated totals
 */
export default function useCartPrice(cart?: CartItem[]) {
  const { cart: contextCart, isLoading: cartLoading } = useCartContext();
  const { user, loading: companyLoading } = useCurrentUser();
  const [cartValue, setCartValue] = useState<CartValue | null>(null);
  const [processedItems, setProcessedItems] = useState<CartItem[]>([]);

  // Use provided cart or fallback to context cart
  // Memoize to prevent dependency issues
  const cartItems = useMemo(
    () => cart || contextCart || [],
    [cart, contextCart]
  );

  // Extract product IDs from cart items
  const productIds = useMemo(() => {
    return map(cloneDeep(cartItems), "productId");
  }, [cartItems]);

  // Fetch discount data for all products in cart
  const { discountdata, discountdataLoading } = useProductDiscounts(productIds);

  // Get tax exemption status from user
  const taxExempted = (user as any)?.taxExemption || false;

  useEffect(() => {
    if (
      !discountdataLoading &&
      discountdata?.length > 0 &&
      cartItems.length > 0 &&
      !cartLoading &&
      !companyLoading
    ) {
      try {
        let cartData = cloneDeep(cartItems);

        // Step 1: Map discount data to cart items
        cartData = map(cartData, item => {
          // Find discount data for this specific product
          const prd_wise_discData =
            find(
              discountdata || [],
              disc => disc["ProductVariantId"] === Number(item["productId"])
            ) || {};

          // Assign discount data to product using the same function as buyer-fe
          const enrichedItem = assign_pricelist_discounts_data_to_products(
            item,
            prd_wise_discData,
            true // updateDiscounts = true
          );

          return enrichedItem;
        });

        // Step 2: Apply discount details calculation (similar to discountDetails in buyer-fe)
        const cartCalc = processDiscountDetails(cartData, taxExempted, 2);

        // Step 3: Calculate final cart totals using cartCalculation
        const result = cartCalculation(
          cartCalc,
          true, // isInter
          0, // insuranceCharges
          2, // precision
          {
            roundingAdjustment: false,
            itemWiseShippingTax: false,
          } as any
        );

        setCartValue(result);
        setProcessedItems(cartCalc); // Store processed items with discount-calculated prices
      } catch (error) {
        console.error("Error calculating cart price:", error);
        setCartValue(null);
      }
    } else if (
      !discountdataLoading &&
      cartItems.length > 0 &&
      !cartLoading &&
      !companyLoading
    ) {
      // If no discount data but we have cart items, calculate with existing data
      try {
        const result = cartCalculation(cartItems, true, 0, 2, {
          roundingAdjustment: false,
          itemWiseShippingTax: false,
        } as any);
        setCartValue(result);
        setProcessedItems(cartItems); // Store items as-is if no discount data
      } catch (error) {
        console.error("Error calculating cart price (no discounts):", error);
        setCartValue(null);
        setProcessedItems([]);
      }
    }
  }, [
    discountdataLoading,
    cartLoading,
    cartItems,
    companyLoading,
    discountdata,
    taxExempted,
  ]);

  return {
    cartValue,
    processedItems, // Return processed items with discount-calculated prices
    isLoading: discountdataLoading || cartLoading || companyLoading,
  };
}
