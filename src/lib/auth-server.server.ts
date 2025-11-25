import { ServerAuthResult, ServerUser } from "./auth-types";

/**
 * Server-side authentication utilities for SSR and API routes
 *
 * Provides authentication checking without client-side JavaScript,
 * eliminating hydration mismatches and UI flickering.
 */
export class ServerAuth {
  private static readonly ACCESS_TOKEN_COOKIE = "access_token";
  private static readonly REFRESH_TOKEN_COOKIE = "refresh_token";
  private static readonly ANONYMOUS_TOKEN_COOKIE = "anonymous_token";

  /**
   * Check if user is authenticated (server-side)
   * Checks both token existence and validity (including expiration)
   *
   * @returns Promise<boolean> - Authentication status
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const accessToken = cookieStore.get(
        ServerAuth.ACCESS_TOKEN_COOKIE
      )?.value;

      // Check if token exists
      if (!accessToken) {
        return false;
      }

      // Import SessionValidator dynamically to avoid circular imports
      const { SessionValidator } = await import(
        "@/lib/services/SessionValidator"
      );

      // Validate token (including expiration check)
      const sessionValidator = SessionValidator.getInstance();
      const validation = sessionValidator.validateToken(accessToken);

      return validation.isValid;
    } catch {
      return false;
    }
  }

  /**
   * Get user data from cookies (server-side)
   *
   * @returns Promise<ServerUser | null> - User data or null if not authenticated
   */
  static async getUserData(): Promise<ServerUser | null> {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) return null;

      // User data should be fetched from your user API using access_token
      // This is more secure than storing user data in cookies
      // Implementation would depend on your user service API
      // getUserData: User data should be fetched from API, not cookies
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get access token from cookies (server-side)
   *
   * @returns string | null - Access token or null if not found
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get(ServerAuth.ACCESS_TOKEN_COOKIE)?.value || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if anonymous token exists (server-side)
   *
   * @returns Promise<boolean> - Whether anonymous token exists
   */
  static async hasAnonymousToken(): Promise<boolean> {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const anonymousToken = cookieStore.get(
        this.ANONYMOUS_TOKEN_COOKIE
      )?.value;
      return !!anonymousToken;
    } catch {
      return false;
    }
  }

  /**
   * Get complete authentication state (server-side)
   *
   * @returns Promise<ServerAuthResult> - Complete auth state
   */
  static async getAuthState(): Promise<ServerAuthResult> {
    try {
      const isAuthenticated = await this.isAuthenticated();
      const user = isAuthenticated ? await this.getUserData() : null;
      const accessToken = isAuthenticated
        ? await ServerAuth.getAccessToken()
        : null;
      const hasAnonymousToken = await this.hasAnonymousToken();

      let tokenType: "access" | "anonymous" | "none" = "none";
      if (isAuthenticated) {
        tokenType = "access";
      } else if (hasAnonymousToken) {
        tokenType = "anonymous";
      }

      return {
        isAuthenticated,
        user,
        accessToken,
        hasAnonymousToken,
        tokenType,
      };
    } catch {
      return {
        isAuthenticated: false,
        user: null,
        accessToken: null,
        hasAnonymousToken: false,
        tokenType: "none",
      };
    }
  }

  /**
   * Check if user should see authenticated UI elements
   * Main function for conditional rendering based on authentication
   *
   * @returns Promise<boolean> - Whether to show authenticated UI
   */
  static async shouldShowAuthenticatedUI(): Promise<boolean> {
    return await this.isAuthenticated();
  }

  /**
   * Check if user should see unauthenticated UI elements
   *
   * @returns Promise<boolean> - Whether to show unauthenticated UI
   */
  static async shouldShowUnauthenticatedUI(): Promise<boolean> {
    const isAuth = await this.isAuthenticated();
    return !isAuth;
  }

  /**
   * Utility to create secure cookie string for setting cookies
   *
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   * @returns string - Cookie string for document.cookie
   */
  static createCookieString(
    name: string,
    value: string,
    options?: {
      maxAge?: number;
      path?: string;
      secure?: boolean;
      sameSite?: "Strict" | "Lax" | "None";
    }
  ): string {
    const {
      maxAge = 7 * 24 * 60 * 60, // 7 days default
      path = "/",
      secure = process.env.NODE_ENV === "production",
      sameSite = "Strict",
    } = options || {};

    let cookieString = `${name}=${encodeURIComponent(value)}`;
    cookieString += `; path=${path}`;
    cookieString += `; max-age=${maxAge}`;
    cookieString += `; SameSite=${sameSite}`;

    if (secure) {
      cookieString += "; Secure";
    }

    return cookieString;
  }

  /**
   * Utility to clear authentication cookies
   *
   * @returns string[] - Array of cookie clear strings
   */
  static getClearCookieStrings(): string[] {
    const isProduction = process.env.NODE_ENV === "production";
    const secureFlag = isProduction ? "; Secure" : "";

    return [
      `${this.ACCESS_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`,
      `${this.REFRESH_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`,
    ];
  }
}

// Convenience functions for common authentication checks
export const isServerAuthenticated = () => ServerAuth.isAuthenticated();
export const getServerAuthState = () => ServerAuth.getAuthState();
export const shouldShowAuthenticatedUI = () =>
  ServerAuth.shouldShowAuthenticatedUI();
export const shouldShowUnauthenticatedUI = () =>
  ServerAuth.shouldShowUnauthenticatedUI();
