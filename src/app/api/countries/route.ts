import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get authorization token from headers
    const authHeader = request.headers.get("authorization");
    const tenant = request.headers.get("x-tenant");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    // Call external API
    const apiUrl = `${process.env.API_BASE_URL || "https://api.myapptino.com"}/homepagepublic/getCountry`;

    console.log("Fetching countries from:", apiUrl);

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
      console.error("Countries API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch countries: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log("Countries API Response:", {
      status: data.status,
      message: data.message,
      dataLength: data.data?.length,
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in countries API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}