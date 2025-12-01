/**
 * Middleware Test Suite
 * Tests for locale detection, authentication, and static file handling
 * 
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";

// Helper to create mock requests
function createMockRequest(url: string, options: {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
} = {}) {
  const headers = new Headers(options.headers || {});
  const request = new NextRequest(url, { headers });
  
  // Mock cookies if provided
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([key, value]) => {
      request.cookies.set(key, value);
    });
  }
  
  return request;
}

describe("Middleware Tests", () => {
  // Import middleware dynamically to avoid top-level issues
  let middleware: any;
  
  beforeAll(async () => {
    const mod = await import("@/middleware");
    middleware = mod.middleware;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Locale Detection & Redirects", () => {
    test("TC01: Root path without locale redirects to /en", async () => {
      const request = createMockRequest("http://localhost:3001/", {
        headers: { "accept-language": "en-US" },
      });

      const response = await middleware(request);

      // Check if response is a redirect
      expect(response.status).toBe(307); // Temporary redirect
      const location = response.headers.get("location");
      expect(location).toContain("/en");
    });

    test("TC02: Path without locale redirects to /en/path", async () => {
      const request = createMockRequest("http://localhost:3001/products", {
        headers: { "accept-language": "en-US" },
      });

      const response = await middleware(request);

      // Check redirect
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/en/products");
    });

    test("TC03: Valid locale path continues without redirect", async () => {
      const request = createMockRequest("http://localhost:3001/en/products");

      const response = await middleware(request);

      // Should return 200 or continue (not a redirect)
      expect(response.status).not.toBe(307);
    });

    test("TC04: Invalid locale redirects to /en", async () => {
      // Use a 2-letter invalid locale so it's detected as a locale and replaced
      const request = createMockRequest("http://localhost:3001/xx/products");

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/en/products");
    });

    test("TC05: Accept-Language header uses browser locale (Spanish)", async () => {
      const request = createMockRequest("http://localhost:3001/", {
        headers: { "accept-language": "es-ES,es;q=0.9" },
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/es");
    });

    test("TC06: Multi-locale Accept-Language uses first supported", async () => {
      const request = createMockRequest("http://localhost:3001/", {
        headers: { "accept-language": "fr-FR,en;q=0.9,es;q=0.8" },
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/fr");
    });

    test("TC16: Query parameters are preserved", async () => {
      const request = createMockRequest("http://localhost:3001/products?category=electronics", {
        headers: { "accept-language": "en-US" },
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/en/products");
      expect(location).toContain("category=electronics");
    });
  });

  describe("Static Assets & API Routes", () => {
    test("TC07: Static assets bypass middleware", async () => {
      const request = createMockRequest("http://localhost:3001/images/logo.png");

      const response = await middleware(request);

      // Should not redirect
      expect(response.status).not.toBe(307);
    });

    test("TC08: API routes bypass locale processing", async () => {
      const request = createMockRequest("http://localhost:3001/api/products");

      const response = await middleware(request);

      // Should not redirect
      expect(response.status).not.toBe(307);
    });

    test("TC09: _next internals bypass processing", async () => {
      const request = createMockRequest("http://localhost:3001/_next/static/chunk.js");

      const response = await middleware(request);

      // Should not redirect
      expect(response.status).not.toBe(307);
    });

    test("TC10: Public files with locale prefix rewrite correctly", async () => {
      const request = createMockRequest("http://localhost:3001/en/asset/logo.png");

      const response = await middleware(request);

      // A rewrite typically returns a 200 status and sets a 'x-middleware-rewrite' header
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-rewrite")).toContain("/asset/logo.png");
    });
  });

  describe("Authentication Flow", () => {
    test("TC11: Protected route with auth cookie allows access", async () => {
      const request = createMockRequest("http://localhost:3001/en/dashboard", {
        cookies: { access_token: "valid_token_here" },
      });

      const response = await middleware(request);

      // Should allow access (no redirect to login)
      // Note: It might redirect if there's other logic, but shouldn't redirect to login
      const location = response.headers.get("location");
      if (location) {
        expect(location).not.toContain("/login");
      } else {
        expect(response.status).not.toBe(307);
      }
    });

    test("TC12: Protected route without auth redirects to login", async () => {
      const request = createMockRequest("http://localhost:3001/en/dashboard");

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/en/login");
      expect(location).toContain("callbackUrl");
    });

    test("TC13: Login page with auth redirects to dashboard", async () => {
      const request = createMockRequest("http://localhost:3001/en/login", {
        cookies: { access_token: "valid_token_here" },
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/en/dashboard");
    });

    test("TC14: Auth routes preserve locale (Spanish)", async () => {
      const request = createMockRequest("http://localhost:3001/es/login", {
        cookies: { access_token: "valid_token_here" },
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/es/dashboard");
    });
  });

  describe("Edge Cases", () => {
    test("TC15: Malformed locale falls back to /en", async () => {
      // 2-letter invalid locale
      const request = createMockRequest("http://localhost:3001/xx/products");

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/en/products");
    });

    test("TC17: Trailing slashes are handled correctly", async () => {
      const request = createMockRequest("http://localhost:3001/en/products/");

      const response = await middleware(request);

      expect(response.status).not.toBe(307); // Should process normally without redirecting
    });

    test("TC18: Unsupported locale in Accept-Language falls back to en", async () => {
      const request = createMockRequest("http://localhost:3001/", {
        headers: { "accept-language": "de-DE,de;q=0.9" }, // German not supported
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/en");
    });
  });

  describe("Performance & Headers", () => {
    test("Headers are set correctly for authenticated requests", async () => {
      const request = createMockRequest("http://localhost:3001/en/products", {
        cookies: { access_token: "valid_token" },
        headers: { host: "example.com" },
      });

      const response = await middleware(request);

      // Assuming the middleware sets these headers on the response
      expect(response.headers.get("x-authenticated")).toBe("true");
      expect(response.headers.get("x-pathname")).toBe("/en/products");
      expect(response.headers.get("x-tenant-domain")).toBeDefined();
    });

    test("Middleware executes quickly for static paths", async () => {
      const start = performance.now();

      const request = createMockRequest("http://localhost:3001/_next/static/test.js");

      await middleware(request);

      const duration = performance.now() - start;

      // Should execute in under 5ms for static paths
      expect(duration).toBeLessThan(5);
    });
  });
});
