import { DiscountRequest } from "@/lib/api/services/DiscountService/DiscountService";
import { JWTService } from "@/lib/services/JWTService";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/discounts/product-discounts
 *
 * Get discount information for specific products
 *
 * Request Body:
 * {
 *   "Productid": [12386, 64097],
 *   "CurrencyId": 96,
 *   "BaseCurrencyId": 96,
 *   "sellerId": "8682"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authentication from cookies (HttpOnly)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const tenantCode = request.headers.get("x-tenant");

    if (!tenantCode || !accessToken) {
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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { Productid, CurrencyId, BaseCurrencyId, sellerId } =
      body as DiscountRequest;

    if (!Productid || !Array.isArray(Productid) || Productid.length === 0) {
      return NextResponse.json(
        {
          error: "Productid array is required and cannot be empty",
          status: "error",
        },
        { status: 400 }
      );
    }

    if (!CurrencyId || typeof CurrencyId !== "number") {
      return NextResponse.json(
        {
          error: "CurrencyId is required and must be a number",
          status: "error",
        },
        { status: 400 }
      );
    }

    if (!BaseCurrencyId || typeof BaseCurrencyId !== "number") {
      return NextResponse.json(
        {
          error: "BaseCurrencyId is required and must be a number",
          status: "error",
        },
        { status: 400 }
      );
    }

    if (!sellerId || typeof sellerId !== "string") {
      return NextResponse.json(
        {
          error: "sellerId is required and must be a string",
          status: "error",
        },
        { status: 400 }
      );
    }

    // Validate product IDs are numbers
    const invalidProductIds = Productid.filter(id => typeof id !== "number");
    if (invalidProductIds.length > 0) {
      return NextResponse.json(
        {
          error: "All product IDs must be numbers",
          status: "error",
          invalidIds: invalidProductIds,
        },
        { status: 400 }
      );
    }

    // TODO: Call DiscountService.getDiscount here when ready
    // For now, returning mock data
    const discountResponse = {
      data: [
        {
          MasterPrice: 1462,
          BasePrice: 731,
          isProductAvailableInPriceList: true,
          discounts: [],
          ProductVariantId: Productid[0],
          isApprovalRequired: false,
          PricelistCode: "PLN175202qV87E1",
          plnErpCode: "",
          isOveridePricelist: false,
          sellerId,
          sellerName: "Demo Seller",
        },
      ],
    };

    // Return successful response
    return NextResponse.json({
      status: "success",
      data: discountResponse.data,
      message: "Product discounts retrieved successfully",
      metadata: {
        productCount: Productid.length,
        requestedProducts: Productid,
        sellerId,
        currencyId: CurrencyId,
      },
    });
  } catch (error: unknown) {
    // Handle different types of errors
    if (error instanceof Error) {
      // Check if it's a service-related error
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        return NextResponse.json(
          {
            error: "Authentication failed. Please log in again.",
            status: "error",
            tokenExpired: true,
          },
          { status: 401 }
        );
      }

      if (
        error.message.includes("400") ||
        error.message.includes("Bad Request")
      ) {
        return NextResponse.json(
          {
            error: "Invalid request data",
            status: "error",
            details: error.message,
          },
          { status: 400 }
        );
      }

      if (
        error.message.includes("404") ||
        error.message.includes("Not Found")
      ) {
        return NextResponse.json(
          {
            error: "Discount service not found",
            status: "error",
          },
          { status: 404 }
        );
      }

      if (
        error.message.includes("500") ||
        error.message.includes("Internal Server Error")
      ) {
        return NextResponse.json(
          {
            error: "Discount service is temporarily unavailable",
            status: "error",
          },
          { status: 502 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to retrieve product discounts",
        status: "error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/discounts/product-discounts?productIds=12386,64097&currencyId=96&baseCurrencyId=96&sellerId=8682
 *
 * Alternative GET endpoint for simpler requests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const productIdsParam = searchParams.get("productIds");
    const currencyIdParam = searchParams.get("currencyId");
    const baseCurrencyIdParam = searchParams.get("baseCurrencyId");
    const sellerIdParam = searchParams.get("sellerId");

    if (
      !productIdsParam ||
      !currencyIdParam ||
      !baseCurrencyIdParam ||
      !sellerIdParam
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: productIds, currencyId, baseCurrencyId, sellerId",
          status: "error",
        },
        { status: 400 }
      );
    }

    // Parse product IDs
    const Productid = productIdsParam.split(",").map(id => {
      const numId = parseInt(id.trim());
      if (isNaN(numId)) {
        throw new Error(`Invalid product ID: ${id}`);
      }
      return numId;
    });

    const CurrencyId = parseInt(currencyIdParam);
    const BaseCurrencyId = parseInt(baseCurrencyIdParam);

    if (isNaN(CurrencyId) || isNaN(BaseCurrencyId)) {
      return NextResponse.json(
        {
          error: "CurrencyId and BaseCurrencyId must be valid numbers",
          status: "error",
        },
        { status: 400 }
      );
    }

    // Create request body and forward to POST handler
    const requestBody = {
      Productid,
      CurrencyId,
      BaseCurrencyId,
      sellerId: sellerIdParam,
    };

    // Create a new request with the body for the POST handler
    const newRequest = new NextRequest(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(requestBody),
    });

    return POST(newRequest);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to parse request parameters",
        status: "error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
