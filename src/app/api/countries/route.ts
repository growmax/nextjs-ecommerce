import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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

    // Call external API
    const apiUrl = `${process.env.API_BASE_URL || "https://api.myapptino.com"}/homepagepublic/getCountry`;

    // Fetching countries from external API

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(tenant && { "x-tenant": tenant }),
      },
    });

    if (!response.ok) {
      // Countries API Error occurred
      return NextResponse.json(
        { error: `Failed to fetch countries: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Countries API Response processed successfully

    return NextResponse.json(data);
  } catch {
    // Error in countries API route
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
