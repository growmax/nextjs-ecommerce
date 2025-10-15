interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface UserData {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role?: string;
  companyName?: string;
  companyId?: number;
  picture?: string;
}

// Authentication is now handled entirely through cookies
// No localStorage constants needed

export class AuthStorage {
  // Token management is now handled entirely by server-side cookies
  // This class now only provides client-side access methods

  static setTokens(_tokens: AuthTokens): void {
    // Tokens are set by server-side API routes as HttpOnly cookies
    // This method is kept for backward compatibility but does nothing
    // Client should rely on cookies set by login/refresh API endpoints
  }

  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      // Get token from client-readable access_token_client cookie
      return this.getTokenFromCookie("access_token_client");
    }
    return null;
  }

  /**
   * Helper method to read tokens from client-accessible cookies
   */
  private static getTokenFromCookie(cookieName: string): string | null {
    if (typeof window === "undefined") return null;

    const name = `${cookieName}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      if (!c) continue;
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  // User data should be fetched from server using access_token
  // These methods are deprecated but kept for backward compatibility
  static setUserData(_userData: UserData): void {
    // User data is no longer stored client-side for security
    // Data should be fetched from server on each request using access_token
  }

  static getUserData(): UserData | null {
    // User data is no longer stored client-side
    // Components should fetch user data from server using authenticated API calls
    return null;
  }

  static clearAuth(): void {
    if (typeof window !== "undefined") {
      // Clear client-accessible access_token_client cookie
      // Note: HttpOnly cookies cannot be cleared from client-side, but logout API will handle those
      const isProduction = process.env.NODE_ENV === "production";
      const secureFlag = isProduction ? "; Secure" : "";

      // Clear access_token_client cookie
      document.cookie = `access_token_client=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`;
      document.cookie = `access_token_client=; path=/; max-age=0; SameSite=Strict${secureFlag}`;
    }
  }

  /**
   * Performs server-side logout by calling the logout API
   * @returns Promise that resolves to logout result
   */
  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Both accessToken and refreshToken are stored as HttpOnly cookies
      // The API will read them from cookies, but we should send them in body too if available
      const accessToken = this.getAccessToken(); // Get from cookie

      // Call server-side logout API
      // The server will prioritize tokens from request body, then fallback to cookies
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include HttpOnly cookies
        body: JSON.stringify({
          accessToken: accessToken || undefined,
          refreshToken: undefined, // Let server read from cookie
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear local storage and cookies
        this.clearAuth();
        return { success: true };
      } else {
        // Server logout failed, but still clear local data for security
        this.clearAuth();
        return {
          success: false,
          error: data.error || "Logout failed on server",
        };
      }
    } catch (error) {
      // Network error or other issues - still clear local data
      this.clearAuth();
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error during logout",
      };
    }
  }

  static isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

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
    } catch {
      return true; // Treat invalid tokens as expired
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }

  static async refreshToken(): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  } | null> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include HttpOnly cookies
      });

      if (!response.ok) {
        // Refresh token is invalid, clear all auth data
        this.clearAuth();
        return null;
      }

      const tokens = await response.json();

      // Tokens are updated as cookies by the server-side refresh API
      // No need to manually manage localStorage

      return tokens;
    } catch {
      // Network error or other issues, clear auth data
      this.clearAuth();
      return null;
    }
  }

  static async getValidAccessToken(): Promise<string | null> {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    // If token is not expired, return it
    if (!this.isTokenExpired()) {
      return token;
    }

    // Try to refresh the token
    const refreshed = await this.refreshToken();
    return refreshed ? refreshed.accessToken : null;
  }
}
