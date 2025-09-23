import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get("stateId");
    
    // Get authorization token from headers
    const authHeader = request.headers.get("authorization");
    const tenant = request.headers.get("x-tenant");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    console.log("Fetching districts with params:", { stateId });

    // Call external API
    const apiUrl = `${process.env.API_BASE_URL || "https://api.myapptino.com"}/homepagepublic/getAllDistrict`;

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
      console.error("Districts API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch districts: ${response.status}` },
        { status: response.status }
      );
    }

    let data = await response.json();
    
    // Filter by stateId if provided (client-side filtering)
    if (stateId && data.data) {
      data.data = data.data.filter((district: any) => 
        district.stateId === parseInt(stateId)
      );
      
      console.log("Filtered districts for state:", stateId, "Count:", data.data.length);
    }
    
    console.log("Districts API Response:", {
      status: data.status,
      message: data.message,
      dataLength: data.data?.length,
      filteredByState: !!stateId,
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in districts API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}