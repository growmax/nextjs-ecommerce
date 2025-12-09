import { cookies } from "next/headers";
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

    // Get authorization token from cookies (HttpOnly)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const tenant = request.headers.get("x-tenant");

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Please log in again",
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

    // Debug logging - API params validated

    // Call external API
    const apiUrl = `${process.env.API_BASE_URL}/corecommerce/addresses/updateBrnAddress/${resolvedParams.userId}?companyId=${companyId}&addressId=${addressId}`;

    // Making external API call

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

      // API Error occurred during update

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
      // External API Response processed successfully

      // Return clean response without problematic headers
      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Mobile-Optimized": "true",
        },
      });
    } catch {
      // Response parsing error occurred

      const errorResponse: ApiErrorResponse = {
        error: "Invalid response from external API",
        message: "The server response could not be processed",
        mobile_friendly: true,
      };

      return NextResponse.json(errorResponse, { status: 502 });
    }
  } catch {
    // Error in update address API route

    const errorResponse: ApiErrorResponse = {
      error: "Internal server error",
      message: "Something went wrong. Please try again later.",
      mobile_friendly: true,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
