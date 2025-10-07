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

    const response = await fetch("https://api.myapptino.com/auth/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant": "schwingstetterdemo",
        origin: "schwingstetter.myapptino.com",
        "Content-Type": "application/json",
        "User-Agent": "NextJS-App",
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
      userId: apiData.data.userId || 1032,
      companyId: apiData.data.companyId || 8690,
      displayName: apiData.data.displayName || "",
      email: apiData.data.email || "",
      phoneNumber:
        apiData.data.phoneNumber === "+null"
          ? undefined
          : apiData.data.phoneNumber,
      role: apiData.data.role,
    };

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
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
