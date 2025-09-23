import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");
    
    // Get authorization token from headers
    const authHeader = request.headers.get("authorization");
    const tenant = request.headers.get("x-tenant");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    console.log("Fetching states with params:", { countryId });

    // Call external API
    const apiUrl = `${process.env.API_BASE_URL || "https://api.myapptino.com"}/homepagepublic/getAllState`;

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
      console.error("States API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch states: ${response.status}` },
        { status: response.status }
      );
    }

    let data = await response.json();
    
    // Filter by countryId if provided (client-side filtering)
    if (countryId && data.data) {
      data.data = data.data.filter((state: any) => 
        state.countryId === parseInt(countryId)
      );
      
      console.log("Filtered states for country:", countryId, "Count:", data.data.length);
    }
    
    console.log("States API Response:", {
      status: data.status,
      message: data.message,
      dataLength: data.data?.length,
      filteredByCountry: !!countryId,
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in states API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}