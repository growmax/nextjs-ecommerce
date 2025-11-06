import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PaymentService, RequestContext } from "@/lib/api";
import { JWTService } from "@/lib/services/JWTService";

/**
 * POST /api/sales/payments/getAllPaymentTerms
 *
 * Get all payment terms for a user
 *
 * Request Body:
 * {
 *   "userId": "12345",
 *   "companyId": "67890" (optional)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [...],
 *   "isLoggedIn": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authentication from cookies (HttpOnly)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Authentication required. Please log in again.",
          status: "error",
        },
        { status: 401 }
      );
    }

    // Decode JWT to validate token and get user info
    const jwtService = JWTService.getInstance();
    const payload = jwtService.decodeToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        {
          error: "Invalid token",
          status: "error",
        },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (jwtService.isTokenExpired(accessToken)) {
      return NextResponse.json(
        {
          error: "Access token has expired. Please refresh your session.",
          status: "error",
          tokenExpired: true,
        },
        { status: 401 }
      );
    }

    // Get tenant from header or token (fallback to token like original code)
    const tenantCode =
      request.headers.get("x-tenant") ||
      jwtService.getTenantFromToken(accessToken);

    if (!tenantCode) {
      return NextResponse.json(
        {
          error: "Tenant code is required",
          status: "error",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        {
          error: "userId is required",
          status: "error",
        },
        { status: 400 }
      );
    }

    // Use PaymentService to fetch payment terms with context for server-side
    const context: RequestContext = {
      accessToken,
      tenantCode,
    };

    const response = await PaymentService.fetchPaymentTermsWithContext(
      userId,
      context
    );

    // Return response in the same format as the old API route
    if (!response) {
      return NextResponse.json(
        {
          error: "Failed to fetch payment terms",
          status: "error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response?.data,
      isLoggedIn: Boolean(accessToken),
    });
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    // eslint-disable-next-line no-console
    console.error("Error fetching payment terms:", error);

    // Return error response
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch payment terms",
        status: "error",
      },
      { status: 500 }
    );
  }
}
