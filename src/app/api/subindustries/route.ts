import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get authentication from cookies (HttpOnly)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const tenant = request.headers.get("x-tenant");

    // Validate authentication
    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required. Please log in again." },
        { status: 401 }
      );
    }

    // Validate tenant
    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant header required" },
        { status: 400 }
      );
    }

    // Make API call to external service
    const apiUrl = "https://api.myapptino.com/corecommerce/subindustrys";

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        origin: "schwingstetter.myapptino.com",
        "x-tenant": tenant,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: "Failed to fetch sub-industries",
          status: response.status,
          message: errorText,
        },
        { status: response.status }
      );
    }

    // Parse successful response
    const data = await response.json();

    // Return the data to client
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint for creating sub-industries
export async function POST(request: NextRequest) {
  try {
    // Get authentication from cookies (HttpOnly)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const tenant = request.headers.get("x-tenant");
    const body = await request.json();

    if (!accessToken || !tenant) {
      return NextResponse.json(
        { error: "Authentication required or missing tenant" },
        { status: 401 }
      );
    }

    const response = await fetch(
      "https://api.myapptino.com/corecommerce/subindustrys",
      {
        method: "POST",
        headers: {
          origin: "schwingstetter.myapptino.com",
          "x-tenant": tenant,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to create sub-industry" },
      { status: 500 }
    );
  }
}
