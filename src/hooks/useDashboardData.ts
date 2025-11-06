import DashboardService from "@/lib/api/services/DashboardService";
import OrderService from "@/lib/api/services/OrdersService";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import type {
  DashboardApiResponse,
  DashboardFilterParams,
  DashboardQueryParams,
} from "@/types/dashboard";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

// Query key factories for better cache management
export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: (params: DashboardQueryParams, filters: DashboardFilterParams) =>
    [...dashboardKeys.all, "data", params, filters] as const,
  orders: (params: {
    userId: string;
    companyId: string;
    offset: number;
    limit: number;
  }) => [...dashboardKeys.all, "orders", params] as const,
} as const;

/**
 * Hook to fetch dashboard data with React Query caching
 */
export function useDashboardData(
  params?: DashboardQueryParams,
  filters?: DashboardFilterParams,
  options?: Partial<UseQueryOptions<DashboardApiResponse>>
) {
  const jwtService = JWTService.getInstance();

  return useQuery({
    queryKey: dashboardKeys.data(
      params || {
        userId: 0,
        companyId: 0,
        offset: 0,
        limit: 99999999,
        currencyId: 96,
      },
      filters || {
        accountId: [],
        endDate: `${new Date().getFullYear()}-12-31T23:59:59.999Z`,
        endValue: null,
        identifier: "",
        name: "",
        startDate: `${new Date().getFullYear()}-01-01T00:00:00.000Z`,
        startValue: null,
        status: [],
      }
    ),
    queryFn: async () => {
      // Get user data from token
      const token = AuthStorage.getAccessToken();
      if (!token) {
        throw new Error("No access token found");
      }

      const payload = jwtService.getTokenPayload(token);
      if (!payload) {
        throw new Error("Invalid token");
      }

      const currentYear = new Date().getFullYear();
      const defaultFilters = {
        accountId: [],
        endDate: `${currentYear}-12-31T23:59:59.999Z`,
        endValue: null,
        identifier: "",
        name: "",
        startDate: `${currentYear}-01-01T00:00:00.000Z`,
        startValue: null,
        status: [],
      };

      const defaultParams = {
        userId: payload.userId,
        companyId: payload.companyId,
        offset: 0,
        limit: 99999999,
        currencyId: 96, // Default currency ID - should be from user preferences
      };

      const finalParams = { ...defaultParams, ...params };
      const finalFilters = { ...defaultFilters, ...filters };

      return DashboardService.getDashboardData(finalParams, finalFilters);
    },
    // Dashboard data changes less frequently - longer stale time
    staleTime: 10 * 60 * 1000, // 10 minutes (was 5 minutes)
    gcTime: 15 * 60 * 1000, // 15 minutes (was 10 minutes)
    enabled: true, // Always enabled since we handle auth checks inside
    ...options,
  });
}

/**
 * Hook to fetch dashboard orders with React Query caching
 */
export function useDashboardOrders(
  params?: {
    userId?: string;
    companyId?: string;
    offset?: number;
    limit?: number;
  },
  options?: Partial<UseQueryOptions>
) {
  const jwtService = JWTService.getInstance();

  const finalParams = {
    userId: "1032", // Default fallback
    companyId: "8690", // Default fallback
    offset: 0,
    limit: 10,
    ...params,
  };

  return useQuery({
    queryKey: dashboardKeys.orders(finalParams),
    queryFn: async () => {
      // Get user data from token for dynamic params if not provided
      const token = AuthStorage.getAccessToken();
      let queryParams = { ...finalParams };

      if (token) {
        const payload = jwtService.getTokenPayload(token);
        if (payload) {
          queryParams = {
            ...queryParams,
            userId: payload.userId?.toString() || queryParams.userId,
            companyId: payload.companyId?.toString() || queryParams.companyId,
          };
        }
      }

      return OrderService.getOrders(queryParams);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - orders change more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
    ...options,
  });
}

/**
 * Hook to get transformed chart data from dashboard data
 */
export function useDashboardChartData(
  params?: DashboardQueryParams,
  filters?: DashboardFilterParams,
  options?: Partial<UseQueryOptions<DashboardApiResponse>>
) {
  const dashboardQuery = useDashboardData(params, filters, options);

  return {
    ...dashboardQuery,
    data: dashboardQuery.data
      ? {
          chartData: DashboardService.transformOrderDataForChart(
            dashboardQuery.data
          ),
          stats: DashboardService.getComprehensiveStats(dashboardQuery.data),
          trendPercentage: DashboardService.calculateTrendPercentage(
            dashboardQuery.data
          ),
          dateRange: DashboardService.getDateRange(dashboardQuery.data),
          rawData: dashboardQuery.data,
        }
      : undefined,
  };
}

/**
 * Hook for dashboard data with automatic token-based parameters
 */
export function useAutoDashboardData(
  customFilters?: Partial<DashboardFilterParams>,
  options?: Partial<UseQueryOptions<DashboardApiResponse>>
) {
  const jwtService = JWTService.getInstance();

  // Get token and payload once
  const token = AuthStorage.getAccessToken();
  const payload = token ? jwtService.getTokenPayload(token) : null;

  const currentYear = new Date().getFullYear();
  const filters: DashboardFilterParams = {
    accountId: [],
    endDate: `${currentYear}-12-31T23:59:59.999Z`,
    endValue: null,
    identifier: "",
    name: "",
    startDate: `${currentYear}-01-01T00:00:00.000Z`,
    startValue: null,
    status: [],
    ...customFilters,
  };

  const params: DashboardQueryParams = {
    userId: payload?.userId || 0,
    companyId: payload?.companyId || 0,
    offset: 0,
    limit: 99999999,
    currencyId: 96,
  };

  return useDashboardData(params, filters, {
    enabled: !!token && !!payload, // Only fetch if we have valid auth
    ...options,
  });
}
