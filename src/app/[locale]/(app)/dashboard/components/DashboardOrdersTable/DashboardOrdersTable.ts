"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { statusColor } from "@/components/custom/statuscolors";

const { createElement: h } = React;

interface CurrencySymbol {
  currencyCode: string;
  decimal: string;
  description: string;
  id: number;
  precision: number;
  symbol: string;
  tenantId: number;
  thousand: string;
}

interface OrderUser {
  id: number;
  name: string;
  email: string;
}

interface Order {
  SPRRequested: boolean;
  buyerBranchName: string;
  buyerCompanyName: string;
  createdDate: string;
  currencySymbol: CurrencySymbol;
  erpError: string | null;
  erpId: string;
  grandTotal: number;
  itemcount: number;
  lastUpdatedDate: string;
  orderIdentifier: string;
  orderName: string;
  orderUsers: OrderUser[] | null;
  quotationIdentifier: string | null;
  requiredDate: string | null;
  sellerBranchName: string;
  sellerCompanyName: string;
  soldToCode: string;
  subTotal: number;
  taxableAmount: number;
  updatedBuyerStatus: string;
  updatedSellerStatus: string;
  vendorId: string | null | number;
}

export default function DashboardOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order;
    direction: "asc" | "desc";
  }>({ key: "orderName", direction: "desc" });
  const [displayCount] = useState(10);
  const router = useRouter();
  const locale = useLocale();

  const fetchOrders = async (offset: number = 0, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/orders?offset=${offset}&limit=${limit}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.error || "Unknown error"}`
        );
      }

      const result = await response.json();

      let ordersData: Order[] = [];
      let totalCount = 0;

      // Handle the specific API response format
      if (
        result &&
        typeof result === "object" &&
        result.status === "success" &&
        result.data
      ) {
        if (Array.isArray(result.data.ordersResponse)) {
          ordersData = result.data.ordersResponse;
          totalCount =
            result.data.totalOrderCount || result.data.ordersResponse.length;
        }
      }

      if (ordersData.length > 0 || Array.isArray(ordersData)) {
        if (offset === 0) {
          setOrders(ordersData);
        } else {
          setOrders(prev => [...prev, ...ordersData]);
        }
        setTotalCount(totalCount);
      } else {
        setOrders([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError(
        `Failed to fetch orders: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0, 10);
  }, []);

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
    router.push(`/${locale}/landing/orderslanding`);
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
    { className: "p-3" },
    h(
      Card,
      {
        className:
          "w-full bg-white rounded-lg shadow-sm border border-gray-200 !py-0 !gap-0",
      },
      h(
        CardHeader,
        { className: "px-4 pt-7 pb-2 border-b border-gray-200" },
        h(
          "div",
          { className: "flex justify-start" },
          h(
            CardTitle,
            { className: "text-sm font-medium text-gray-900 text-center" },
            `History of Orders ${totalCount > 0 ? `(${totalCount})` : ""}`
          )
        )
      ),
      h(
        CardContent,
        { className: "p-0" },
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
                { className: "bg-gray-50" },
                h(
                  TableRow,
                  { className: "border-b border-gray-100" },
                  h(
                    TableHead,
                    {
                      className:
                        "text-xs font-medium text-gray-600 px-3 py-1 text-left",
                      scope: "col",
                    },
                    h(
                      "span",
                      {
                        className:
                          "inline-flex items-center cursor-pointer hover:text-gray-900",
                        onClick: () => handleSort("orderIdentifier"),
                        role: "button",
                        tabIndex: 0,
                      },
                      "Order Id",
                      getSortIcon("orderIdentifier")
                    )
                  ),
                  h(
                    TableHead,
                    {
                      className:
                        "text-xs font-medium text-gray-600 px-3 py-1 text-left",
                      scope: "col",
                    },
                    h(
                      "span",
                      {
                        className: `inline-flex items-center cursor-pointer hover:text-gray-900 ${sortConfig.key === "orderName" ? "text-gray-900" : ""}`,
                        onClick: () => handleSort("orderName"),
                        role: "button",
                        tabIndex: 0,
                      },
                      "Name",
                      getSortIcon("orderName")
                    )
                  ),
                  h(
                    TableHead,
                    {
                      className:
                        "text-xs font-medium text-gray-600 px-3 py-1 text-left",
                      scope: "col",
                    },
                    h(
                      "span",
                      {
                        className:
                          "inline-flex items-center cursor-pointer hover:text-gray-900",
                        onClick: () => handleSort("requiredDate"),
                        role: "button",
                        tabIndex: 0,
                      },
                      "Required Date",
                      getSortIcon("requiredDate")
                    )
                  ),
                  h(
                    TableHead,
                    {
                      className:
                        "text-xs font-medium text-gray-600 px-3 py-1 text-right",
                      scope: "col",
                    },
                    h(
                      "span",
                      {
                        className:
                          "inline-flex items-center cursor-pointer hover:text-gray-900 justify-end w-full",
                        onClick: () => handleSort("updatedBuyerStatus"),
                        role: "button",
                        tabIndex: 0,
                      },
                      "Status",
                      getSortIcon("updatedBuyerStatus")
                    )
                  )
                )
              ),
              h(
                TableBody,
                { className: "bg-white divide-y divide-gray-100" },
                loading
                  ? h(
                      TableRow,
                      {},
                      h(
                        TableCell,
                        {
                          colSpan: 4,
                          className:
                            "px-3 py-3 text-center text-sm text-gray-500",
                        },
                        "Loading orders..."
                      )
                    )
                  : error
                    ? h(
                        TableRow,
                        {},
                        h(
                          TableCell,
                          {
                            colSpan: 4,
                            className:
                              "px-3 py-3 text-center text-sm text-red-500",
                          },
                          error
                        )
                      )
                    : displayedOrders.length === 0
                      ? h(
                          TableRow,
                          {},
                          h(
                            TableCell,
                            {
                              colSpan: 4,
                              className:
                                "px-3 py-3 text-center text-sm text-gray-500",
                            },
                            "No orders found"
                          )
                        )
                      : displayedOrders.map((order, index) =>
                          h(
                            TableRow,
                            {
                              key: order.orderIdentifier || index,
                              className: "hover:bg-gray-50 transition-colors",
                              role: "checkbox",
                              tabIndex: -1,
                            },
                            h(
                              TableCell,
                              {
                                className: "px-4 py-3 text-sm text-gray-900",
                              },
                              order.orderIdentifier
                            ),
                            h(
                              TableCell,
                              {
                                className: "px-4 py-3 text-sm text-gray-900",
                              },
                              order.orderName
                            ),
                            h(
                              TableCell,
                              {
                                className: "px-4 py-3 text-sm text-gray-500",
                              },
                              order.requiredDate ||
                                order.createdDate?.split(" ")[0] ||
                                ""
                            ),
                            h(
                              TableCell,
                              {
                                className: "px-4 py-3 text-right",
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
          { className: "flex justify-end py-3 px-6 border-t border-gray-200" },
          h(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handleShowMore,
              className:
                "text-black hover:bg-black-50 border-black-200 uppercase text-xs font-medium px-4 py-2",
            },
            "Show More"
          )
        )
    )
  );
}
