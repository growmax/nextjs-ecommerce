import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get("stateId");

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

    // Fetching districts with parameters

    // Call external API
    const apiUrl = `${process.env.API_BASE_URL || "https://api.myapptino.com"}/homepagepublic/getAllDistrict`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(tenant && { "x-tenant": tenant }),
      },
    });

    if (!response.ok) {
      // Districts API Error occurred
      return NextResponse.json(
        { error: `Failed to fetch districts: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter by stateId if provided (client-side filtering)
    if (stateId && data.data) {
      data.data = data.data.filter(
        (district: { stateId: number }) =>
          district.stateId === parseInt(stateId)
      );

      // Filtered districts for selected state
    }

    // Districts API Response processed successfully

    return NextResponse.json(data);
  } catch {
    // Error in districts API route
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
