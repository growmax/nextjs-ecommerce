/**
 * Dashboard API Route Handler
 * Handles dashboard data requests with authentication and validation
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateQueryParams,
  validateDashboardResponse,
  DashboardFilterBodySchema,
  DashboardValidationError,
  type DashboardAPIError,
  type DashboardAPISuccess,
} from "@/lib/validation/dashboardSchema";
import type { DashboardApiResponse } from "@/lib/types/dashboard";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.myapptino.com";
const API_ENDPOINT = "/corecommerce/dashBoardService/findByDashBoardFilterNew";
const DEFAULT_TENANT = process.env.NEXT_PUBLIC_TENANT || "IN";

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `dash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create error response with proper structure
 */
function createErrorResponse(
  error: string,
  code: string = "INTERNAL_ERROR",
  status: number = 500,
  details?: unknown
): NextResponse<DashboardAPIError> {
  const requestId = generateRequestId();
  const errorResponse: DashboardAPIError = {
    error,
    code,
    details,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(errorResponse, { status });
}

/**
 * Extract and validate authentication token from cookies
 */
async function getAuthToken(request: NextRequest): Promise<string | null> {
  try {
    // Check for the same tokens used in the orders API
    const token =
      request.cookies.get("access_token")?.value ||
      request.cookies.get("access_token_client")?.value;

    return token || null;
  } catch {
    // Error reading auth cookie
    return null;
  }
}

/**
 * Extract tenant from JWT token (same logic as orders API)
 */
function getTenantFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]!));
    return payload.iss || null;
  } catch {
    return null;
  }
}

/**
 * POST /api/dashboard
 * Fetches dashboard data from external API with authentication
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // 1. Validate authentication
    const authToken = await getAuthToken(request);
    if (!authToken) {
      return createErrorResponse(
        "Authentication required",
        "UNAUTHORIZED",
        401
      );
    }

    // Get tenant from token
    const tenant = getTenantFromToken(authToken);

    // 2. Extract and validate query parameters from URL
    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    let validatedParams;
    try {
      validatedParams = validateQueryParams(queryObject);
    } catch (error) {
      if (error instanceof DashboardValidationError) {
        return createErrorResponse(
          "Invalid query parameters",
          "VALIDATION_ERROR",
          400,
          error.getFormattedErrors()
        );
      }
      throw error;
    }

    // 3. Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return createErrorResponse("Invalid request body", "PARSE_ERROR", 400);
    }

    let validatedBody;
    try {
      validatedBody = DashboardFilterBodySchema.parse(requestBody);
    } catch (error) {
      if (error instanceof Error) {
        return createErrorResponse(
          "Invalid filter parameters",
          "VALIDATION_ERROR",
          400,
          error.message
        );
      }
      throw error;
    }

    // 4. Construct API URL with query parameters
    const apiUrl = new URL(`${API_BASE_URL}${API_ENDPOINT}`);
    Object.entries(validatedParams).forEach(([key, value]) => {
      apiUrl.searchParams.append(key, String(value));
    });

    // 5. Make API request to external service
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "NextJS-App",
      origin: "schwingstetter.myapptino.com",
      "x-tenant": tenant || "schwingstetterdemo",
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const apiResponse = await fetch(apiUrl.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(validatedBody),
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    // 6. Handle non-OK responses
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      let errorMessage = `API request failed with status ${apiResponse.status}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return createErrorResponse(
        errorMessage,
        `API_ERROR_${apiResponse.status}`,
        apiResponse.status
      );
    }

    // 7. Parse API response
    let responseData;
    try {
      responseData = await apiResponse.json();
    } catch {
      return createErrorResponse(
        "Invalid response from API",
        "PARSE_ERROR",
        502
      );
    }

    // 8. Validate response structure
    let validatedResponse: DashboardApiResponse;
    try {
      validatedResponse = validateDashboardResponse(responseData);
    } catch (error) {
      if (error instanceof DashboardValidationError) {
        // Response validation error

        return createErrorResponse(
          "Invalid response structure from API",
          "RESPONSE_VALIDATION_ERROR",
          502,
          error.getFormattedErrors()
        );
      }
      throw error;
    }

    // 9. Check for API-level errors
    if (validatedResponse.status === "error") {
      return createErrorResponse(
        validatedResponse.message || "API returned error status",
        "API_ERROR",
        400
      );
    }

    // 10. Create success response with metadata
    const successResponse: DashboardAPISuccess = {
      ...validatedResponse,
      timestamp: new Date().toISOString(),
      requestId,
      metadata: {
        params: validatedParams,
        filters: validatedBody,
      },
    };

    // 11. Add performance headers
    const responseTime = Date.now() - startTime;
    const response = NextResponse.json(successResponse, { status: 200 });
    response.headers.set("X-Request-Id", requestId);
    response.headers.set("X-Response-Time", `${responseTime}ms`);
    response.headers.set("Cache-Control", "private, max-age=60"); // Cache for 1 minute

    return response;
  } catch (error) {
    // Log unexpected errors
    // Dashboard API error

    if (error instanceof Error) {
      // Handle timeout errors
      if (error.name === "AbortError") {
        return createErrorResponse("Request timeout", "TIMEOUT", 504);
      }

      // Handle network errors
      if (error.message.includes("fetch")) {
        return createErrorResponse("Network error", "NETWORK_ERROR", 503);
      }

      return createErrorResponse(error.message, "INTERNAL_ERROR", 500);
    }

    return createErrorResponse(
      "An unexpected error occurred",
      "UNKNOWN_ERROR",
      500
    );
  }
}

/**
 * GET /api/dashboard
 * Returns API information and required parameters
 */
export async function GET() {
  return NextResponse.json({
    message: "Dashboard API",
    endpoint: "/api/dashboard",
    method: "POST",
    requiredParams: {
      query: {
        userId: "number",
        companyId: "number",
        currencyId: "number",
        offset: "number (optional, default: 0)",
        limit: "number (optional, default: 99999999)",
      },
      body: {
        accountId: "number[]",
        endDate: "ISO 8601 datetime string",
        endValue: "number | null",
        identifier: "string",
        name: "string",
        startDate: "ISO 8601 datetime string",
        startValue: "number | null",
        status: "string[]",
      },
    },
    authentication: "Required (HTTP-only cookie)",
    tenant: DEFAULT_TENANT,
  });
}
