import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    // Get authorization token and tenant from headers
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

    // Get request body
    const body = await request.json();

    // Call external API to create branch
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.myapptino.com"}/corecommerce/branches/createBranch/${userId}?companyId=${companyId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        ...(tenant && { "x-tenant": tenant }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // eslint-disable-next-line no-console
      console.error("API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `Failed to create branch: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in create branch API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
