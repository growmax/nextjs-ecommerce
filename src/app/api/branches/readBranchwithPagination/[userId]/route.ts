import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "10";
    const searchString = searchParams.get("searchString") || "";

    // Get authorization token from headers
    const authHeader = request.headers.get("authorization");
    const tenant = request.headers.get("x-tenant");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Call external API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.myapptino.com"}/corecommerce/branches/readBranchwithPagination/${resolvedParams.userId}?companyId=${companyId}&offset=${offset}&limit=${limit}&searchString=${encodeURIComponent(searchString)}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        ...(tenant && { "x-tenant": tenant }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // eslint-disable-next-line no-console
      console.error("API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch addresses: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in branches API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
