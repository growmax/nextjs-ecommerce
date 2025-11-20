import DiscountService from "@/lib/api/services/DiscountService/DiscountService";
import { useTenantStore } from "@/store/useTenantStore";
// Use individual lodash imports for better tree-shaking
import { useQuery } from "@tanstack/react-query";
import uniqBy from "lodash/uniqBy";
import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "./useCurrentUser";

interface CartItem {
  productId: string | number;
  quantity?: number;
  sellerId?: string | number;
  vendorId?: string | number;
  _updated?: number;
}

interface SellerPricing {
  [key: string]: unknown[];
}

export default function useMultipleSellerPricing(
  cartItems: CartItem[],
  _sellerIds: (string | number)[]
) {
  const { user, loading } = useCurrentUser();
  const { tenantData } = useTenantStore();
  const tenant = tenantData?.tenant;
  const sellerCurrency = tenantData?.sellerCurrency;
  const userId = user?.userId;
  const companyId = user?.companyId;
  const currency = user?.currency;
  const auth = true;

  const productIds = useMemo(() => {
    return uniqBy(cartItems || [], "productId").map(
      (item: CartItem) => Number(item.productId)
    );
  }, [cartItems]);
  
  // Create a stable, sorted array for the query key to ensure React Query deduplicates properly
  // Sort to ensure consistent key even if productIds array order changes
  const stableProductIds = useMemo(() => {
    return [...productIds].sort((a, b) => a - b);
  }, [productIds]);

  // Note: quantityHash is intentionally not included in query key
  // Pricing data doesn't depend on quantity, so quantity changes shouldn't trigger refetch
  // Only productIds, currency, and sellerCurrency affect pricing
  const fetch = async () => {
    // Use discount service to get pricing for all sellers
    // When sellerId is not provided, discount service returns pricing for all available sellers
    const discountResult = await DiscountService.getDiscount({
      userId: userId || 0,
      tenantId: tenant?.tenantCode || "",
      body: {
        Productid: stableProductIds as number[],
        CurrencyId: currency?.id || sellerCurrency?.id || 0,
        BaseCurrencyId: sellerCurrency?.id || 0,
        companyId: companyId || 0,
      },
    }).catch((_error: unknown) => {
      // Failed to fetch discount data
      return { data: [] };
    });

    const discountData = discountResult?.data || [];

    // Group discount data by sellerId for easy lookup
    // Discount service returns DiscountItem[] with sellerId in each item
    const discountDataBySeller: SellerPricing = {};
    (discountData as Record<string, unknown>[]).forEach(
      (item: Record<string, unknown>) => {
        // Extract sellerId from each discount item
        const sellerId = item.sellerId as string | number;
        if (sellerId) {
          const sellerKey = String(sellerId);
          if (!discountDataBySeller[sellerKey]) {
            discountDataBySeller[sellerKey] = [];
          }
          discountDataBySeller[sellerKey].push(item);
        } else {
          // Items without sellerId go to "no-seller-id" group
          const noSellerKey = "no-seller-id";
          if (!discountDataBySeller[noSellerKey]) {
            discountDataBySeller[noSellerKey] = [];
          }
          discountDataBySeller[noSellerKey].push(item);
        }
      }
    );

    // Return the grouped pricing data
    return {
      data: discountDataBySeller,
    };
  };

  const shouldFetch =
    !loading &&
    Boolean(auth ? currency?.id : sellerCurrency?.id) &&
    (stableProductIds?.length ?? 0) > 0;

  // Create a stable query key using sorted productIds to ensure React Query deduplicates properly
  // This prevents duplicate API calls when multiple components use this hook with the same cart data
  const stableProductIdsKey = useMemo(
    () => stableProductIds.join(","),
    [stableProductIds]
  );
  const queryKey = useMemo(
    () => [
      `/multiSellerPricing`,
      // Use stableProductIds (sorted) to ensure consistent key
      // Join productIds to create a stable string key instead of spreading array
      stableProductIdsKey,
      currency?.id,
      sellerCurrency?.id,
    ],
    [stableProductIdsKey, currency?.id, sellerCurrency?.id]
  );

  const {
    data,
    error,
    isLoading,
    refetch: revalidate,
  } = useQuery({
    queryKey,
    queryFn: fetch,
    enabled: shouldFetch ? true : false,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5000, // Increased from 2000 to 5000 to reduce refetches
    refetchOnMount: false, // Changed to false - React Query will use cached data if available
  });

  const [sellerPricingData, setSellerPricingData] = useState<SellerPricing>({});

  useEffect(() => {
    if (data?.data && !error) {
      // Data is already grouped by sellerId from fetch function
      const pricingData = (data as { data: SellerPricing }).data || {};
      setSellerPricingData(pricingData);
    }
  }, [data, error]);

  return {
    sellerPricingData,
    isLoading: shouldFetch ? isLoading : false,
    error,
    revalidate, // Expose refetch function for manual cache invalidation
  };
}
