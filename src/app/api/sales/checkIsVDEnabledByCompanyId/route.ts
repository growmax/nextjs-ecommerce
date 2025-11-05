import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DiscountService, RequestContext } from "@/lib/api";
import { JWTService } from "@/lib/services/JWTService";

/**
 * POST /api/sales/checkIsVDEnabledByCompanyId
 *
 * Check if volume discount is enabled for a company
 *
 * Request Body:
 * {
 *   "companyId": "12345"
 * }
 *
 * Response:
 * {
 *   "data": true/false
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
    const { companyId } = body;

    // Validate required fields
    if (!companyId) {
      return NextResponse.json(
        {
          error: "companyId is required",
          status: "error",
        },
        { status: 400 }
      );
    }

    // Use DiscountService to check if VD is enabled with context for server-side
    const context: RequestContext = {
      accessToken,
      tenantCode,
    };

    const response =
      await DiscountService.checkIsVDEnabledByCompanyIdWithContext(
        companyId,
        context
      );

    // Return response in the same format as the old API route
    if (!response) {
      return NextResponse.json(
        {
          error: "Failed to check VD enabled status",
          status: "error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: response?.data,
    });
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    // eslint-disable-next-line no-console
    console.error("Error checking VD enabled status:", error);

    // Return error response
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check VD enabled status",
        status: "error",
      },
      { status: 500 }
    );
  }
}
