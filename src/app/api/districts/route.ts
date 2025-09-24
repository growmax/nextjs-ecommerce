import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // eslint-disable-next-line no-console
    console.log("Fetching districts with params:", { stateId });

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
      const errorText = await response.text();
      // eslint-disable-next-line no-console
      console.error("Districts API Error:", response.status, errorText);
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

      // eslint-disable-next-line no-console
      console.log(
        "Filtered districts for state:",
        stateId,
        "Count:",
        data.data.length
      );
    }

    // eslint-disable-next-line no-console
    console.log("Districts API Response:", {
      status: data.status,
      message: data.message,
      dataLength: data.data?.length,
      filteredByState: !!stateId,
    });

    return NextResponse.json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in districts API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
