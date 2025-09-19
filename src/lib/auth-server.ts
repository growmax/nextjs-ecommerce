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
}

/**
 * Server-side authentication utilities for SSR and API routes
 *
 * Provides authentication checking without client-side JavaScript,
 * eliminating hydration mismatches and UI flickering.
 */
export class ServerAuth {
  private static readonly ACCESS_TOKEN_COOKIE = "access_token";
  private static readonly USER_DATA_COOKIE = "user_data";
  private static readonly REFRESH_TOKEN_COOKIE = "refresh_token";

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
        return false;
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[ServerAuth] Error checking authentication:", error);
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

      const cookieStore = await cookies();
      const userDataString = cookieStore.get(
        ServerAuth.USER_DATA_COOKIE
      )?.value;

      if (!userDataString) return null;

      // Decode URL-encoded user data
      const decodedUserData = decodeURIComponent(userDataString);
      return JSON.parse(decodedUserData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[ServerAuth] Error getting user data:", error);
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[ServerAuth] Error getting access token:", error);
      return null;
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

      return {
        isAuthenticated,
        user,
        accessToken,
      };
    } catch {
      return {
        isAuthenticated: false,
        user: null,
        accessToken: null,
      };
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[ServerAuth] Error checking token expiration:", error);
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
      `${this.USER_DATA_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`,
      `${this.REFRESH_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`,
    ];
  }
}
