import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const userId = searchParams.get("userId");
    const companyId = searchParams.get("companyId");
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "99999999";
    const currencyId = searchParams.get("currencyId");

    // Get authorization token from cookies (HttpOnly)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const tenant =
      request.headers.get("x-tenant") ||
      process.env.DEFAULT_TENANT ||
      "schwingstetterdemo";

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    if (!userId || !companyId || !currencyId) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: userId, companyId, or currencyId",
        },
        { status: 400 }
      );
    }

    // Build external API URL
    const apiUrl = new URL(
      `${process.env.API_BASE_URL || "https://api.myapptino.com"}/corecommerce/dashBoardService/findByDashBoardFilterNew`
    );
    apiUrl.searchParams.append("userId", userId);
    apiUrl.searchParams.append("companyId", companyId);
    apiUrl.searchParams.append("offset", offset);
    apiUrl.searchParams.append("limit", limit);
    apiUrl.searchParams.append("currencyId", currencyId);

    // Call external API
    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-tenant": tenant,
      },
      body: JSON.stringify(body), // Forward the filter parameters
    });

    if (!response.ok) {
      // Dashboard API Error: response.status
      return NextResponse.json(
        { error: `Failed to fetch dashboard data: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    // Error in dashboard API route
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
