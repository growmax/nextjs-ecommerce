/**
 * Dashboard API Validation Schemas
 * Runtime validation using Zod for all dashboard API types
 */

import { z } from "zod";

// ============================================================================
// REQUEST VALIDATION SCHEMAS
// ============================================================================

/**
 * Query parameters validation schema
 * These are URL query parameters for the dashboard API
 */
export const DashboardRequestParamsSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  companyId: z.number().int().positive("Company ID must be a positive integer"),
  offset: z
    .number()
    .int()
    .nonnegative("Offset must be non-negative")
    .default(0),
  limit: z.number().int().positive("Limit must be positive").default(99999999),
  currencyId: z
    .number()
    .int()
    .positive("Currency ID must be a positive integer"),
});

/**
 * Filter body validation schema
 * These are sent in the POST request body
 */
export const DashboardFilterBodySchema = z.object({
  accountId: z.array(z.number().int()),
  endDate: z.string().datetime({ offset: true }), // ISO 8601 format with timezone
  endValue: z.number().nullable(),
  identifier: z.string(),
  name: z.string(),
  startDate: z.string().datetime({ offset: true }), // ISO 8601 format with timezone
  startValue: z.number().nullable(),
  status: z.array(z.string()),
});

/**
 * Combined request validation schema
 */
export const DashboardRequestSchema = z.object({
  params: DashboardRequestParamsSchema,
  body: DashboardFilterBodySchema,
});

// ============================================================================
// RESPONSE VALIDATION SCHEMAS
// ============================================================================

/**
 * Graph item schema for orders and quotes
 */
export const DashboardGraphItemSchema = z.object({
  amountValue: z.number(),
  avgScore: z.number().nullable(),
  count: z.number().int().nonnegative(),
  dateValue: z.string(),
  status: z.string(),
});

/**
 * Quote status graph item schema
 */
export const QuoteStatusGraphItemSchema = z.object({
  amountValue: z.number(),
  count: z.number().int().nonnegative(),
  quoteStatus: z.string(),
});

/**
 * Top performer item schema
 * Note: Preserving API typo "amountVale" for compatibility
 */
export const TopPerformerItemSchema = z.object({
  amountVale: z.number(), // API typo preserved
  name: z.string(),
});

/**
 * Dashboard data schema
 * Main data structure containing all metrics
 */
export const DashboardDataSchema = z.object({
  // Account Metrics
  activeAccounts: z.number().int().nonnegative(),
  totalAccounts: z.number().int().nonnegative(),
  totalActiveUsers: z.number().nullable(),
  totalBillingValues: z.number().nullable(),
  totalCustomerLs: z.number().nullable(),

  // Graph Type Configurations
  avgNpsGraphType: z.string().nullable(),
  buyerorderGraphType: z.string().nullable(),
  invoiceGraphType: z.string().nullable(),
  orderGraphType: z.string(),
  quoteGraphType: z.string(),

  // Main Graph Data Arrays
  lsOrderGraphDto: z.array(DashboardGraphItemSchema).nullable(),
  lsQuoteGraphDto: z.array(DashboardGraphItemSchema).nullable(),
  lsQuoteStatusGraphDto: z.array(QuoteStatusGraphItemSchema).nullable(),

  // Additional DTOs (flexible structure)
  lsAvgNpsGraphDto: z.record(z.string(), z.unknown()).nullable(),
  lsBuyerorderGraphDto: z.record(z.string(), z.unknown()).nullable(),
  lsInvoiceGraphDto: z.record(z.string(), z.unknown()).nullable(),
  lsSprGraphDto: z.record(z.string(), z.unknown()).nullable(),

  // Top Performers
  topOrderDto: z.array(TopPerformerItemSchema),
  topQuoteDto: z.array(TopPerformerItemSchema),
});

/**
 * API response schema
 * Top-level response structure
 */
export const DashboardApiResponseSchema = z.object({
  data: DashboardDataSchema,
  message: z.string().nullable(),
  status: z.enum(["success", "error"]),
});

/**
 * Enhanced API response with metadata
 */
export const DashboardAPISuccessSchema = DashboardApiResponseSchema.extend({
  timestamp: z.string().datetime(),
  requestId: z.string(),
  metadata: z
    .object({
      params: DashboardRequestParamsSchema,
      filters: DashboardFilterBodySchema,
    })
    .optional(),
});

/**
 * Error response schema
 */
export const DashboardAPIErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  timestamp: z.string().datetime(),
  requestId: z.string(),
});

// ============================================================================
// STATUS VALIDATION SCHEMAS
// ============================================================================

/**
 * Order status validation
 */
export const OrderStatusSchema = z.enum([
  "INVOICED",
  "ORDER ACKNOWLEDGED",
  "ORDER BOOKED",
  "ORDER RECEIVED",
  "PARTIALLY SHIPPED",
  "EDIT ENABLED",
  "REQUESTED EDIT",
]);

/**
 * Quote status validation
 */
export const QuoteStatusSchema = z.enum([
  "IN PROGRESS",
  "OPEN",
  "ORDER PLACED",
  "QUOTE SENT",
  "CANCELLED",
]);

