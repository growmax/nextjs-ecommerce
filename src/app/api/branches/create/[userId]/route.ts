import { cookies } from "next/headers";
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

    // Get authorization token from cookies (HttpOnly)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const tenant = request.headers.get("x-tenant");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required. Please log in again." },
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
    const apiUrl = `${process.env.API_BASE_URL || "https://api.myapptino.com"}/corecommerce/branches/createBranch/${userId}?companyId=${companyId}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(tenant && { "x-tenant": tenant }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // API Error occurred
      return NextResponse.json(
        { error: `Failed to create branch: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    // Error in create branch API route
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
