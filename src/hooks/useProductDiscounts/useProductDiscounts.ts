"use client";

import DiscountService from "@/lib/api/services/DiscountService/DiscountService";
import { useTenantStore } from "@/store/useTenantStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser/useCurrentUser";

/**
 * Hook to fetch discount data for a list of products
 * Similar to buyer-fe/src/hooks/useProductDiscounts.js
 *
 * @param productIds - Array of product IDs to fetch discounts for
 * @returns Object with discountdata, discountdataLoading, and discountDataError
 */
export default function useProductDiscounts(productIds: (string | number)[]) {
  const { user, loading: companyLoading } = useCurrentUser();
  const { tenantData } = useTenantStore();
  const tenant = tenantData?.tenant;
  const sellerCurrency = tenantData?.sellerCurrency;
  const userId = user?.userId;
  const companyId = user?.companyId;
  const currency = user?.currency;
  const auth = true; // Assuming authenticated if user exists

  // Convert productIds to numbers and filter out invalid values
  const validProductIds = useMemo(() => {
    return productIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
  }, [productIds]);

  const fetchDiscounts = async () => {
    if (!validProductIds.length) {
      return { data: [] };
    }

    try {
      const discountResult = await DiscountService.getDiscount({
        userId: userId || 0,
        tenantId: tenant?.tenantCode || "",
        body: {
          Productid: validProductIds,
          CurrencyId: currency?.id || sellerCurrency?.id || 0,
          BaseCurrencyId: sellerCurrency?.id || 0,
          companyId: companyId || 0,
          ...(currency?.currencyCode || sellerCurrency?.currencyCode
            ? {
                currencyCode:
                  currency?.currencyCode || sellerCurrency?.currencyCode || "",
              }
            : {}),
        },
      });

      return discountResult;
    } catch (error) {
      console.error("Error fetching discount data:", error);
      return { data: [] };
    }
  };

  const shouldFetch =
    !companyLoading &&
    Boolean(auth ? currency?.id : sellerCurrency?.id) &&
    validProductIds.length > 0;

  const validProductIdsKey = useMemo(
    () => validProductIds.join(","),
    [validProductIds]
  );
  const queryKey = useMemo(
    () => [
      "productDiscounts",
      validProductIdsKey,
      currency?.id,
      sellerCurrency?.id,
      companyId,
    ],
    [validProductIdsKey, currency?.id, sellerCurrency?.id, companyId]
  );

  const {
    data,
    error,
    isLoading,
    refetch: revalidate,
  } = useQuery({
    queryKey,
    queryFn: fetchDiscounts,
    enabled: shouldFetch,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5000,
    refetchOnMount: false,
  });

  const [discount, setDiscount] = useState<any[]>([]);

  useEffect(() => {
    if (data?.data && !error) {
      setDiscount(data.data);
    }
  }, [data, error]);

  return {
    discountdata: discount,
    discountdataLoading: shouldFetch ? isLoading : false,
    discountDataError: error,
    revalidate,
  };
}
