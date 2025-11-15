import type {
  DashboardApiResponse,
  DashboardFilterParams,
  DashboardQueryParams,
} from "@/types/dashboard";
import { coreCommerceClient } from "../../client";
import { BaseService } from "../BaseService";

export class DashboardService extends BaseService<DashboardService> {
  protected defaultClient = coreCommerceClient;

  async getDashboardData(
    params: DashboardQueryParams,
    filters: DashboardFilterParams
  ): Promise<DashboardApiResponse> {
    const { userId, companyId, offset, limit, currencyId } = params;

    return (await this.call(
      `/dashBoardService/findByDashBoardFilterNew?userId=${userId}&companyId=${companyId}&offset=${offset}&limit=${limit}&currencyId=${currencyId}`,
      filters,
      "POST"
    )) as DashboardApiResponse;
  }

  /**
   * Transform dashboard data for chart visualization
   */
  transformOrderDataForChart(data: DashboardApiResponse) {
    const monthlyData = new Map<
      string,
      {
        orders: number;
        quotes: number;
        orderCount: number;
        quoteCount: number;
        invoiced: number;
        acknowledged: number;
        booked: number;
        received: number;
        editEnabled: number;
        requestedEdit: number;
        partiallyShipped: number;
        // Quote statuses
        inProgress: number;
        open: number;
        orderPlaced: number;
        quoteSent: number;
      }
    >();

    // Get all unique dateValues from the API data
    const allDateValues = new Set<string>();

    // Collect all unique dateValues from orders
    if (data.data.lsOrderGraphDto) {
      data.data.lsOrderGraphDto.forEach(item => {
        allDateValues.add(item.dateValue);
      });
    }

    // Collect all unique dateValues from quotes
    if (data.data.lsQuoteGraphDto) {
      data.data.lsQuoteGraphDto.forEach(item => {
        allDateValues.add(item.dateValue);
      });
    }

    // Initialize all dateValues with empty data
    allDateValues.forEach(dateValue => {
      monthlyData.set(dateValue, {
        orders: 0,
        quotes: 0,
        orderCount: 0,
        quoteCount: 0,
        invoiced: 0,
        acknowledged: 0,
        booked: 0,
        received: 0,
        editEnabled: 0,
        requestedEdit: 0,
        partiallyShipped: 0,
        inProgress: 0,
        open: 0,
        orderPlaced: 0,
        quoteSent: 0,
      });
    });

    // Process order data - aggregate ALL statuses by dateValue
    if (data.data.lsOrderGraphDto) {
      data.data.lsOrderGraphDto.forEach(item => {
        const existing = monthlyData.get(item.dateValue);
        if (!existing) return;

        // Add to total orders amount
        existing.orders += item.amountValue;
        existing.orderCount += item.count;

        // Track ALL specific statuses from actual data
        switch (item.status) {
          case "INVOICED":
            existing.invoiced += item.amountValue;
            break;
          case "ORDER ACKNOWLEDGED":
            existing.acknowledged += item.amountValue;
            break;
          case "ORDER BOOKED":
            existing.booked += item.amountValue;
            break;
          case "ORDER RECEIVED":
            existing.received += item.amountValue;
            break;
          case "EDIT ENABLED":
            existing.editEnabled += item.amountValue;
            break;
          case "REQUESTED EDIT":
            existing.requestedEdit += item.amountValue;
            break;
          case "PARTIALLY SHIPPED":
            existing.partiallyShipped += item.amountValue;
            break;
        }
      });
    }

    // Process quote data - aggregate ALL statuses by dateValue
    if (data.data.lsQuoteGraphDto) {
      data.data.lsQuoteGraphDto.forEach(item => {
        const existing = monthlyData.get(item.dateValue);
        if (!existing) return;

        // Add to total quotes amount
        existing.quotes += item.amountValue;
        existing.quoteCount += item.count;

        // Track ALL specific quote statuses from actual data
        switch (item.status) {
          case "IN PROGRESS":
            existing.inProgress += item.amountValue;
            break;
          case "OPEN":
            existing.open += item.amountValue;
            break;
          case "ORDER PLACED":
            existing.orderPlaced += item.amountValue;
            break;
          case "QUOTE SENT":
            existing.quoteSent += item.amountValue;
            break;
        }
      });
    }

    // Sort dateValues chronologically - dynamically handle any date format
    const sortedEntries = Array.from(monthlyData.entries()).sort((a, b) => {
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Parse dateValue dynamically
      const aParts = a[0].split(" ");
      const bParts = b[0].split(" ");

      const aMonth = aParts[0] || "";
      const bMonth = bParts[0] || "";
      const aYear = parseInt(aParts[1] || new Date().getFullYear().toString());
      const bYear = parseInt(bParts[1] || new Date().getFullYear().toString());

      // Sort by year first, then by month
      if (aYear !== bYear) return aYear - bYear;
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

    // Convert to chart format with ALL aggregated data from API
    return sortedEntries.map(([dateValue, values]) => {
      // Convert abbreviated month to full month name dynamically
      const monthAbbrev = dateValue.split(" ")[0] || "";
      const year = dateValue.split(" ")[1] || "";
      const monthMap: { [key: string]: string } = {
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

      const fullMonthName = monthMap[monthAbbrev] || monthAbbrev;

      return {
        month: `${fullMonthName} ${year}`,
        monthAbbrev,
        fullMonth: dateValue,
        dateValue,
        orders: Math.round(values.orders),
        quotes: Math.round(values.quotes),
        total: Math.round(values.orders + values.quotes),
        orderCount: values.orderCount,
        quoteCount: values.quoteCount,
        invoiced: Math.round(values.invoiced),
        acknowledged: Math.round(values.acknowledged),
        booked: Math.round(values.booked),
        received: Math.round(values.received),
        editEnabled: Math.round(values.editEnabled),
        requestedEdit: Math.round(values.requestedEdit),
        partiallyShipped: Math.round(values.partiallyShipped),
        inProgress: Math.round(values.inProgress),
        open: Math.round(values.open),
        orderPlaced: Math.round(values.orderPlaced),
        quoteSent: Math.round(values.quoteSent),
      };
    });
  }

  /**
   * Calculate trend percentage from dashboard data
   */
  calculateTrendPercentage(data: DashboardApiResponse): number {
    if (!data.data.lsOrderGraphDto || data.data.lsOrderGraphDto.length < 2) {
      return 0;
    }

    const sortedData = [...data.data.lsOrderGraphDto].sort((a, b) => {
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const aMonth = a.dateValue.split(" ")[0] || "";
      const bMonth = b.dateValue.split(" ")[0] || "";
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

    const currentMonth = sortedData[sortedData.length - 1];
    const previousMonth = sortedData[sortedData.length - 2];

    if (!currentMonth || !previousMonth) return 0;

    const currentMonthTotal = currentMonth.amountValue;
    const previousMonthTotal = previousMonth.amountValue;

    if (previousMonthTotal === 0) return 100;

    return (
      ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
    );
  }

  /**
   * Get date range from dashboard data
   */
  getDateRange(data: DashboardApiResponse): string {
    if (!data.data.lsOrderGraphDto || data.data.lsOrderGraphDto.length === 0) {
      return "No data available";
    }

    const months = data.data.lsOrderGraphDto.map(item => item.dateValue);
    const sortedMonths = months.sort((a, b) => {
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const aMonth = a.split(" ")[0] || "";
      const bMonth = b.split(" ")[0] || "";
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

    return `${sortedMonths[0]} - ${sortedMonths[sortedMonths.length - 1]}`;
  }

  /**
   * Get comprehensive statistics from dashboard data
   */
  getComprehensiveStats(data: DashboardApiResponse) {
    const stats = {
      totalOrderValue: 0,
      totalQuoteValue: 0,
      totalOrderCount: 0,
      totalQuoteCount: 0,
      monthlyBreakdown: [] as Record<string, unknown>[],
      statusBreakdown: {
        orders: new Map<string, { value: number; count: number }>(),
        quotes: new Map<string, { value: number; count: number }>(),
      },
      topCustomers: {
        orders: data.data.topOrderDto || [],
        quotes: data.data.topQuoteDto || [],
      },
      accountMetrics: {
        activeAccounts: data.data.activeAccounts,
        totalAccounts: data.data.totalAccounts,
      },
    };

    // Calculate order statistics
    if (data.data.lsOrderGraphDto) {
      data.data.lsOrderGraphDto.forEach(item => {
        stats.totalOrderValue += item.amountValue;
        stats.totalOrderCount += item.count;

        // Group by status
        const existing = stats.statusBreakdown.orders.get(item.status) || {
          value: 0,
          count: 0,
        };
        existing.value += item.amountValue;
        existing.count += item.count;
        stats.statusBreakdown.orders.set(item.status, existing);
      });
    }

    // Calculate quote statistics
    if (data.data.lsQuoteGraphDto) {
      data.data.lsQuoteGraphDto.forEach(item => {
        stats.totalQuoteValue += item.amountValue;
        stats.totalQuoteCount += item.count;

        // Group by status
        const existing = stats.statusBreakdown.quotes.get(item.status) || {
          value: 0,
          count: 0,
        };
        existing.value += item.amountValue;
        existing.count += item.count;
        stats.statusBreakdown.quotes.set(item.status, existing);
      });
    }

    // Get monthly breakdown
    stats.monthlyBreakdown = this.transformOrderDataForChart(data);

    return {
      ...stats,
      totalRevenue: stats.totalOrderValue + stats.totalQuoteValue,
      totalTransactions: stats.totalOrderCount + stats.totalQuoteCount,
      avgOrderValue:
        stats.totalOrderCount > 0
          ? stats.totalOrderValue / stats.totalOrderCount
          : 0,
      avgQuoteValue:
        stats.totalQuoteCount > 0
          ? stats.totalQuoteValue / stats.totalQuoteCount
          : 0,
      orderStatuses: Array.from(stats.statusBreakdown.orders.entries()).map(
        ([status, data]: [string, { value: number; count: number }]) => ({
          status,
          value: Math.round(data.value),
          count: data.count,
          percentage: ((data.value / stats.totalOrderValue) * 100).toFixed(1),
        })
      ),
      quoteStatuses: Array.from(stats.statusBreakdown.quotes.entries()).map(
        ([status, data]: [string, { value: number; count: number }]) => ({
          status,
          value: Math.round(data.value),
          count: data.count,
          percentage: ((data.value / stats.totalQuoteValue) * 100).toFixed(1),
        })
      ),
    };
  }
}

export default DashboardService.getInstance();
