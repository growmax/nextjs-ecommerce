/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/logout/route";

// Mock the global fetch function
global.fetch = jest.fn();

describe.skip("POST /api/auth/logout", () => {
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock environment variables
    process.env.AUTH_URL = "https://auth.example.com";
    process.env.DEFAULT_ORIGIN = "https://store.example.com";
  });

  it("should successfully logout with tokens from request body", async () => {
    // Arrange
    const requestBody = {
      accessToken: "test_access_token",
      refreshToken: "test_refresh_token",
    };
    const request = new NextRequest(
      "https://store.example.com/api/auth/logout",
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      }
    );

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    // Act
    const response = await POST(request);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(responseBody.success).toBe(true);

    // Check that fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.AUTH_URL}/logout`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          accessToken: "test_access_token",
          refreshToken: "test_refresh_token",
        }),
      })
    );

    // Check that cookies are cleared - need to check each Set-Cookie header
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    const cookieString = setCookieHeaders.join("; ");
    expect(cookieString).toContain("access_token=;");
    expect(cookieString).toContain("access_token_client=;");
    expect(cookieString).toContain("refresh_token=;");
    expect(cookieString).toContain("auth-token=;");
    expect(cookieString).toMatch(/anonymous_token=anon_/);
  });

  it("should successfully logout with tokens from cookies", async () => {
    // Arrange
    const request = new NextRequest(
      "https://store.example.com/api/auth/logout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie:
            "access_token=cookie_access_token; refresh_token=cookie_refresh_token",
        },
      }
    );

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.AUTH_URL}/logout`,
      expect.objectContaining({
        body: JSON.stringify({
          accessToken: "cookie_access_token",
          refreshToken: "cookie_refresh_token",
        }),
      })
    );
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    const cookieString = setCookieHeaders.join("; ");
    expect(cookieString).toContain("access_token=;");
    expect(cookieString).toMatch(/anonymous_token=anon_/);
  });

  it("should return 401 if no access token is provided", async () => {
    // Arrange
    const request = new NextRequest(
      "https://store.example.com/api/auth/logout",
      {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      }
    );

    // Act
    const response = await POST(request);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(responseBody.error).toBe("No access token provided");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should handle fetch failure gracefully", async () => {
    // Arrange
    jest.clearAllMocks(); // Ensure clean state
    const request = new NextRequest(
      "https://store.example.com/api/auth/logout",
      {
        method: "POST",
        body: JSON.stringify({ accessToken: "test_token" }),
        headers: { "Content-Type": "application/json" },
      }
    );

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    // Act
    const response = await POST(request);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(responseBody.error).toBe("Failed to logout");
  });

  it("should generate a new anonymous token on every logout", async () => {
    // Arrange
    const request = new NextRequest(
      "https://store.example.com/api/auth/logout",
      {
        method: "POST",
        body: JSON.stringify({ accessToken: "test_token" }),
        headers: { "Content-Type": "application/json" },
      }
    );
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      )
    );

    // Act
    const response1 = await POST(request);
    const request2 = new NextRequest(
      "https://store.example.com/api/auth/logout",
      {
        method: "POST",
        body: JSON.stringify({ accessToken: "test_token" }),
        headers: { "Content-Type": "application/json" },
      }
    );
    const response2 = await POST(request2);

    // Assert
    const setCookieHeaders1 = response1.headers.getSetCookie?.() || [];
    const setCookieHeaders2 = response2.headers.getSetCookie?.() || [];

    const cookies1 = setCookieHeaders1.join("; ");
    const cookies2 = setCookieHeaders2.join("; ");

    const anonToken1 = /anonymous_token=([^;]+)/.exec(cookies1)?.[1];
    const anonToken2 = /anonymous_token=([^;]+)/.exec(cookies2)?.[1];

    expect(anonToken1).toBeDefined();
    expect(anonToken2).toBeDefined();
    expect(anonToken1).not.toBe(anonToken2);
  });
});
