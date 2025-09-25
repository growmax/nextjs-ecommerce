import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "1032";
    const companyId = searchParams.get("companyId") || "8690";
    const offset = searchParams.get("offset") || "0";
    const pgLimit = searchParams.get("limit") || "20";

    const token =
      request.cookies.get("access_token")?.value ||
      request.cookies.get("access_token_client")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const tenant = getTenantFromToken(token);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "NextJS-App",
      origin: "schwingstetter.myapptino.com",
      "x-tenant": tenant || "schwingstetterdemo",
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `https://api.myapptino.com/corecommerce/orders/findByFilter?userId=${userId}&companyId=${companyId}&offset=${offset}&pgLimit=${pgLimit}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `External API returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
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
