import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserApiService } from "@/lib/services/UserApiService";
import { JWTService } from "@/lib/services/JWTService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId: _requestedCompanyId } = await params;

    // Get authentication from cookies (HttpOnly)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const tenantCode = request.headers.get("x-tenant");

    if (!tenantCode || !accessToken) {
      return NextResponse.json(
        { error: "Authentication required. Please log in again." },
        { status: 401 }
      );
    }

    // Decode JWT to get the actual company ID and check expiration
    const jwtService = JWTService.getInstance();
    const payload = jwtService.decodeToken(accessToken);

    if (!payload || !payload.companyId) {
      return NextResponse.json(
        { error: "Invalid token or missing company ID" },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (jwtService.isTokenExpired(accessToken)) {
      return NextResponse.json(
        { error: "Access token has expired. Please refresh your session." },
        { status: 401 }
      );
    }

    // Use company ID from token (not from URL parameter)
    const companyId = payload.companyId.toString();

    // Log for debugging in development
    if (process.env.NODE_ENV === "development") {
      // Debug info available for troubleshooting
    }

    // Use service layer to fetch company data
    const userApiService = UserApiService.getInstance();
    const data = await userApiService.fetchCompanyDetails(
      companyId,
      tenantCode,
      accessToken
    );

    // Return response
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    // Log the error for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
      // Error details available for troubleshooting
    }

    return NextResponse.json(
      {
        error: "Failed to fetch company data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
