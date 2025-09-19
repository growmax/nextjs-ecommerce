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

const AUTH_TOKEN_KEY = "access_token";
const USER_DATA_KEY = "user-data";

export class AuthStorage {
  static setTokens(tokens: AuthTokens): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken);

      if (tokens.expiresIn) {
        const expiryTime = new Date().getTime() + tokens.expiresIn * 1000;
        localStorage.setItem("token-expiry", expiryTime.toString());
      }

      // Set client-side cookie for synchronization (non-HttpOnly for client access)
      const isProduction = process.env.NODE_ENV === "production";
      const cookieValue = encodeURIComponent(tokens.accessToken);
      const maxAge = tokens.expiresIn || 86400;

      document.cookie = `access_token_client=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Strict${isProduction ? "; Secure" : ""}`;
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  }

  static setUserData(userData: UserData): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      // Also set user data cookie for server-side access
      const isProduction = process.env.NODE_ENV === "production";
      const userDataString = encodeURIComponent(JSON.stringify(userData));
      document.cookie = `user_data=${userDataString}; path=/; max-age=604800; SameSite=Strict${isProduction ? "; Secure" : ""}`;
    }
  }

  static getUserData(): UserData | null {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  static clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem("token-expiry");

      // Clear auth cookie with all security attributes
      const isProduction = process.env.NODE_ENV === "production";
      const secureFlag = isProduction ? "; Secure" : "";

      document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`;
      document.cookie = `user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`;
      document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`;
      // Also clear legacy auth-token if it exists
      document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${secureFlag}`;
    }
  }

  static isTokenExpired(): boolean {
    if (typeof window !== "undefined") {
      const expiry = localStorage.getItem("token-expiry");
      if (expiry) {
        return new Date().getTime() > parseInt(expiry);
      }
    }
    return false;
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

      // Update localStorage with new tokens
      if (tokens.accessToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken);

        if (tokens.expiresIn) {
          const expiryTime = new Date().getTime() + tokens.expiresIn * 1000;
          localStorage.setItem("token-expiry", expiryTime.toString());
        }
      }

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
