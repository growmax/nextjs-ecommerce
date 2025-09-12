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

const AUTH_TOKEN_KEY = "auth-token";
const REFRESH_TOKEN_KEY = "refresh-token";
const USER_DATA_KEY = "user-data";

export class AuthStorage {
  static setTokens(tokens: AuthTokens): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken);

      if (tokens.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      }

      if (tokens.expiresIn) {
        const expiryTime = new Date().getTime() + tokens.expiresIn * 1000;
        localStorage.setItem("token-expiry", expiryTime.toString());
      }

      // Set cookie for middleware to check (with security flags)
      const isProduction = process.env.NODE_ENV === "production";
      const cookieValue = encodeURIComponent(tokens.accessToken);
      const maxAge = tokens.expiresIn || 86400;

      // Set both cookies for compatibility
      document.cookie = `auth-token=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Strict${isProduction ? "; Secure" : ""}`;
      document.cookie = `access_token=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Strict${isProduction ? "; Secure" : ""}`;
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static setUserData(userData: UserData): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
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
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem("token-expiry");

      // Clear both auth cookies with all security attributes
      const isProduction = process.env.NODE_ENV === "production";
      document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${isProduction ? "; Secure" : ""}`;
      document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict${isProduction ? "; Secure" : ""}`;
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
}
