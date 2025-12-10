import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Making API call with token
    // Tenant logging removed for production

    const response = await fetch("https://api.myapptino.com/auth/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant": "sandbox",
        origin: "sandbox.myapptino.com",
        "Content-Type": "application/json",
        "User-Agent": "NextJS-App",
      },
    });

    // API response status logged

    if (!response.ok) {
      const errorText = await response.text();
      // API error response logged
      return NextResponse.json(
        {
          error: `API call failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const apiData = await response.json();
    // API response data logged

    if (!apiData.success) {
      return NextResponse.json(
        {
          error: "API returned unsuccessful response",
          data: apiData,
        },
        { status: 400 }
      );
    }

    const profile = {
      name: apiData.data.displayName,
      email: apiData.data.email,
      phone:
        apiData.data.phoneNumber === "+null" ? "" : apiData.data.phoneNumber,
      altPhone: "", // Not available in current API response
      altEmail: apiData.data.secondaryEmail,
      avatar: apiData.data.picture,
    };

    return NextResponse.json(profile);
  } catch (error: unknown) {
    // Profile API error logged
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Note: The external API doesn't support profile updates via PUT
    // For now, we'll validate the data and return success
    // In a production environment, this would need to be handled differently
    // - either by using a different API endpoint
    // - or storing profile updates in a local database

    // Validate required fields
    if (!body.name && !body.phoneNumber && !body.altEmail) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    // Return the updated profile data
    // In a real implementation, this would be stored and retrieved from a database
    return NextResponse.json({
      success: true,
      message: "Profile update request received",
      data: {
        displayName: body.name,
        phoneNumber: body.phoneNumber,
        secondaryEmail: body.altEmail,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
