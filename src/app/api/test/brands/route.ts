import { NextRequest, NextResponse } from "next/server";
import BrandsService from "@/lib/api/services/BrandsService";
import TenantService from "@/lib/api/services/TenantService";
import type { RequestContext } from "@/lib/api/client";

/**
 * Test endpoint to verify OpenSearch brands aggregation works
 * GET /api/test/brands
 */
export async function GET(request: NextRequest) {
  try {
    // Get tenant domain and origin from headers
    const tenantDomain = request.headers.get("x-tenant-domain") || "";
    const tenantOrigin = request.headers.get("x-tenant-origin") || "";

    if (!tenantDomain || !tenantOrigin) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing tenant domain or origin headers",
          hint: "Add x-tenant-domain and x-tenant-origin headers",
        },
        { status: 400 }
      );
    }

    // Fetch tenant data to get elasticCode
    let elasticCode = "";
    let tenantCode = "";
    try {
      const tenantData = await TenantService.getTenantDataCached(
        tenantDomain,
        tenantOrigin
      );
      elasticCode = tenantData?.data?.tenant?.elasticCode || "";
      tenantCode = tenantData?.data?.tenant?.tenantCode || "";
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch tenant data",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    if (!elasticCode) {
      return NextResponse.json(
        {
          success: false,
          message: "No elasticCode found for tenant",
        },
        { status: 400 }
      );
    }

    // Build RequestContext for service calls
    const context: RequestContext = {
      elasticCode,
      tenantCode,
      ...(tenantOrigin && { origin: tenantOrigin }),
    };

    const brands = await BrandsService.getAllBrands(context);

    return NextResponse.json({
      success: true,
      message: "Brands OpenSearch aggregation is working",
      elasticCode,
      count: brands.length,
      data: brands.slice(0, 5), // Return first 5 for testing
      fullCount: brands.length,
    });
  } catch (error) {
    console.error("Error testing brands OpenSearch:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

