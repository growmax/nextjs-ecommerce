import {
  OpenSearchProductResponse,
  ProductDetail,
} from "@/types/product/product-detail";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

/**
 * OpenSearch Product Detail API Route
 *
 * GET /api/opensearch/products/[id]
 *
 * Fetches product details from OpenSearch/Elasticsearch by product ID or index name.
 * Supports multi-tenant architecture with proper header propagation.
 *
 * @param id - Product ID (numeric) or Product Index Name (e.g., Prod0000012390)
 */

const OPENSEARCH_URL =
  process.env.OPENSEARCH_URL ||
  process.env.NEXT_PUBLIC_OPENSEARCH_URL ||
  "https://api.myapptino.com/opensearch/invocations";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Extract headers for multi-tenant support
    const accessToken =
      request.headers.get("authorization")?.replace("Bearer ", "") || "";
    const tenantCode = request.headers.get("x-tenant") || "";
    const companyId = request.headers.get("x-company-id") || "";
    const userId = request.headers.get("x-user-id") || "";

    // Validate required parameters
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // Get elastic index from query params or use tenant-based default
    const { searchParams } = new URL(request.url);
    const elasticIndex =
      searchParams.get("index") ||
      (tenantCode ? `${tenantCode.toLowerCase()}pgandproducts` : "");

    if (!elasticIndex) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Elastic index is required. Provide 'index' query parameter or x-tenant header.",
        },
        { status: 400 }
      );
    }

    // Determine if ID is numeric or index name
    const isNumericId = /^\d+$/.test(id);
    const productIndexName = isNumericId ? `Prod${id.padStart(10, "0")}` : id;

    // Build OpenSearch request payload matching the curl structure
    const openSearchPayload = {
      Elasticindex: elasticIndex,
      ElasticBody: productIndexName,
      ElasticType: "pgproduct",
      queryType: "get",
    };

    // Prepare headers for OpenSearch request
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (tenantCode) {
      headers["x-tenant"] = tenantCode;
    }
    if (companyId) {
      headers["x-company-id"] = companyId;
    }
    if (userId) {
      headers["x-user-id"] = userId;
    }

    // Make request to OpenSearch
    const response = await axios.post<OpenSearchProductResponse>(
      OPENSEARCH_URL,
      openSearchPayload,
      {
        headers,
        timeout: 30000,
      }
    );

    // Check if product was found
    if (!response.data.body.found) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
          productId: id,
        },
        { status: 404 }
      );
    }

    // Extract product data
    const productData: ProductDetail = response.data.body._source;

    // Return successful response with caching headers
    return NextResponse.json(
      {
        success: true,
        data: productData,
      },
      {
        status: 200,
        headers: {
          // Cache for 1 hour (3600 seconds)
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          // Add CORS headers if needed
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, x-tenant, x-company-id, x-user-id",
        },
      }
    );
  } catch (error) {
    // Log error in development mode only
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("OpenSearch API Error:", error);
    }

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;

      return NextResponse.json(
        {
          success: false,
          error: `OpenSearch request failed: ${message}`,
          productId: id,
        },
        { status }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        productId: id,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-tenant, x-company-id, x-user-id",
      },
    }
  );
}
