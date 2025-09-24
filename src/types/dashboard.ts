export interface DashboardGraphItem {
  amountValue: number;
  avgScore: number | null;
  count: number;
  dateValue: string;
  status: string;
}

export interface QuoteStatusGraphItem {
  amountValue: number;
  count: number;
  quoteStatus: string;
}

export interface TopPerformerItem {
  amountVale: number; // Note: API has typo "amountVale" instead of "amountValue"
  name: string;
}

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

export interface DashboardApiResponse {
  data: DashboardData;
  message: string | null;
  status: string;
}

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