/**
 * Graph type validation
 */
export const GraphTypeSchema = z.enum(["M", "Q", "Y"]);

// ============================================================================
// TRANSFORMED DATA VALIDATION SCHEMAS
// ============================================================================

/**
 * Monthly chart data schema
 */
export const MonthlyChartDataSchema = z.object({
  month: z.string(),
  dateValue: z.string(),
  orders: z.number(),
  quotes: z.number(),
  orderCount: z.number().int().nonnegative(),
  quoteCount: z.number().int().nonnegative(),
  orderStatuses: z.record(z.string(), z.number()),
  quoteStatuses: z.record(z.string(), z.number()),
  avgScore: z.number().nullable().optional(),
});

/**
 * Dashboard summary schema
 */
export const DashboardSummarySchema = z.object({
  totalOrderValue: z.number(),
  totalQuoteValue: z.number(),
  totalOrderCount: z.number().int().nonnegative(),
  totalQuoteCount: z.number().int().nonnegative(),
  activeAccounts: z.number().int().nonnegative(),
  totalAccounts: z.number().int().nonnegative(),
  topOrderCustomer: z.string().nullable(),
  topQuoteCustomer: z.string().nullable(),
  quoteConversionRate: z.number().min(0).max(100),
  averageOrderValue: z.number(),
  averageQuoteValue: z.number(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Request validation helper for URL parameters
 * Validates and transforms string parameters to numbers
 */
export const DashboardRequestValidationSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "User ID must be numeric")
    .transform(Number),
  companyId: z
    .string()
    .regex(/^\d+$/, "Company ID must be numeric")
    .transform(Number),
  currencyId: z
    .string()
    .regex(/^\d+$/, "Currency ID must be numeric")
    .transform(Number),
  offset: z
    .string()
    .regex(/^\d+$/, "Offset must be numeric")
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be numeric")
    .transform(Number)
    .optional(),
});

// ============================================================================
// VALIDATION ERROR CLASS
// ============================================================================

/**
 * Custom validation error for dashboard API
 */
export class DashboardValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError,
    public field?: string
  ) {
    super(message);
    this.name = "DashboardValidationError";
  }

  /**
   * Get formatted error messages
   */
  getFormattedErrors(): string[] {
    return this.errors.issues.map(err => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    });
  }

  /**
   * Get error summary
   */
  getSummary(): string {
    return this.getFormattedErrors().join(", ");
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate dashboard request parameters
 */
export function validateDashboardRequest(params: unknown, body: unknown) {
  try {
    const validatedParams = DashboardRequestParamsSchema.parse(params);
    const validatedBody = DashboardFilterBodySchema.parse(body);
    return { params: validatedParams, body: validatedBody };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new DashboardValidationError("Invalid dashboard request", error);
    }
    throw error;
  }
}

/**
 * Validate dashboard API response
 */
export function validateDashboardResponse(response: unknown) {
  try {
    return DashboardApiResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new DashboardValidationError("Invalid dashboard response", error);
    }
    throw error;
  }
}

/**
 * Validate URL query parameters
 * Transforms string values to appropriate types
 */
export function validateQueryParams(
  query: Record<string, string | string[] | undefined>
) {
  const params = {
    userId: query.userId as string,
    companyId: query.companyId as string,
    currencyId: query.currencyId as string,
    offset: query.offset as string | undefined,
    limit: query.limit as string | undefined,
  };

  try {
    const validated = DashboardRequestValidationSchema.parse(params);
    return DashboardRequestParamsSchema.parse({
      ...validated,
      offset: validated.offset ?? 0,
      limit: validated.limit ?? 99999999,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new DashboardValidationError("Invalid query parameters", error);
    }
    throw error;
  }
}

/**
 * Safe parse function with error handling
 */
export function safeParseDashboardResponse(data: unknown): {
  success: boolean;
  data?: z.infer<typeof DashboardApiResponseSchema>;
  error?: DashboardValidationError;
} {
  const result = DashboardApiResponseSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: new DashboardValidationError(
      "Response validation failed",
      result.error
    ),
  };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type DashboardRequestParams = z.infer<
  typeof DashboardRequestParamsSchema
>;
export type DashboardFilterBody = z.infer<typeof DashboardFilterBodySchema>;
export type DashboardGraphItem = z.infer<typeof DashboardGraphItemSchema>;
export type QuoteStatusGraphItem = z.infer<typeof QuoteStatusGraphItemSchema>;
export type TopPerformerItem = z.infer<typeof TopPerformerItemSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;
export type DashboardApiResponse = z.infer<typeof DashboardApiResponseSchema>;
export type DashboardAPISuccess = z.infer<typeof DashboardAPISuccessSchema>;
export type DashboardAPIError = z.infer<typeof DashboardAPIErrorSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type QuoteStatus = z.infer<typeof QuoteStatusSchema>;
export type GraphType = z.infer<typeof GraphTypeSchema>;
export type MonthlyChartData = z.infer<typeof MonthlyChartDataSchema>;
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
