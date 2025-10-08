import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getTenantFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]!));
    return payload.iss || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const moduleParam = searchParams.get("module");
    const tenantCode = searchParams.get("tenantCode");

    // Validate required parameters
    if (!userId || !moduleParam || !tenantCode) {
      return NextResponse.json(
        { error: "Missing required parameters: userId, module, tenantCode" },
        { status: 400 }
      );
    }

    // Get authentication from server-side cookies
    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get("access_token")?.value ||
      cookieStore.get("access_token_client")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    // Get tenant from token for validation
    const tokenTenant = getTenantFromToken(accessToken);

    // Build external API URL from environment variable
    const preferenceBaseUrl =
      process.env.PREFERENCE_URL || "https://api.myapptino.com/userpreference";
    const externalApiUrl = `${preferenceBaseUrl}/preferences/find?userId=${userId}&module=${moduleParam}&tenantCode=${tenantCode}`;

    // Make server-to-server request (no CORS restrictions)
    const response = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(tokenTenant && { "x-tenant": tokenTenant }),
      },
    });

    // Handle API response
    if (!response.ok) {
      // For 404 or other errors, return null (matching server-safe behavior)
      if (response.status === 404) {
        return NextResponse.json(null);
      }

      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (_error) {
    // Return null for errors to match server-safe behavior
    return NextResponse.json(null);
  }
}
