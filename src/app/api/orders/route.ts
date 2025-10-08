import { NextRequest, NextResponse } from "next/server";
import DashboardOrdersTableService from "@/lib/api/services/Dasboard/DashboardOrdersTable";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId =
      searchParams.get("userId") || process.env.DEFAULT_USER_ID || "1032";
    const companyId =
      searchParams.get("companyId") || process.env.DEFAULT_COMPANY_ID || "8690";
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(
      searchParams.get("limit") || process.env.ORDERS_API_DEFAULT_LIMIT || "20"
    );

    const token =
      request.cookies.get("access_token")?.value ||
      request.cookies.get("access_token_client")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const context = {
      accessToken: token,
      companyId: parseInt(companyId),
      isMobile: false,
      module: "order",
      userId: parseInt(userId),
    };

    const data = await DashboardOrdersTableService.getOrdersServerSide(
      { userId, companyId, offset, limit },
      context
    );

    if (!data) {
      return NextResponse.json(
        { error: "Failed to fetch orders from service" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to fetch orders: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
