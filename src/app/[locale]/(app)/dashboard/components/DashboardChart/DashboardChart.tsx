"use client";

import PricingFormat from "@/components/PricingFormat";
import { useDashboardChartData } from "@/hooks/useDashboardData";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { chartConfig } from "@/const/dashboard/dashboard.const";

export function DashboardChart() {
  const { data, isLoading, error, isError } = useDashboardChartData();

  const chartData = data?.chartData || [];
  const stats = data?.stats || null;
  const trendPercentage = data?.trendPercentage || 0;
  const dateRange = data?.dateRange || "Loading...";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Loading dashboard data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load dashboard data"}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0 || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  const isTrendingUp = trendPercentage > 0;

  // Custom tooltip to show all details
  const CustomTooltipContent = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Record<string, unknown>[];
    label?: string;
  }) => {
    if (active && payload && payload.length && chartData) {
      const dataPoint = chartData.find(
        (d: Record<string, unknown>) => d.month === label
      );
      if (!dataPoint) return null;

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[250px]">
          <p className="font-semibold text-sm mb-2">
            {String(dataPoint.fullMonth || label || "")}
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Revenue:</span>
              <span className="font-medium">
                <PricingFormat value={Number(dataPoint.total) || 0} />
              </span>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: chartConfig.orders.color }}
                  ></span>
                  Orders:
                </span>
                <span className="font-medium">
                  <PricingFormat value={Number(dataPoint.orders) || 0} />
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground ml-3">
                <span>Count:</span>
                <span>{Number(dataPoint.orderCount) || 0} orders</span>
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: chartConfig.quotes.color }}
                  ></span>
                  Quotes:
                </span>
                <span className="font-medium">
                  <PricingFormat value={Number(dataPoint.quotes) || 0} />
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground ml-3">
                <span>Count:</span>
                <span>{Number(dataPoint.quoteCount) || 0} quotes</span>
              </div>
            </div>

            {/* Show Order Status Breakdown if any order statuses exist */}
            {((Number(dataPoint.invoiced) || 0) > 0 ||
              (Number(dataPoint.acknowledged) || 0) > 0 ||
              (Number(dataPoint.booked) || 0) > 0 ||
              (Number(dataPoint.received) || 0) > 0 ||
              (Number(dataPoint.editEnabled) || 0) > 0 ||
              (Number(dataPoint.requestedEdit) || 0) > 0 ||
              (Number(dataPoint.partiallyShipped) || 0) > 0) && (
              <div className="border-t pt-2 space-y-1">
                <div className="text-muted-foreground">
                  Order Status Breakdown:
                </div>
                {(Number(dataPoint.invoiced) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Invoiced:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.invoiced) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.acknowledged) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Acknowledged:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.acknowledged) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.booked) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Booked:</span>
                    <span><PricingFormat value={Number(dataPoint.booked) || 0} /></span>
                  </div>
                )}
                {(Number(dataPoint.received) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Received:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.received) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.editEnabled) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Edit Enabled:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.editEnabled) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.requestedEdit) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Requested Edit:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.requestedEdit) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.partiallyShipped) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Partially Shipped:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.partiallyShipped) || 0} />
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Show Quote Status Breakdown if any quote statuses exist */}
            {((Number(dataPoint.inProgress) || 0) > 0 ||
              (Number(dataPoint.open) || 0) > 0 ||
              (Number(dataPoint.orderPlaced) || 0) > 0 ||
              (Number(dataPoint.quoteSent) || 0) > 0) && (
              <div className="border-t pt-2 space-y-1">
                <div className="text-muted-foreground">
                  Quote Status Breakdown:
                </div>
                {(Number(dataPoint.inProgress) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>In Progress:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.inProgress) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.open) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Open:</span>
                    <span><PricingFormat value={Number(dataPoint.open) || 0} /></span>
                  </div>
                )}
                {(Number(dataPoint.orderPlaced) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Order Placed:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.orderPlaced) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.quoteSent) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>Quote Sent:</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.quoteSent) || 0} />
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-2 text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Total Transactions:</span>
                <span>
                  {(Number(dataPoint.orderCount) || 0) +
                    (Number(dataPoint.quoteCount) || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview - {new Date().getFullYear()}</CardTitle>
        <CardDescription>
          Monthly orders and quotes performance with detailed statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -20,
              right: 12,
              bottom: 60,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={5}
              tickFormatter={(value: number) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />
            <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
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
              {isTrendingUp ? "Trending up by" : "Trending down by"}{" "}
              {Math.abs(trendPercentage).toFixed(1)}% this month
              {isTrendingUp ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {dateRange} • Total Revenue:{" "}
              <PricingFormat value={Number(stats?.totalRevenue) || 0} /> •{" "}
              {Number(stats?.totalTransactions) || 0} transactions
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
