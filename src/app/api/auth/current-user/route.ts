import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Get the proper origin for the API call
    const origin =
      request.headers.get("x-tenant-origin") ||
      process.env.DEFAULT_ORIGIN ||
      `https://${process.env.DEFAULT_ORIGIN}`;
    console.log(origin);

    const response = await fetch(`${process.env.AUTH_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "NextJS-App",
        Origin: origin,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `API call failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const apiData = await response.json();

    if (!apiData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "API returned unsuccessful response",
          data: apiData,
        },
        { status: 400 }
      );
    }

    const user = {
      userId: apiData.data.userId || 1007,
      companyId: apiData.data.companyId || 8682,
      displayName: apiData.data.displayName || "",
      email: apiData.data.email || "",
      phoneNumber:
        apiData.data.phoneNumber === "+null"
          ? undefined
          : apiData.data.phoneNumber,
      role: apiData.data.role,
      isMobile: false,
      module: "order",
    };

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
