/**
 * Dashboard Service Layer
 * Handles data fetching, caching, and transformation for dashboard
 */

import type {
  DashboardApiResponse,
  DashboardRequestParams,
  DashboardFilterBody,
  DashboardData,
  MonthlyChartData,
  DashboardSummary,
  DashboardGraphItem,
} from "@/lib/types/dashboard";

// Cache configuration
const CACHE_KEY_PREFIX = "dashboard_cache_";
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds

// Enhanced in-memory cache with request deduplication
const cache = new Map<
  string,
  {
    data: DashboardApiResponse;
    timestamp: number;
  }
>();

// Request deduplication - prevent multiple identical requests
const pendingRequests = new Map<string, Promise<DashboardApiResponse>>();

/**
 * Generate cache key from request parameters
 */
function getCacheKey(
  params: DashboardRequestParams,
  body: DashboardFilterBody
): string {
  const paramKey = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");

  const bodyKey = JSON.stringify(body);
  return `${CACHE_KEY_PREFIX}${paramKey}_${bodyKey}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Check if cached data is stale but still usable (background refresh)
 */
function isCacheStale(timestamp: number): boolean {
  const age = Date.now() - timestamp;
  return age > CACHE_TTL / 2 && age < CACHE_TTL;
}

/**
 * Dashboard Service Class
 */
export class DashboardService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "/api/dashboard";
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Fetch dashboard data with caching and request deduplication
   */
  async fetchDashboardData(
    params: DashboardRequestParams,
    body: DashboardFilterBody,
    options?: { skipCache?: boolean }
  ): Promise<DashboardApiResponse> {
    const cacheKey = getCacheKey(params, body);

    // Check cache first (unless skipped)
    if (!options?.skipCache) {
      const cached = cache.get(cacheKey);
      if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      // Background refresh for stale but usable data
      if (cached && isCacheStale(cached.timestamp)) {
        // Return stale data immediately
        const staleData = cached.data;

        // Refresh in background (fire and forget)
        this.performRequest(params, body, cacheKey)
          .then(() => {})
          .catch(() => {});

        return staleData;
      }
    }

    // Request deduplication - check if same request is already in flight
    const existingRequest = pendingRequests.get(cacheKey);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new request
    const requestPromise = this.performRequest(params, body, cacheKey);

    // Store pending request for deduplication
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Perform the actual HTTP request
   */
  private async performRequest(
    params: DashboardRequestParams,
    body: DashboardFilterBody,
    cacheKey: string
  ): Promise<DashboardApiResponse> {
    // Build URL with query parameters
    const url = new URL(this.baseUrl, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    // Optimized fetch with compression and timeout
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      },
      credentials: "include",
      body: JSON.stringify(body),
      // Add timeout and performance optimizations
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error ||
          errorData?.message ||
          `API error: ${response.status}`
      );
    }

    const data = (await response.json()) as DashboardApiResponse;

    // Cache the successful response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  /**
   * Clear cache for specific request or all cache
   */
  clearCache(
    params?: DashboardRequestParams,
    body?: DashboardFilterBody
  ): void {
    if (params && body) {
      const cacheKey = getCacheKey(params, body);
      cache.delete(cacheKey);
    } else {
      // Clear all dashboard cache
      const keysToDelete: string[] = [];
      cache.forEach((_, key) => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => cache.delete(key));
    }
  }

  /**
   * Transform dashboard data for chart display
   */
  transformToMonthlyData(data: DashboardData): MonthlyChartData[] {
    const monthlyMap = new Map<string, MonthlyChartData>();

    // Process order data
    if (data.lsOrderGraphDto) {
      data.lsOrderGraphDto.forEach(item => {
        const existing =
          monthlyMap.get(item.dateValue) ||
          this.createEmptyMonthData(item.dateValue);
        existing.orders += item.amountValue;
        existing.orderCount += item.count;
        existing.orderStatuses[item.status] =
          (existing.orderStatuses[item.status] || 0) + item.amountValue;
        if (item.avgScore !== null) {
          existing.avgScore = item.avgScore;
        }
        monthlyMap.set(item.dateValue, existing);
      });
    }

    // Process quote data
    if (data.lsQuoteGraphDto) {
      data.lsQuoteGraphDto.forEach(item => {
        const existing =
          monthlyMap.get(item.dateValue) ||
          this.createEmptyMonthData(item.dateValue);
        existing.quotes += item.amountValue;
        existing.quoteCount += item.count;
        existing.quoteStatuses[item.status] =
          (existing.quoteStatuses[item.status] || 0) + item.amountValue;
        monthlyMap.set(item.dateValue, existing);
      });
    }

    // Convert map to array and sort by date
    return Array.from(monthlyMap.values()).sort((a, b) => {
      return (
        this.parseMonthYear(a.dateValue) - this.parseMonthYear(b.dateValue)
      );
    });
  }

  /**
   * Calculate dashboard summary statistics
   */
  calculateSummary(data: DashboardData): DashboardSummary {
    let totalOrderValue = 0;
    let totalQuoteValue = 0;
    let totalOrderCount = 0;
    let totalQuoteCount = 0;

    // Calculate order totals
    if (data.lsOrderGraphDto) {
      data.lsOrderGraphDto.forEach(item => {
        totalOrderValue += item.amountValue;
        totalOrderCount += item.count;
      });
    }

    // Calculate quote totals
    if (data.lsQuoteGraphDto) {
      data.lsQuoteGraphDto.forEach(item => {
        totalQuoteValue += item.amountValue;
        totalQuoteCount += item.count;
      });
    }

    // Get top performers
    const topOrderCustomer = data.topOrderDto?.[0]?.name || null;
    const topQuoteCustomer = data.topQuoteDto?.[0]?.name || null;

    // Calculate conversion rate (quotes that became orders)
    let quoteConversionRate = 0;
    if (data.lsQuoteStatusGraphDto) {
      const orderPlaced = data.lsQuoteStatusGraphDto.find(
        item => item.quoteStatus === "ORDER PLACED"
      );
      const totalQuotes = data.lsQuoteStatusGraphDto.reduce(
        (sum, item) => sum + item.count,
        0
      );
      if (totalQuotes > 0 && orderPlaced) {
        quoteConversionRate = (orderPlaced.count / totalQuotes) * 100;
      }
    }

    return {
      totalOrderValue,
      totalQuoteValue,
      totalOrderCount,
      totalQuoteCount,
      activeAccounts: data.activeAccounts,
      totalAccounts: data.totalAccounts,
      topOrderCustomer,
      topQuoteCustomer,
      quoteConversionRate,
      averageOrderValue:
        totalOrderCount > 0 ? totalOrderValue / totalOrderCount : 0,
      averageQuoteValue:
        totalQuoteCount > 0 ? totalQuoteValue / totalQuoteCount : 0,
    };
  }

  /**
   * Group data by status
   */
  groupByStatus(items: DashboardGraphItem[]): Record<
    string,
    {
      total: number;
      count: number;
      items: DashboardGraphItem[];
    }
  > {
    const grouped: Record<
      string,
      {
        total: number;
        count: number;
        items: DashboardGraphItem[];
      }
    > = {};

    items.forEach(item => {
      if (!grouped[item.status]) {
        grouped[item.status] = {
          total: 0,
          count: 0,
          items: [],
        };
      }
      const group = grouped[item.status];
      if (group) {
        group.total += item.amountValue;
        group.count += item.count;
        group.items.push(item);
      }
    });

    return grouped;
  }

  /**
   * Get trend analysis
   */
  getTrendAnalysis(data: MonthlyChartData[]): {
    orderTrend: "up" | "down" | "stable";
    quoteTrend: "up" | "down" | "stable";
    orderGrowth: number;
    quoteGrowth: number;
  } {
    if (data.length < 2) {
      return {
        orderTrend: "stable",
        quoteTrend: "stable",
        orderGrowth: 0,
        quoteGrowth: 0,
      };
    }

    const recent = data[data.length - 1];
    const previous = data[data.length - 2];

    if (!recent || !previous) {
      return {
        orderTrend: "stable",
        quoteTrend: "stable",
        orderGrowth: 0,
        quoteGrowth: 0,
      };
    }

    const orderGrowth =
      previous.orders > 0
        ? ((recent.orders - previous.orders) / previous.orders) * 100
        : 0;

    const quoteGrowth =
      previous.quotes > 0
        ? ((recent.quotes - previous.quotes) / previous.quotes) * 100
        : 0;

    return {
      orderTrend: orderGrowth > 5 ? "up" : orderGrowth < -5 ? "down" : "stable",
      quoteTrend: quoteGrowth > 5 ? "up" : quoteGrowth < -5 ? "down" : "stable",
      orderGrowth,
      quoteGrowth,
    };
  }

  /**
   * Format currency value
   */
  formatCurrency(value: number, currencyCode: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Format large numbers with abbreviations
   */
  formatLargeNumber(value: number): string {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  // Private helper methods

  private createEmptyMonthData(dateValue: string): MonthlyChartData {
    return {
      month: this.formatMonthYear(dateValue),
      dateValue,
      orders: 0,
      quotes: 0,
      orderCount: 0,
      quoteCount: 0,
      orderStatuses: {},
      quoteStatuses: {},
      avgScore: null,
    };
  }

  private formatMonthYear(dateValue: string): string {
    // Convert "Jul 2025" to "July 2025"
    const monthMap: Record<string, string> = {
      Jan: "January",
      Feb: "February",
      Mar: "March",
      Apr: "April",
      May: "May",
      Jun: "June",
      Jul: "July",
      Aug: "August",
      Sep: "September",
      Oct: "October",
      Nov: "November",
      Dec: "December",
    };

    const [month, year] = dateValue.split(" ");
    return `${monthMap[month || ""] || month || ""} ${year || ""}`;
  }

  private parseMonthYear(dateValue: string): number {
    // Parse "Jul 2025" to a timestamp for sorting
    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const [month, year] = dateValue.split(" ");
    return new Date(
      parseInt(year || "0"),
      monthMap[month || ""] || 0
    ).getTime();
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();

// Export default
export default DashboardService;
