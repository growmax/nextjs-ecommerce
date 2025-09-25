/**
 * Dashboard API Type Definitions
 * Complete request and response structures for the dashboard API
 */

// ============================================================================
// REQUEST STRUCTURES
// ============================================================================

/**
 * Query parameters for dashboard API request
 * These are sent as URL query parameters
 */
export interface DashboardRequestParams {
  userId: number; // User ID for data filtering
  companyId: number; // Company ID for multi-tenant support
  offset: number; // Pagination offset (default: 0)
  limit: number; // Pagination limit (default: 99999999)
  currencyId: number; // Currency for monetary values
}

/**
 * Filter body for dashboard API request
 * These are sent in the POST request body
 */
export interface DashboardFilterBody {
  accountId: number[]; // Filter by specific account IDs
  endDate: string; // ISO 8601 format: "2025-12-31T23:59:59.999Z"
  endValue: number | null; // Maximum value filter
  identifier: string; // Search by identifier
  name: string; // Search by name
  startDate: string; // ISO 8601 format: "2025-01-01T00:00:00.000Z"
  startValue: number | null; // Minimum value filter
  status: string[]; // Filter by status codes
}

// ============================================================================
// RESPONSE STRUCTURES
// ============================================================================

/**
 * Main API Response wrapper
 * This is the top-level structure returned by the API
 */
export interface DashboardApiResponse {
  data: DashboardData;
  message: string | null;
  status: "success" | "error";
}

/**
 * Enhanced API Response with metadata
 * Includes additional tracking information
 */
export interface DashboardAPISuccess extends DashboardApiResponse {
  timestamp: string;
  requestId: string;
  metadata?: {
    params: DashboardRequestParams;
    filters: DashboardFilterBody;
  };
}

/**
 * Error response structure
 */
export interface DashboardAPIError {
  error: string;
  message?: string;
  code?: string;
  details?: unknown;
  timestamp: string;
  requestId: string;
}

/**
 * Core dashboard data structure
 * Contains all dashboard metrics and graph data
 */
export interface DashboardData {
  // Account Metrics
  activeAccounts: number; // Number of active accounts
  totalAccounts: number; // Total number of accounts
  totalActiveUsers: number | null; // Total active users (can be null)
  totalBillingValues: number | null; // Total billing amount (can be null)
  totalCustomerLs: number | null; // Total customers (can be null)

  // Graph Type Configurations
  avgNpsGraphType: string | null; // Average NPS graph type indicator
  buyerorderGraphType: string | null; // Buyer order graph type
  invoiceGraphType: string | null; // Invoice graph type
  orderGraphType: string; // Order graph type: "M" (Monthly), "Q" (Quarterly), "Y" (Yearly)
  quoteGraphType: string; // Quote graph type: "M" (Monthly), "Q" (Quarterly), "Y" (Yearly)

  // Main Graph Data Arrays
  lsOrderGraphDto: DashboardGraphItem[] | null; // Order transaction data
  lsQuoteGraphDto: DashboardGraphItem[] | null; // Quote transaction data
  lsQuoteStatusGraphDto: QuoteStatusGraphItem[] | null; // Quote status summary

  // Additional DTOs (structure may vary, using Record for flexibility)
  lsAvgNpsGraphDto: Record<string, unknown> | null; // Average NPS graph data
  lsBuyerorderGraphDto: Record<string, unknown> | null; // Buyer order graph data
  lsInvoiceGraphDto: Record<string, unknown> | null; // Invoice graph data
  lsSprGraphDto: Record<string, unknown> | null; // SPR graph data

  // Top Performers
  topOrderDto: TopPerformerItem[]; // Top customers by order value
  topQuoteDto: TopPerformerItem[]; // Top customers by quote value
}

/**
 * Graph item structure for orders and quotes
 * Used in lsOrderGraphDto and lsQuoteGraphDto arrays
 */
export interface DashboardGraphItem {
  amountValue: number; // Monetary value (can have decimals)
  avgScore: number | null; // Average score metric (currently null in API)
  count: number; // Number of items
  dateValue: string; // Date format: "Jul 2025", "Aug 2025", etc.
  status: string; // Status code (see OrderStatus and QuoteStatus enums)
}

