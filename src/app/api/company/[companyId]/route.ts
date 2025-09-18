import { NextRequest, NextResponse } from "next/server";
import { UserApiService } from "@/lib/services/UserApiService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

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
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch company data" },
      { status: 500 }
    );
  }
}
