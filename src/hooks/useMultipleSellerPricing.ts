/* eslint-disable @typescript-eslint/no-explicit-any */
import CartService from "@/lib/api/CartServices";
import { useTenantStore } from "@/store/useTenantStore";
import { groupBy, uniqBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useCurrentUser } from "./useCurrentUser";

interface CartItem {
  productId: string | number;
  quantity?: number;
  sellerId?: string | number;
  vendorId?: string | number;
  _updated?: number;
}

interface PricingData {
  data?: unknown[];
  sellerId?: string | number;
  vendorId?: string | number;
}

interface SellerPricing {
  [key: string]: unknown[];
}

interface PricingResult {
  data: SellerPricing;
  allSellerPricesData: SellerPricing;
}

export default function useMultipleSellerPricing(
  cartItems: CartItem[],
  sellerIds: (string | number)[]
) {
  const { user, loading } = useCurrentUser();
  const { tenantData } = useTenantStore();
  const tenant = tenantData?.tenant;
  const sellerCurrency = tenantData?.sellerCurrency;
  const userId = user?.userId;
  const companyId = user?.companyId;
  const currency = user?.currency;
  const auth = true;

  const productIds = uniqBy(cartItems || [], "productId").map(
    (item: CartItem) => Number(item.productId)
  );
  const quantityHash = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return "empty";
    return cartItems
      .map(
        (item: CartItem) =>
          `${item.productId}:${item.quantity || 1}:${
            item.sellerId || "default"
          }:${item._updated || 0}`
      )
      .sort()
      .join("|");
  }, [cartItems]);
  const fetch = async () => {
    // Always fetch getAllSellerPrices as fallback data (DO NOT await here - keep it as a Promise)
    const getAllSellerPricesPromise = CartService.getAllSellerPrice({
      userId: userId || 0,
      tenantId: tenant?.tenantCode || "",
      body: {
        Productid: productIds as number[],
        CurrencyId: currency?.id || sellerCurrency?.id || 0,
        BaseCurrencyId: sellerCurrency?.id || 0,
        CompanyId: companyId || 0,
      },
    });
    // If no sellers specified, return only getAllSellerPrices
    if (!sellerIds || sellerIds.length === 0) {
      const allSellerPricesResult = await getAllSellerPricesPromise;
      return allSellerPricesResult;
    }

    // Create product data with quantities for each seller
    const getProductDataForSeller = (sellerId: string | number) => {
      const sellerItems =
        cartItems?.filter(
          (item: CartItem) =>
            String(item.sellerId) === String(sellerId) ||
            String(item.vendorId) === String(sellerId)
        ) || [];

      return sellerItems.map((item: CartItem) => ({
        ProductVariantId: Number(item.productId),
        quantity: item.quantity || 1,
      }));
    };

    // Fetch pricing for each seller with quantity information
    const sellerPromises = sellerIds.map((sellerId: string | number) =>
      CartService.getDiscount({
        userId: userId || 0,
        tenantId: tenant?.tenantCode || "",
        body: {
          Productid: productIds as number[],

          ProductData: getProductDataForSeller(sellerId) as any,
          CurrencyId: currency?.id || sellerCurrency?.id || 0,
          BaseCurrencyId: sellerCurrency?.id || 0,
          companyId: companyId || 0,
          sellerId: String(sellerId),
        },
      }).catch((_error: unknown) => {
        // Failed to fetch pricing for seller
        return { data: [] }; // Return empty data on error
      })
    );
    // Fetch both seller-specific and getAllSellerPrices in parallel
    const [sellerResults, allSellerPricesResult] = await Promise.all([
      Promise.all(sellerPromises),
      getAllSellerPricesPromise.catch((_error: unknown) => {
        // Failed to fetch getAllSellerPrices
        return { data: [] };
      }),
    ]);

    // Combine results by seller with fallback logic
    const sellerPricing: SellerPricing = {};
    const allSellerPricesData =
      (allSellerPricesResult as PricingData)?.data || [];

    // Group getAllSellerPrices by numeric sellerId for easy lookup
    const allSellerPricesBySeller: SellerPricing = {};
    (allSellerPricesData as Record<string, unknown>[]).forEach(
      (item: Record<string, unknown>) => {
        // Only use numeric seller IDs
        const sellerId = (item.sellerId || item.vendorId) as string | number;
        if (sellerId) {
          const sellerKey = String(sellerId);
          if (!allSellerPricesBySeller[sellerKey]) {
            allSellerPricesBySeller[sellerKey] = [];
          }
          allSellerPricesBySeller[sellerKey].push(item);
        } else {
          // Pricing item has no numeric sellerId or vendorId
        }
      }
    );

    // Process each seller's pricing with validation
    sellerIds.forEach((sellerId: string | number, index: number) => {
      const sellerSpecificData =
        (sellerResults[index] as PricingData)?.data || [];
      const fallbackData = allSellerPricesBySeller[sellerId] || [];

      // Check if seller-specific data actually belongs to this seller
      const validSellerData = (
        sellerSpecificData as Record<string, unknown>[]
      ).filter(
        (item: Record<string, unknown>) =>
          String(item.sellerId) === String(sellerId) ||
          String(item.vendorId) === String(sellerId)
      );

      // Use valid seller-specific data if available, otherwise use getAllSellerPrices
      if (validSellerData.length > 0) {
        sellerPricing[sellerId] = validSellerData;
      } else if (fallbackData.length > 0) {
        sellerPricing[sellerId] = fallbackData;
      } else {
        // No pricing available for this seller
        sellerPricing[sellerId] = [];
      }
    });

    return {
      data: sellerPricing,
      allSellerPricesData: allSellerPricesBySeller, // Include for additional fallback if needed
    };
  };

  const shouldFetch =
    !loading &&
    (auth ? currency?.id : sellerCurrency?.id) &&
    productIds?.length > 0;

  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR(
    shouldFetch
      ? [
          `/multiSellerPricing`,
          quantityHash,
          ...productIds,
          ...(sellerIds || []),
          currency?.id,
          sellerCurrency?.id,
        ]
      : null,
    fetch,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      dedupingInterval: 2000, // Allow some deduping to prevent excessive requests
      revalidateOnMount: true, // Always fetch on mount
    }
  );

  // Remove forced revalidation - SWR will handle it automatically with the cache key

  const [sellerPricingData, setSellerPricingData] = useState({});
  const [allSellerPricesData, setAllSellerPricesData] = useState({});

  useEffect(() => {
    if ((data as PricingResult)?.data && !error) {
      // If data is already organized by seller
      if (sellerIds && sellerIds.length > 0) {
        setSellerPricingData((data as PricingResult).data);
        // Store the allSellerPricesData for additional fallback if needed
        if ((data as PricingResult).allSellerPricesData) {
          setAllSellerPricesData((data as PricingResult).allSellerPricesData);
        }
      } else {
        // Group getAllSellerPrices response by numeric sellerId only

        const priceData = (data as any)?.data || [];
        const groupedBySeller = groupBy(
          priceData as Record<string, unknown>[],
          (item: Record<string, unknown>) => {
            const id = item.sellerId || item.vendorId;
            if (!id) {
              console.warn(
                "[useMultipleSellerPricing] Item has no numeric sellerId or vendorId:",
                item
              );
            }
            return String(id || "no-seller-id");
          }
        );
        // Remove items with no seller ID
        delete groupedBySeller["no-seller-id"];
        setSellerPricingData(groupedBySeller as SellerPricing);
        setAllSellerPricesData(groupedBySeller as SellerPricing);
      }
    }
  }, [data, error, sellerIds]);

  return {
    sellerPricingData,
    allSellerPricesData, // Expose for additional fallback scenarios
    isLoading: shouldFetch ? !error && !data : false,
    error,
    revalidate, // Expose revalidate function for manual cache invalidation
  };
}
