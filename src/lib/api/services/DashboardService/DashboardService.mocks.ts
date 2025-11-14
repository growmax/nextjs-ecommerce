// Mocks for DashboardService
// These mocks are for testing the service in isolation.

import type {
  DashboardApiResponse,
  DashboardFilterParams,
  DashboardQueryParams,
} from "@/types/dashboard";

export const mockDashboardQueryParams: DashboardQueryParams = {
  userId: 123,
  companyId: 456,
  offset: 0,
  limit: 99999999,
  currencyId: 1,
};

export const mockDashboardFilterParams: DashboardFilterParams = {
  accountId: [],
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  startValue: null,
  endValue: null,
  identifier: "",
  name: "",
  status: ["CONFIRMED"],
};

export const mockDashboardApiResponse: DashboardApiResponse = {
  data: {
    activeAccounts: 10,
    totalAccounts: 20,
    totalActiveUsers: 50,
    totalBillingValues: 100000,
    totalCustomerLs: 100,
    lsOrderGraphDto: [
      {
        amountValue: 1000,
        count: 5,
        dateValue: "Jan 2024",
        status: "INVOICED",
        avgScore: null,
      },
      {
        amountValue: 2000,
        count: 10,
        dateValue: "Feb 2024",
        status: "ORDER ACKNOWLEDGED",
        avgScore: null,
      },
    ],
    lsQuoteGraphDto: [
      {
        amountValue: 500,
        count: 3,
        dateValue: "Jan 2024",
        status: "IN PROGRESS",
        avgScore: null,
      },
    ],
    lsQuoteStatusGraphDto: [],
    topOrderDto: [],
    topQuoteDto: [],
    orderGraphType: "monthly",
    quoteGraphType: "monthly",
    avgNpsGraphType: null,
    buyerorderGraphType: null,
    invoiceGraphType: null,
    lsAvgNpsGraphDto: null,
    lsBuyerorderGraphDto: null,
    lsInvoiceGraphDto: null,
    lsSprGraphDto: null,
  },
  message: "Success",
  status: "success",
};
