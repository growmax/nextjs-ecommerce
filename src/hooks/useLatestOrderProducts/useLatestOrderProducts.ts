import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTenantData } from "@/hooks/useTenantData";
import { getLatestTaxData } from "@/utils/order/getLatestTaxData/getLatestTaxData";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";

interface UseLatestOrderProductsParams {
  products?: any[];
  currency?: any;
  sellerCurrency?: any;
  isInter?: boolean;
  taxExemption?: boolean;
  isCloneReOrder?: boolean;
  isPlaceOrder?: boolean;
  isSprRequested?: boolean;
  quoteSettings?: any;
  roundOff?: number;
  elasticIndex?: string;
  enabled?: boolean;
}

type UseLatestOrderProductsOptions = Omit<
  UseQueryOptions<any[], Error>,
  "queryKey" | "queryFn" | "enabled"
>;

/**
 * Hook to fetch and update order products with latest pricing, discounts, and tax data
 * Uses DiscountService.getDiscount() and SearchService.getProductsByIds()
 */
export function useLatestOrderProducts(
  params: UseLatestOrderProductsParams,
  options?: UseLatestOrderProductsOptions
) {
  const { user } = useCurrentUser();
  const { tenantData } = useTenantData();

  const {
    products = [],
    currency,
    sellerCurrency,
    isInter = true,
    taxExemption = false,
    isCloneReOrder = false,
    isPlaceOrder = false,
    isSprRequested = false,
    quoteSettings,
    roundOff = 2,
    elasticIndex: providedElasticIndex,
    enabled = true,
  } = params;

  // Get elastic index from tenant data or use provided one
  const elasticIndex = useMemo(() => {
    if (providedElasticIndex) {
      return providedElasticIndex;
    }
    if (tenantData?.tenant?.elasticCode) {
      return `${tenantData.tenant.elasticCode}pgandproducts`;
    }
    // Fallback to sandbox default if no elasticCode available
    return "sandboxpgandproducts";
  }, [providedElasticIndex, tenantData?.tenant?.elasticCode]);

  // Create query key based on product IDs
  const productIds = useMemo(
    () =>
      products
        .map(p => p?.productId)
        .filter((id): id is number => id !== undefined && id !== null)
        .sort()
        .join(","),
    [products]
  );

  const queryKey = useMemo(
    () => [
      "latest-order-products",
      productIds,
      user?.userId,
      user?.companyId,
      tenantData?.tenant?.tenantCode,
      currency?.id,
      sellerCurrency?.id,
      isInter,
      taxExemption,
      isCloneReOrder,
      isPlaceOrder,
      isSprRequested,
      elasticIndex,
    ],
    [
      productIds,
      user?.userId,
      user?.companyId,
      tenantData?.tenant?.tenantCode,
      currency?.id,
      sellerCurrency?.id,
      isInter,
      taxExemption,
      isCloneReOrder,
      isPlaceOrder,
      isSprRequested,
      elasticIndex,
    ]
  );

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!products || products.length === 0) {
        return products;
      }

      if (!user || !tenantData?.tenant) {
        throw new Error("User or tenant data not available");
      }

      return getLatestTaxData({
        products,
        isCloneReOrder,
        taxExemption,
        isInter,
        isSprRequested,
        isPlaceOrder,
        currency,
        companyId: user.companyId,
        userId: user.userId,
        tenantCode: tenantData.tenant.tenantCode,
        sellerCurrency,
        userCurrency: user.currency, // Pass user's currency object for currencyCode extraction
        roundOff,
        quoteSettings,
        elasticIndex,
      });
    },
    enabled:
      enabled &&
      products.length > 0 &&
      !!user &&
      !!tenantData?.tenant &&
      productIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    ...query,
    updatedProducts: query.data || products,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
