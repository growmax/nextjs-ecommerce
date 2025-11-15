import PreferenceService from "@/lib/api/services/PreferenceService/PreferenceService";
import { NextRequest, NextResponse } from "next/server";

function getDataFromToken(
  token: string
): { companyId: number; userId: number; tenantCode: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]!));

    // Type-safe way to access elasticCode if it exists
    const elasticCode =
      "elasticCode" in payload
        ? ((payload as Record<string, unknown>).elasticCode as string)
        : "";

    return {
      companyId: payload.companyId || 8682,
      userId: payload.userId || 1007,
      tenantCode:
        payload.tenantId || payload.iss || elasticCode || "schwingstetterdemo",
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const companyIdParam = searchParams.get("companyId");
    const isMobileParam = searchParams.get("isMobile");
    const moduleParam = searchParams.get("module") || "order";
    const tenantCodeParam = searchParams.get("tenantCode");

    const token =
      request.cookies.get("access_token")?.value ||
      request.cookies.get("access_token_client")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const tokenData = getDataFromToken(token);

    const userId = userIdParam
      ? parseInt(userIdParam)
      : tokenData?.userId || 1007;
    const companyId = companyIdParam
      ? parseInt(companyIdParam)
      : tokenData?.companyId || 8682;
    const isMobile = isMobileParam === "true" || false;
    const tenantCode =
      tenantCodeParam || tokenData?.tenantCode || "schwingstetterdemo";

    const context = {
      accessToken: token,
      companyId,
      isMobile,
      userId,
      tenantCode,
    };

    const data = await PreferenceService.findPreferencesWithParamsServerSide(
      userId,
      moduleParam,
      context
    );

    if (!data) {
      return NextResponse.json(
        { error: "No preferences found for the specified parameters" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to fetch preferences: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
