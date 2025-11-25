"use client";

import PricingFormat from "@/components/PricingFormat";
import { useDashboardChartData } from "@/hooks/useDashboardData/useDashboardData";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { chartConfig as baseChartConfig } from "@/const/dashboard/dashboard.const";

export function DashboardChart() {
  const { data, isLoading, error, isError } = useDashboardChartData();
  const t = useTranslations("dashboard");
  const tMessages = useTranslations("messages");
  const tNav = useTranslations("navigation");

  // Create chart config with translated labels
  const chartConfig = {
    orders: {
      label: tNav("orders"),
      color: baseChartConfig.orders.color,
    },
    quotes: {
      label: tNav("quotes"),
      color: baseChartConfig.quotes.color,
    },
  };

  const chartData = data?.chartData || [];
  const stats = data?.stats || null;
  const trendPercentage = data?.trendPercentage || 0;
  const dateRange = data?.dateRange || tMessages("loading");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("revenueOverview")}</CardTitle>
          <CardDescription>{t("loadingDashboardData")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">{t("loadingChart")}</div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("revenueOverview")}</CardTitle>
          <CardDescription>{t("errorLoadingData")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-destructive">
            {error instanceof Error ? error.message : t("failedToLoadData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0 || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("revenueOverview")}</CardTitle>
          <CardDescription>{t("noData")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">{t("noDataForPeriod")}</div>
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
              <span className="text-muted-foreground">{t("totalRevenue")}</span>
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
                  {t("orders")}
                </span>
                <span className="font-medium">
                  <PricingFormat value={Number(dataPoint.orders) || 0} />
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground ml-3">
                <span>{t("count")}</span>
                <span>
                  {Number(dataPoint.orderCount) || 0} {t("orderCount")}
                </span>
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: chartConfig.quotes.color }}
                  ></span>
                  {t("quotes")}
                </span>
                <span className="font-medium">
                  <PricingFormat value={Number(dataPoint.quotes) || 0} />
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground ml-3">
                <span>{t("count")}</span>
                <span>
                  {Number(dataPoint.quoteCount) || 0} {t("quoteCount")}
                </span>
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
                  {t("orderStatusBreakdown")}
                </div>
                {(Number(dataPoint.invoiced) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("invoiced")}</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.invoiced) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.acknowledged) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("acknowledged")}</span>
                    <span>
                      <PricingFormat
                        value={Number(dataPoint.acknowledged) || 0}
                      />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.booked) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("booked")}</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.booked) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.received) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("received")}</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.received) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.editEnabled) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("editEnabled")}</span>
                    <span>
                      <PricingFormat
                        value={Number(dataPoint.editEnabled) || 0}
                      />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.requestedEdit) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("requestedEdit")}</span>
                    <span>
                      <PricingFormat
                        value={Number(dataPoint.requestedEdit) || 0}
                      />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.partiallyShipped) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("partiallyShipped")}</span>
                    <span>
                      <PricingFormat
                        value={Number(dataPoint.partiallyShipped) || 0}
                      />
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
                  {t("quoteStatusBreakdown")}
                </div>
                {(Number(dataPoint.inProgress) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("inProgress")}</span>
                    <span>
                      <PricingFormat
                        value={Number(dataPoint.inProgress) || 0}
                      />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.open) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("open")}</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.open) || 0} />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.orderPlaced) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("orderPlaced")}</span>
                    <span>
                      <PricingFormat
                        value={Number(dataPoint.orderPlaced) || 0}
                      />
                    </span>
                  </div>
                )}
                {(Number(dataPoint.quoteSent) || 0) > 0 && (
                  <div className="flex justify-between items-center ml-3">
                    <span>{t("quoteSent")}</span>
                    <span>
                      <PricingFormat value={Number(dataPoint.quoteSent) || 0} />
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-2 text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>{t("totalTransactions")}</span>
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
        <CardTitle>
          {t("revenueOverviewYear", { year: new Date().getFullYear() })}
        </CardTitle>
        <CardDescription>{t("monthlyPerformance")}</CardDescription>
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
              {isTrendingUp ? t("trendingUpBy") : t("trendingDownBy")}{" "}
              {Math.abs(trendPercentage).toFixed(1)}% {t("thisMonth")}
              {isTrendingUp ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {dateRange} • {t("totalRevenue")}{" "}
              <PricingFormat value={Number(stats?.totalRevenue) || 0} /> •{" "}
              {Number(stats?.totalTransactions) || 0} {t("transactions")}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
