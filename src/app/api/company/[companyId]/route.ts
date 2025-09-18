import { NextRequest, NextResponse } from "next/server";
import { UserApiService } from "@/lib/services/UserApiService";
import { JWTService } from "@/lib/services/JWTService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId: requestedCompanyId } = await params;

    // Extract headers from request
    const tenantCode = request.headers.get("x-tenant");
    const authorization = request.headers.get("authorization");

    if (!tenantCode || !authorization) {
      return NextResponse.json(
        { error: "Missing required headers: x-tenant or authorization" },
        { status: 400 }
      );
    }

    // Extract access token from authorization header
    const accessToken = authorization.replace("Bearer ", "");

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
      // eslint-disable-next-line no-console
      console.log("Company API Request:", {
        requestedCompanyId,
        tokenCompanyId: companyId,
        tenantCode,
        accessToken: `${accessToken.substring(0, 20)}...`,
      });
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
      // eslint-disable-next-line no-console
      console.error("Company API Error:", error);
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
