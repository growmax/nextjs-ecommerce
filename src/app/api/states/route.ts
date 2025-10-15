import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");

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

    // Fetching states with parameters

    // Call external API
    const apiUrl = `${process.env.API_BASE_URL || "https://api.myapptino.com"}/homepagepublic/getAllState`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(tenant && { "x-tenant": tenant }),
      },
    });

    if (!response.ok) {
      // States API Error occurred
      return NextResponse.json(
        { error: `Failed to fetch states: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter by countryId if provided (client-side filtering)
    if (countryId && data.data) {
      data.data = data.data.filter(
        (state: { countryId: number }) =>
          state.countryId === parseInt(countryId)
      );

      // Filtered states for selected country
    }

    // States API Response processed successfully

    return NextResponse.json(data);
  } catch (_error) {
    // Error in states API route
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
