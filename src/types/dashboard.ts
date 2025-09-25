// Dashboard API Types
export interface DashboardFilterParams {
  accountId: number[];
  endDate: string;
  endValue: number | null;
  identifier: string;
  name: string;
  startDate: string;
  startValue: number | null;
  status: string[];
}

export interface DashboardQueryParams {
  userId: number;
  companyId: number;
  offset: number;
  limit: number;
  currencyId: number;
}

// Dashboard Graph Item (from API response)
export interface DashboardGraphItem {
  amountValue: number;
  avgScore: number | null;
  count: number;
  dateValue: string;
  status: string;
}

// Quote Status Graph Item
export interface QuoteStatusGraphItem {
  amountValue: number;
  count: number;
  quoteStatus: string;
}

// Top Performer Item
export interface TopPerformerItem {
  amountVale: number; // Note: API has typo "amountVale" instead of "amountValue"
  name: string;
}

// Main Dashboard Data Structure
export interface DashboardData {
  activeAccounts: number;
  avgNpsGraphType: string | null;
  buyerorderGraphType: string | null;
  invoiceGraphType: string | null;
  lsAvgNpsGraphDto: Record<string, unknown> | null;
  lsBuyerorderGraphDto: Record<string, unknown> | null;
  lsInvoiceGraphDto: Record<string, unknown> | null;
  lsOrderGraphDto: DashboardGraphItem[] | null;
  lsQuoteGraphDto: DashboardGraphItem[] | null;
  lsQuoteStatusGraphDto: QuoteStatusGraphItem[] | null;
  lsSprGraphDto: Record<string, unknown> | null;
  orderGraphType: string;
  quoteGraphType: string;
  topOrderDto: TopPerformerItem[];
  topQuoteDto: TopPerformerItem[];
  totalAccounts: number;
  totalActiveUsers: number | null;
  totalBillingValues: number | null;
  totalCustomerLs: number | null;
}

// API Response Interface
export interface DashboardApiResponse {
  data: DashboardData;
  message: string | null;
  status: string;
}

// Enhanced API Response with metadata
export interface DashboardAPISuccess extends DashboardApiResponse {
  timestamp: string;
  requestId: string;
}

// Error Response Interface
export interface DashboardAPIError {
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
  requestId: string;
}

// Request Validation Interface
export interface DashboardRequestValidation {
  userId: string | null;
  companyId: string | null;
  currencyId: string | null;
  offset?: string;
  limit?: string;
}
