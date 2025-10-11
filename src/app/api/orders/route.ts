import { NextRequest, NextResponse } from "next/server";
import DashboardOrdersTableService from "@/lib/api/services/Dasboard/DashboardOrdersTable";
import OrdersFilterService from "@/lib/api/services/OrdersFilterService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId =
      searchParams.get("userId") || process.env.DEFAULT_USER_ID || "1032";
    const companyId =
      searchParams.get("companyId") || process.env.DEFAULT_COMPANY_ID || "8690";
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(
      searchParams.get("pgLimit") ||
        searchParams.get("limit") ||
        process.env.ORDERS_API_DEFAULT_LIMIT ||
        "20"
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

    // Check for filter parameters in query string
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const orderName = searchParams.get("orderName");
    const orderDateStart = searchParams.get("orderDateStart");
    const orderDateEnd = searchParams.get("orderDateEnd");
    const lastUpdatedDateStart = searchParams.get("lastUpdatedDateStart");
    const lastUpdatedDateEnd = searchParams.get("lastUpdatedDateEnd");
    const subtotalStart = searchParams.get("subtotalStart");
    const subtotalEnd = searchParams.get("subtotalEnd");
    const taxableStart = searchParams.get("taxableStart");
    const taxableEnd = searchParams.get("taxableEnd");
    const totalStart = searchParams.get("totalStart");
    const totalEnd = searchParams.get("totalEnd");

    // Check if any filter is present
    const hasFilters =
      status ||
      orderId ||
      orderName ||
      orderDateStart ||
      orderDateEnd ||
      lastUpdatedDateStart ||
      lastUpdatedDateEnd ||
      subtotalStart ||
      subtotalEnd ||
      taxableStart ||
      taxableEnd ||
      totalStart ||
      totalEnd;

    let data;
    if (hasFilters) {
      // Build proper OrderFilter object for the filter service
      const filter = {
        filter_index: 0,
        filter_name: "Filtered",
        accountId: [],
        accountOwners: [],
        approvalAwaiting: [],
        endDate: orderDateEnd || "",
        endCreatedDate: lastUpdatedDateEnd || "",
        endValue: subtotalEnd ? parseFloat(subtotalEnd) : null,
        endTaxableAmount: taxableEnd ? parseFloat(taxableEnd) : null,
        endGrandTotal: totalEnd ? parseFloat(totalEnd) : null,
        identifier: orderId || "",
        limit,
        offset,
        name: orderName || "",
        pageNumber: Math.floor(offset / limit) + 1,
        startDate: orderDateStart || "",
        startCreatedDate: lastUpdatedDateStart || "",
        startValue: subtotalStart ? parseFloat(subtotalStart) : null,
        startTaxableAmount: taxableStart ? parseFloat(taxableStart) : null,
        startGrandTotal: totalStart ? parseFloat(totalStart) : null,
        status: status ? [status] : [],
        quoteUsers: [],
        tagsList: [],
        options: ["ByBranch"],
        branchId: [],
        businessUnitId: [],
        selectedColumns: [
          "createdDate",
          "lastUpdatedDate",
          "orderIdentifier",
          "orderName",
          "sellerCompanyName",
          "itemcount",
          "subTotal",
          "taxableAmount",
          "grandTotal",
          "updatedBuyerStatus",
          "requiredDate",
        ],
        columnPosition:
          '["orderName","lastUpdatedDate","orderIdentifier","createdDate","sellerCompanyName","itemcount","subTotal","taxableAmount","grandTotal","updatedBuyerStatus","requiredDate"]',
      };

      // Use the filter service when filters are provided
      data = await OrdersFilterService.getOrdersWithFilterAndContext(
        {
          userId: parseInt(userId),
          companyId: parseInt(companyId),
          offset,
          pgLimit: limit,
          filters: [filter],
          selected: 0,
        },
        context
      );
    } else {
      // Use the regular dashboard service without filters
      data = await DashboardOrdersTableService.getOrdersServerSide(
        { userId, companyId, offset, limit },
        context
      );
    }

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

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId =
      searchParams.get("userId") || process.env.DEFAULT_USER_ID || "1032";
    const companyId =
      searchParams.get("companyId") || process.env.DEFAULT_COMPANY_ID || "8690";
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(
      searchParams.get("pgLimit") ||
        searchParams.get("limit") ||
        process.env.ORDERS_API_DEFAULT_LIMIT ||
        "20"
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

    // Parse the request body for filter payload
    const body = await request.json();

    let data;
    // Check if body contains filter fields (like quotes API)
    if (
      body &&
      (body.filter_index !== undefined || body.filter_name || body.status)
    ) {
      // This is a direct filter object like quotes API
      data = await OrdersFilterService.getOrdersWithFilterAndContext(
        {
          userId: parseInt(userId),
          companyId: parseInt(companyId),
          offset,
          pgLimit: limit,
          filters: [body], // Wrap the single filter in an array
          selected: 0,
        },
        context
      );
    } else {
      // No filters provided, use regular dashboard service
      data = await DashboardOrdersTableService.getOrdersServerSide(
        { userId, companyId, offset, limit },
        context
      );
    }

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
