import { cookies } from "next/headers";

/**
 * User data interface for server-side authentication
 */
export interface ServerUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role?: string;
  companyName?: string;
  companyId?: number;
  picture?: string;
}

/**
 * Server-side authentication result
 */
export interface ServerAuthResult {
  isAuthenticated: boolean;
  user: ServerUser | null;
  accessToken: string | null;
  hasAnonymousToken: boolean;
  tokenType: "access" | "anonymous" | "none";
}

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
   *
   * @returns Promise<boolean> - Authentication status
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get(
        ServerAuth.ACCESS_TOKEN_COOKIE
      )?.value;

      if (!accessToken) {
        return false;
      }

      // Check if token is expired
      if (this.isTokenExpired(accessToken)) {
        // Token is expired, attempt refresh
        const refreshSuccess = await this.attemptServerSideRefresh();
        return refreshSuccess;
      }

      return true;
    } catch (_error) {
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
    } catch (_error) {
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
      const cookieStore = await cookies();
      return cookieStore.get(ServerAuth.ACCESS_TOKEN_COOKIE)?.value || null;
    } catch (_error) {
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
   * Check if refresh token exists (indicates user should stay logged in)
   *
   * @returns Promise<boolean> - True if refresh token exists
   */
  private static async attemptServerSideRefresh(): Promise<boolean> {
    try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get("refresh_token")?.value;

      // If refresh token exists, assume user should stay authenticated
      // The client-side token refresh will handle the actual token refresh
      return !!refreshToken;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Check if JWT token is expired
   *
   * @param token - JWT token to check
   * @returns boolean - True if expired
   */
  private static isTokenExpired(token: string): boolean {
    try {
      // Decode JWT payload
      const parts = token.split(".");
      if (parts.length !== 3 || !parts[1]) {
        return true; // Invalid token format
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token has exp claim and if it's expired
      return payload.exp ? payload.exp < currentTime : false;
    } catch (_error) {
      return true; // Treat invalid tokens as expired
    }
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
