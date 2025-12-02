"use client";

import { statusColor } from "@/components/custom/statuscolors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardOrders } from "@/hooks/useDashboardData";
import { Order } from "@/types/dashboard/DasbordOrderstable/DashboardOrdersTable";
import { ArrowDownIcon, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { DashboardOrdersTableSkeleton } from "../DashboardSkeletons";

const { createElement: h } = React;

export default function DashboardOrdersTable() {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order;
    direction: "asc" | "desc";
  }>({ key: "orderName", direction: "desc" });
  const [displayCount] = useState(10);
  const router = useRouter();
  const t = useTranslations("dashboard");

  const {
    data: result,
    isLoading: loading,
    error,
    isError,
    isRefetching: isRefreshing,
  } = useDashboardOrders({
    userId: "1032", // You might want to make this dynamic
    companyId: "8690", // You might want to make this dynamic
    offset: 0,
    limit: 10,
  });

  // Process the API response data
  const { orders, totalCount } = useMemo(() => {
    let ordersData: Order[] = [];
    let totalCount = 0;

    // Handle the specific API response format
    const apiResult = result as {
      status?: string;
      data?: {
        ordersResponse?: Order[];
        totalOrderCount?: number;
      };
    };

    if (
      apiResult &&
      typeof apiResult === "object" &&
      apiResult.status === "success" &&
      apiResult.data
    ) {
      if (Array.isArray(apiResult.data.ordersResponse)) {
        ordersData = apiResult.data.ordersResponse;
        totalCount =
          apiResult.data.totalOrderCount ||
          apiResult.data.ordersResponse.length;
      }
    }

    return { orders: ordersData, totalCount };
  }, [result]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
      if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [sortConfig, orders]);

  const displayedOrders = useMemo(() => {
    return sortedOrders.slice(0, displayCount);
  }, [sortedOrders, displayCount]);

  const handleShowMore = () => {
    router.push(`/landing/orderslanding`);
  };

  const handleSort = (key: keyof Order) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === "asc"
          ? { key, direction: "desc" }
          : { key, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (columnKey: keyof Order) => {
    if (sortConfig?.key !== columnKey) {
      return h(ArrowUpDown, { className: "ml-2 h-4 w-4 opacity-50" });
    }
    return sortConfig.direction === "desc"
      ? h(ArrowDownIcon, { className: "ml-2 h-4 w-4" })
      : h(ArrowUpDown, { className: "ml-2 h-4 w-4 rotate-180" });
  };

  return h(
    "div",
    { className: "" },
    loading || isRefreshing
      ? h(
        DashboardOrdersTableSkeleton
      )
      : h(
          Card,
          {
            className:
              "w-full bg-background rounded-lg shadow-sm border border-border !py-0 !gap-0 h-[600px] flex flex-col",
          },
          h(
            CardHeader,
            { className: "px-4 pt-4 pb-4 border-b border-border" },
            h(
              "div",
              { className: "flex justify-start" },
              h(
                CardTitle,
                { className: "leading-none font-semibold text-foreground" },
                h("span", {}, `${t("historyOfOrders")} `),
                totalCount > 0 &&
                  h(
                    "span",
                    { className: "text-sm font-semibold text-muted-foreground" },
                    `(${totalCount})`
                  )
              )
            )
          ),
          h(
            CardContent,
            { className: "p-0 flex-1 overflow-auto" },
            h(
              "div",
              { className: "overflow-hidden" },
              h(
                "div",
                { className: "overflow-x-auto" },
                h(
                  Table,
                  { className: "w-full" },
                  h(
                    TableHeader,
                    {},
                    h(
                      TableRow,
                      { className: "bg-muted border-b border-border hover:bg-muted" },
                      h(
                        TableHead,
                        {
                          className:
                            "text-xs font-medium text-foreground px-3 py-1 text-left",
                          scope: "col",
                        },
                        h(
                          "span",
                          {
                            className:
                              "inline-flex items-center cursor-pointer hover:text-foreground",
                            onClick: () => handleSort("orderIdentifier"),
                            role: "button",
                            tabIndex: 0,
                          },
                          t("orderId"),
                          getSortIcon("orderIdentifier")
                        )
                      ),
                      h(
                        TableHead,
                        {
                          className:
                            "text-xs font-medium text-foreground px-3 py-1 text-left",
                          scope: "col",
                        },
                        h(
                          "span",
                          {
                            className: "inline-flex items-center cursor-pointer hover:text-foreground",
                            onClick: () => handleSort("orderName"),
                            role: "button",
                            tabIndex: 0,
                          },
                          t("name"),
                          getSortIcon("orderName")
                        )
                      ),

                      h(
                        TableHead,
                        {
                          className:
                            "text-xs font-medium text-foreground px-3 py-1 text-center",
                          scope: "col",
                        },
                        h(
                          "span",
                          {
                            className:
                              "inline-flex items-center cursor-pointer hover:text-foreground",
                            onClick: () => handleSort("updatedBuyerStatus"),
                            role: "button",
                            tabIndex: 0,
                          },
                          t("status"),
                          getSortIcon("updatedBuyerStatus")
                        )
                      )
                    )
                  ),
                  h(
                    TableBody,
                    { className: "bg-background divide-y divide-border" },
                    isError
                      ? h(
                          TableRow,
                          {},
                          h(
                            TableCell,
                            {
                              colSpan: 3,
                            className:
                              "px-3 py-3 text-center text-sm text-destructive",
                            },
                            `${t("failedToFetchOrders")} ${error instanceof Error ? error.message : "Unknown error"}`
                          )
                        )
                      : displayedOrders.length === 0
                        ? h(
                            TableRow,
                            {},
                            h(
                              TableCell,
                              {
                                colSpan: 3,
                                className:
                                  "px-3 py-3 text-center text-sm text-muted-foreground",
                              },
                              t("noOrdersFound")
                            )
                          )
                        : displayedOrders.map((order, index) =>
                            h(
                              TableRow,
                              {
                                key: order.orderIdentifier || index,
                                className: "hover:bg-muted/50 transition-colors",
                                role: "checkbox",
                                tabIndex: -1,
                              },
                              h(
                                TableCell,
                                {
                                  className: "px-4 py-3 text-sm text-foreground text-left",
                                },
                                order.orderIdentifier
                              ),
                              h(
                                TableCell,
                                {
                                  className: "px-4 py-3 text-sm text-foreground text-left",
                                },
                                order.orderName
                              ),

                              h(
                                TableCell,
                                {
                                  className: "px-4 py-3 text-center",
                                },
                                h(
                                  "span",
                                  {
                                    className:
                                      "px-1 py-0.5 rounded text-xs font-medium",
                                    style: {
                                      backgroundColor: `${statusColor(order.updatedBuyerStatus)}20`,
                                      color: statusColor(
                                        order.updatedBuyerStatus
                                      ),
                                    },
                                  },
                                  order.updatedBuyerStatus
                                )
                              )
                            )
                          )
                  )
                )
              )
            )
          ),
          totalCount > 10 &&
            h(
              CardFooter,
              {
                className:
                  "flex justify-end px-2 py-2 !pt-2 border-t border-border",
              },
              h(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: handleShowMore,
                  className:
                    "text-foreground hover:bg-muted/50 border-border hover:border-border normal-case text-sm font-medium px-3 py-1 min-h-[32px] transition-all cursor-pointer",
                },
                t("showMore")
              )
            )
        )
  );
}
