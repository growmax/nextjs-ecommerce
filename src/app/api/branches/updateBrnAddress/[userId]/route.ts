import { NextRequest, NextResponse } from "next/server";

// TypeScript interfaces for API responses
interface ExternalApiResponse {
  data: Record<string, unknown>;
  message: string;
  status: string;
}

interface ApiErrorResponse {
  error: string;
  message: string;
  mobile_friendly: boolean;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const addressId = searchParams.get("addressId");

    // Get authorization token from headers
    const authHeader = request.headers.get("authorization");
    const tenant = request.headers.get("x-tenant");

    if (!authHeader) {
      return NextResponse.json(
        {
          error: "Authorization required",
          message: "Please log in to update address",
          mobile_friendly: true,
        },
        { status: 401 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        {
          error: "Company ID is required",
          message: "Please select a company to continue",
          mobile_friendly: true,
        },
        { status: 400 }
      );
    }

    if (!addressId) {
      return NextResponse.json(
        {
          error: "Address ID is required",
          message: "Please select an address to update",
          mobile_friendly: true,
        },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();

    // Debug logging
    // eslint-disable-next-line no-console
    console.log("Update Address API params:", {
      userId: resolvedParams.userId,
      companyId,
      addressId,
      body,
    });

    // Call external API
    const apiUrl = `${process.env.API_BASE_URL || "https://api.myapptino.com"}/corecommerce/addresses/updateBrnAddress/${resolvedParams.userId}?companyId=${companyId}&addressId=${addressId}`;

    // eslint-disable-next-line no-console
    console.log("External API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        ...(tenant && { "x-tenant": tenant }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Use response clone to avoid stream consumption issues
      const responseClone = response.clone();
      let errorData: Record<string, unknown>;
      let errorMessage = "Unknown error occurred";

      try {
        // Try to parse as JSON first
        errorData = await response.json();
        errorMessage = String(
          errorData.message || errorData.error || `HTTP ${response.status}`
        );
      } catch {
        // If JSON parsing fails, try text
        try {
          errorMessage =
            (await responseClone.text()) || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status} - Unable to read error details`;
        }
      }

      // eslint-disable-next-line no-console
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        url: apiUrl,
      });

      return NextResponse.json(
        {
          error: `Failed to update address: ${response.status}`,
          message: errorMessage,
          mobile_friendly: true,
        },
        { status: response.status }
      );
    }

    // Handle successful response with proper TypeScript typing
    let responseData: ExternalApiResponse;

    try {
      responseData = await response.json();

      // Validate response structure
      if (typeof responseData !== "object" || responseData === null) {
        throw new Error("Invalid response format: expected object");
      }

      // Log successful response (for debugging)
      // eslint-disable-next-line no-console
      console.log("External API Response:", {
        status: responseData.status,
        message: responseData.message,
        hasData: !!responseData.data,
      });

      // Return clean response without problematic headers
      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Mobile-Optimized": "true",
        },
      });
    } catch (parseError) {
      // eslint-disable-next-line no-console
      console.error("Response parsing error:", parseError);

      const errorResponse: ApiErrorResponse = {
        error: "Invalid response from external API",
        message: "The server response could not be processed",
        mobile_friendly: true,
      };

      return NextResponse.json(errorResponse, { status: 502 });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in update address API route:", error);

    const errorResponse: ApiErrorResponse = {
      error: "Internal server error",
      message: "Something went wrong. Please try again later.",
      mobile_friendly: true,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
