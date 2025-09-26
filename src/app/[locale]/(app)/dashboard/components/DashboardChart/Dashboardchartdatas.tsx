"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/lib/api/dashboardService";
import type {
  DashboardData,
  DashboardRequestParams,
  DashboardFilterBody,
} from "@/lib/types/dashboard";

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
  quotes: {
    label: "Quotes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface ChartDataPoint {
  month: string;
  orders: number;
  quotes: number;
  orderCount: number;
  quoteCount: number;
  dateValue: string;
}

interface DashboardSummaryData {
  totalOrderAmount: number;
  totalQuoteAmount: number;
  totalOrderCount: number;
  totalQuoteCount: number;
  dateRange: string;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

export function Dashboardchartdatas() {
  const [rawData, setRawData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if API call is already in progress
  const isLoadingRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      // Get current date and 6 months ago
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      // Get dynamic parameters from environment or context
      const userId = parseInt(
        process.env.NEXT_PUBLIC_DEFAULT_USER_ID || "1032"
      );
      const companyId = parseInt(
        process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || "8690"
      );
      const currencyId = parseInt(
        process.env.NEXT_PUBLIC_DEFAULT_CURRENCY_ID || "96"
      );

      const params: DashboardRequestParams = {
        userId,
        companyId,
        offset: 0,
        limit: 99999999,
        currencyId,
      };

      const body: DashboardFilterBody = {
        accountId: [],
        endDate: endDate.toISOString(),
        endValue: null,
        identifier: "",
        name: "",
        startDate: startDate.toISOString(),
        startValue: null,
        status: [],
      };

      const response = await dashboardService.fetchDashboardData(params, body);

      if (response.status === "success" && response.data) {
        setRawData(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(errorMessage);

      // Auto-retry for genuine network errors
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError")
      ) {
        setTimeout(() => {
          if (!rawData && !isLoadingRef.current) {
            fetchDashboardData();
          }
        }, 2000);
      }
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [rawData]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optimized chart data transformation
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!rawData) return [];

    const monthlyMap = new Map<string, ChartDataPoint>();

    // Pre-calculate month mapping for faster sorting
    const monthToNumber: Record<string, number> = {
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

    // Process order data with minimal object creation
    if (rawData.lsOrderGraphDto?.length) {
      for (const item of rawData.lsOrderGraphDto) {
        const existing = monthlyMap.get(item.dateValue);
        if (existing) {
          existing.orders += item.amountValue;
          existing.orderCount += item.count;
        } else {
          monthlyMap.set(item.dateValue, {
            month: item.dateValue,
            orders: item.amountValue,
            quotes: 0,
            orderCount: item.count,
            quoteCount: 0,
            dateValue: item.dateValue,
          });
        }
      }
    }

    // Process quote data with minimal object creation
    if (rawData.lsQuoteGraphDto?.length) {
      for (const item of rawData.lsQuoteGraphDto) {
        const existing = monthlyMap.get(item.dateValue);
        if (existing) {
          existing.quotes += item.amountValue;
          existing.quoteCount += item.count;
        } else {
          monthlyMap.set(item.dateValue, {
            month: item.dateValue,
            orders: 0,
            quotes: item.amountValue,
            orderCount: 0,
            quoteCount: item.count,
            dateValue: item.dateValue,
          });
        }
      }
    }

    // Optimized sorting with pre-parsed dates
    const result = Array.from(monthlyMap.values()).sort((a, b) => {
      const aSplit = a.dateValue.split(" ");
      const bSplit = b.dateValue.split(" ");

      const aYear = parseInt(aSplit[1] || "0");
      const bYear = parseInt(bSplit[1] || "0");

      if (aYear !== bYear) return aYear - bYear;

      return (
        (monthToNumber[aSplit[0]?.slice(0, 3) || ""] || 0) -
        (monthToNumber[bSplit[0]?.slice(0, 3) || ""] || 0)
      );
    });

    return result;
  }, [rawData]);

  // Optimized summary data calculation with useMemo
  const summaryData = useMemo((): DashboardSummaryData | null => {
    if (!rawData || chartData.length === 0) return null;

    const totals = chartData.reduce(
      (acc, item) => ({
        orderAmount: acc.orderAmount + item.orders,
        quoteAmount: acc.quoteAmount + item.quotes,
        orderCount: acc.orderCount + item.orderCount,
        quoteCount: acc.quoteCount + item.quoteCount,
      }),
      { orderAmount: 0, quoteAmount: 0, orderCount: 0, quoteCount: 0 }
    );

    // Calculate trend efficiently
    let trend: "up" | "down" | "stable" = "stable";
    let trendPercentage = 0;

    if (chartData.length >= 2) {
      const recent = chartData[chartData.length - 1];
      const previous = chartData[chartData.length - 2];

      if (recent && previous) {
        const recentTotal = recent.orders + recent.quotes;
        const previousTotal = previous.orders + previous.quotes;

        if (previousTotal > 0) {
          trendPercentage =
            ((recentTotal - previousTotal) / previousTotal) * 100;
          trend =
            trendPercentage > 5
              ? "up"
              : trendPercentage < -5
                ? "down"
                : "stable";
        }
      }
    }

    return {
      totalOrderAmount: totals.orderAmount,
      totalQuoteAmount: totals.quoteAmount,
      totalOrderCount: totals.orderCount,
      totalQuoteCount: totals.quoteCount,
      dateRange:
        chartData.length > 0
          ? `${chartData[0]?.dateValue || ""} - ${chartData[chartData.length - 1]?.dateValue || ""}`
          : "No data",
      trend,
      trendPercentage: Math.abs(trendPercentage),
    };
  }, [chartData, rawData]);

  const formatNumber = useCallback((value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-32" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Dashboard Loading Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            disabled={loading}
          >
            {loading ? "Retrying..." : "Retry Now"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value => formatNumber(value)}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]?.payload as ChartDataPoint;
                  if (data) {
                    // Dynamic values from API response
                    const dateValue = data.dateValue || "N/A";
                    const totalOrders =
                      (data.orderCount || 0) + (data.quoteCount || 0);

                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border min-w-[200px]">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Date Value:</span>
                            <span className="font-semibold">{dateValue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Total Orders:</span>
                            <span className="font-semibold">{totalOrders}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              }}
            />
            <Area
              dataKey="quotes"
              type="natural"
              fill="var(--color-quotes)"
              fillOpacity={0.4}
              stroke="var(--color-quotes)"
              stackId="a"
            />
            <Area
              dataKey="orders"
              type="natural"
              fill="var(--color-orders)"
              fillOpacity={0.4}
              stroke="var(--color-orders)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {summaryData?.trend === "up" ? (
                <>
                  Trending up by {summaryData.trendPercentage.toFixed(1)}% this
                  month
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </>
              ) : summaryData?.trend === "down" ? (
                <>
                  Trending down by {summaryData.trendPercentage.toFixed(1)}%
                  this month
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </>
              ) : (
                <>Stable performance this month</>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {summaryData?.dateRange || "No data available"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
