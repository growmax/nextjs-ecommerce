"use client";

import DiscountService from "@/lib/api/services/DiscountService/DiscountService";
import {
  batchCacheSellerInfo,
  getSellerInfoFromCache,
  type SellerInfo,
} from "@/lib/cache/sellerInfoCache";
import { useTenantStore } from "@/store/useTenantStore";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";

export interface UseSellerInfoResult {
  sellerId: string | number | null;
  sellerName: string | null;
  isLoading: boolean;
  error: Error | null;
  realPrice: number | null;
}

/**
 * Hook to fetch seller information for a product with Redis caching
 * 
 * Flow:
 * 1. Check Redis cache via API route (GET)
 * 2. If cached, return immediately
 * 3. If not cached, fetch from discount API (client-side)
 * 4. Cache result in Redis via API route (POST)
 * 5. Return seller info and real price
 * 
 * @param productId - Product ID to fetch seller info for
 * @returns Object with sellerId, sellerName, isLoading, error, and realPrice
 */
export function useSellerInfo(productId: number | null): UseSellerInfoResult {
  const { user, loading: companyLoading } = useCurrentUser();
  const { tenantData } = useTenantStore();
  const tenant = tenantData?.tenant;
  const sellerCurrency = tenantData?.sellerCurrency;
  const userId = user?.userId;
  const companyId = user?.companyId;
  const currency = user?.currency;

  const shouldFetch = useMemo(() => {
    return (
      !companyLoading &&
      Boolean(productId) &&
      Boolean(userId) &&
      Boolean(companyId) &&
      Boolean(currency?.id || sellerCurrency?.id)
    );
  }, [companyLoading, productId, userId, companyId, currency?.id, sellerCurrency?.id]);

  const queryKey = useMemo(
    () => [
      "sellerInfo",
      productId,
      companyId,
      currency?.id || sellerCurrency?.id,
    ],
    [productId, companyId, currency?.id, sellerCurrency?.id]
  );

  const {
    data,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<{
      sellerInfo: SellerInfo | null;
      realPrice: number | null;
    }> => {
      if (!productId || !companyId || !userId || !tenant?.tenantCode) {
        return { sellerInfo: null, realPrice: null };
      }

      const currencyId = currency?.id || sellerCurrency?.id || 0;
      const baseCurrencyId = sellerCurrency?.id || 0;

      // Step 1: Check Redis cache
      const cachedSellerInfo = await getSellerInfoFromCache(
        productId,
        companyId,
        currencyId
      );

      if (cachedSellerInfo) {
        // If cached, we still need to fetch price from discount API
        // But we can skip seller info fetching
        try {
          const discountResult = await DiscountService.getDiscount({
            userId,
            tenantId: tenant.tenantCode,
            body: {
              Productid: [productId],
              CurrencyId: currencyId,
              BaseCurrencyId: baseCurrencyId,
              companyId,
              ...(currency?.currencyCode || sellerCurrency?.currencyCode
                ? {
                    currencyCode:
                      currency?.currencyCode ||
                      sellerCurrency?.currencyCode ||
                      "",
                  }
                : {}),
            },
          });

          const discountItem = discountResult.data?.find(
            item => item.ProductVariantId === productId
          );

          return {
            sellerInfo: cachedSellerInfo,
            realPrice: discountItem?.BasePrice || null,
          };
        } catch (error) {
          console.error("Error fetching discount for cached seller:", error);
          return {
            sellerInfo: cachedSellerInfo,
            realPrice: null,
          };
        }
      }

      // Step 2: Not cached, fetch from discount API
      try {
        const discountResult = await DiscountService.getDiscount({
          userId,
          tenantId: tenant.tenantCode,
          body: {
            Productid: [productId],
            CurrencyId: currencyId,
            BaseCurrencyId: baseCurrencyId,
            companyId,
            ...(currency?.currencyCode || sellerCurrency?.currencyCode
              ? {
                  currencyCode:
                    currency?.currencyCode ||
                    sellerCurrency?.currencyCode ||
                    "",
                }
              : {}),
          },
        });

        const discountItem = discountResult.data?.find(
          item => item.ProductVariantId === productId
        );

        if (discountItem && discountItem.sellerId && discountItem.sellerName) {
          const sellerInfo: SellerInfo = {
            sellerId: discountItem.sellerId,
            sellerName: discountItem.sellerName,
          };

          // Step 3: Cache result in Redis
          await batchCacheSellerInfo(
            new Map([
              [
                productId,
                {
                  ...sellerInfo,
                  companyId,
                  currencyId,
                },
              ],
            ])
          );

          return {
            sellerInfo,
            realPrice: discountItem.BasePrice || null,
          };
        }

        return {
          sellerInfo: null,
          realPrice: discountItem?.BasePrice || null,
        };
      } catch (error) {
        console.error("Error fetching seller info from discount API:", error);
        throw error;
      }
    },
    enabled: shouldFetch,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    refetchOnMount: false,
  });

  return {
    sellerId: data?.sellerInfo?.sellerId || null,
    sellerName: data?.sellerInfo?.sellerName || null,
    isLoading: shouldFetch ? isLoading : false,
    error: error as Error | null,
    realPrice: data?.realPrice || null,
  };
}

