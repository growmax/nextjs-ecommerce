"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { map, find, some } from "lodash";
import { assign_pricelist_discounts_data_to_products } from "@/utils/functionalUtils";
import { cartCalculation, discountDetails } from "@/utils/calculation/cartCalculation";
import useProductDiscounts from "@/hooks/useProductDiscounts";
import useCurrencyFactor from "./useCurrencyFactor";
import DiscountService from "@/lib/api/services/DiscountService/DiscountService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import { useQuery } from "@tanstack/react-query";
import useModuleSettings from "@/hooks/useModuleSettings";

/**
 * Simplified hook for fetching discounts and calculating cart values for summary pages
 * Reuses existing hooks (useProductDiscounts) instead of duplicating logic
 * 
 * Migrated from buyer-fe/src/components/Summary/hooks/useMultipeDiscounts.js
 * 
 * @param cart - Array of cart items
 * @param pfRate - Package forwarding rate
 * @param isInter - Whether transaction is inter-state
 * @param defaultpreference - Default preferences object
 * @param sellerId - Optional seller ID for seller-specific pricing validation
 * @returns Cart value, enriched products, loading state, and approval requirement
 */
export default function useMultipleDiscount(
  cart: any[] = [],
  pfRate: number = 0,
  isInter: boolean = false,
  _defaultpreference: any = {},
  sellerId: number | string | null = null
) {
  const [cartValue, setCartValue] = useState<any>({});
  const calculationRef = useRef(false);
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();
  const { quoteSettings } = useModuleSettings(user);
  const { CurrencyFactor } = useCurrencyFactor();

  const taxExempted = (user as any)?.taxExemption || false;
  const currency = (user as any)?.currency;
  const sellerCurrency = tenantData?.sellerCurrency;
  const companyId = user?.companyId;

  // Extract product IDs
  const productIds = useMemo(() => map(cart, "productId"), [cart]);

  // Reuse existing useProductDiscounts hook instead of manual API call
  const { discountdata, discountdataLoading } = useProductDiscounts(productIds);

  // Optionally fetch getAllSellerPrices only if sellerId is provided (for validation)
  const { data: allSellerPricesData } = useQuery({
    queryKey: ["getAllSellerPrices", productIds, sellerId],
    queryFn: async () => {
      if (!sellerId || !productIds.length || !companyId) {
        return null;
      }

      try {
        return await DiscountService.getAllSellerPrices({
          Productid: productIds.map(id => Number(id)),
          CurrencyId: currency?.id || sellerCurrency?.id || 0,
          BaseCurrencyId: sellerCurrency?.id || 0,
          CompanyId: companyId,
        });
      } catch {
        return null;
      }
    },
    enabled: !!sellerId && productIds.length > 0 && !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Group getAllSellerPrices by sellerId for validation
  const allSellerPricesBySeller = useMemo(() => {
    const allSellerData = allSellerPricesData?.data || [];
    const grouped: Record<string, any[]> = {};
    allSellerData.forEach((item: any) => {
      const itemSellerId = item.sellerId || item.vendorId;
      if (itemSellerId) {
        if (!grouped[itemSellerId]) {
          grouped[itemSellerId] = [];
        }
        grouped[itemSellerId].push(item);
      }
    });
    return grouped;
  }, [allSellerPricesData?.data]);

  // Process cart items with discount data
  useEffect(() => {
    if (
      !discountdataLoading &&
      discountdata?.length > 0 &&
      cart?.length > 0 &&
      CurrencyFactor !== undefined
    ) {
      try {
        const cart1 = map(cart || [], (item) => {
          // Set pfItemValue from pfRate
          item.pfItemValue = pfRate;
          item.volumeDiscountApplied = false;

          // Get the pricing data
          let prd_wise_discData =
            find(
              discountdata,
              (disc) => disc["ProductVariantId"] === item["productId"]
            ) || {};

          // Validate if the discount data belongs to the correct seller
          if (
            sellerId &&
            prd_wise_discData.sellerId &&
            String(prd_wise_discData.sellerId) !== String(sellerId)
          ) {
            // Try to find the correct pricing from getAllSellerPrices
            const correctSellerPrices = allSellerPricesBySeller[String(sellerId)] || [];
            const correctPricing = find(
              correctSellerPrices,
              (price) => String(price.ProductVariantId) === String(item.productId)
            );

            if (correctPricing) {
              prd_wise_discData = correctPricing;
            }
          }

          // Apply product cost with currency factor if not already set
          if (!item.productCost && item.bcProductCost) {
            item.productCost = item.bcProductCost * (CurrencyFactor || 1);
          }

          // Assign discount data to product
          item = assign_pricelist_discounts_data_to_products(
            item,
            prd_wise_discData,
            true // updateDiscounts
          );
          item.isDiscUptodate = true;
          return item;
        });

        // Apply discount details calculation (matches buyer-fe exactly)
        const cartCalc = cart1
          ? discountDetails(cart1, false, taxExempted)
          : cart;

        // Calculate final cart totals (matches buyer-fe parameters)
        const result = cartCalculation(cartCalc, isInter, 0, 2, quoteSettings);

        // Only update if result is different
        setCartValue((prev: any) => {
          if (JSON.stringify(prev) !== JSON.stringify(result)) {
            return result;
          }
          return prev;
        });
        calculationRef.current = true;
      } catch (error) {
        console.error("Error in useMultipleDiscount:", error);
        calculationRef.current = true;
      }
    }
  }, [
    discountdataLoading,
    discountdata,
    cart,
    pfRate,
    CurrencyFactor,
    isInter,
    quoteSettings,
    taxExempted,
    sellerId,
    allSellerPricesBySeller,
  ]);

  return {
    isLoading: (!discountdata && !discountdataLoading) || !calculationRef.current,
    cartValue: cartValue,
    cart: cart, // Return original cart (products are enriched in cartValue calculation)
    ApprovalRequired: some(discountdata, ["approvalReq", 1]),
  };
}