/**
 * Quote status specific graph item
 * Used in lsQuoteStatusGraphDto array
 */
export interface QuoteStatusGraphItem {
  amountValue: number; // Total amount for this status
  count: number; // Total count for this status
  quoteStatus: string; // Quote status name
}

/**
 * Top performer item structure
 * Note: API has a typo "amountVale" instead of "amountValue"
 */
export interface TopPerformerItem {
  amountVale: number; // Total amount (preserving API typo for compatibility)
  name: string; // Company/Customer name
}

// ============================================================================
// STATUS ENUMS
// ============================================================================

/**
 * Order status enumeration
 * All possible order statuses from the API
 */
export enum OrderStatus {
  INVOICED = "INVOICED",
  ORDER_ACKNOWLEDGED = "ORDER ACKNOWLEDGED",
  ORDER_BOOKED = "ORDER BOOKED",
  ORDER_RECEIVED = "ORDER RECEIVED",
  PARTIALLY_SHIPPED = "PARTIALLY SHIPPED",
  EDIT_ENABLED = "EDIT ENABLED",
  REQUESTED_EDIT = "REQUESTED EDIT",
}

/**
 * Quote status enumeration
 * All possible quote statuses from the API
 */
export enum QuoteStatus {
  IN_PROGRESS = "IN PROGRESS",
  OPEN = "OPEN",
  ORDER_PLACED = "ORDER PLACED",
  QUOTE_SENT = "QUOTE SENT",
  CANCELLED = "CANCELLED",
}

/**
 * Graph type enumeration
 */
export enum GraphType {
  MONTHLY = "M",
  QUARTERLY = "Q",
  YEARLY = "Y",
}

// ============================================================================
// VALIDATION HELPER TYPES
// ============================================================================

/**
 * Request validation interface
 * Used for initial parameter validation from URL
 */
export interface DashboardRequestValidation {
  userId: string | null;
  companyId: string | null;
  currencyId: string | null;
  offset?: string | null;
  limit?: string | null;
}

// ============================================================================
// TRANSFORMED DATA TYPES
// ============================================================================

/**
 * Transformed monthly data for chart display
 */
export interface MonthlyChartData {
  month: string; // Full month name with year
  dateValue: string; // Original date value from API
  orders: number; // Total order value
  quotes: number; // Total quote value
  orderCount: number; // Number of orders
  quoteCount: number; // Number of quotes
  orderStatuses: Record<string, number>; // Order amounts by status
  quoteStatuses: Record<string, number>; // Quote amounts by status
  avgScore?: number | null; // Average score if available
}

/**
 * Dashboard summary statistics
 */
export interface DashboardSummary {
  totalOrderValue: number;
  totalQuoteValue: number;
  totalOrderCount: number;
  totalQuoteCount: number;
  activeAccounts: number;
  totalAccounts: number;
  topOrderCustomer: string | null;
  topQuoteCustomer: string | null;
  quoteConversionRate: number;
  averageOrderValue: number;
  averageQuoteValue: number;
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * API configuration interface
 */
export interface DashboardApiConfig {
  baseUrl: string;
  endpoint: string;
  tenant: string;
  timeout?: number;
  retryAttempts?: number;
  cacheTimeout?: number;
}

// ============================================================================
// EXPORT TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid DashboardApiResponse
 */
export function isDashboardApiResponse(
  value: unknown
): value is DashboardApiResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "status" in value &&
    "message" in value
  );
}

/**
 * Type guard to check if a value is a valid DashboardGraphItem
 */
export function isDashboardGraphItem(
  value: unknown
): value is DashboardGraphItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "amountValue" in value &&
    "count" in value &&
    "dateValue" in value &&
    "status" in value
  );
}

/**
 * Type guard to check if error is a DashboardAPIError
 */
export function isDashboardAPIError(
  value: unknown
): value is DashboardAPIError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    "timestamp" in value &&
    "requestId" in value
  );
}
