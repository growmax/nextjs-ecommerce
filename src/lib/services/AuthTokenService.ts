// Auth Token Service class for managing authentication tokens
import { JWTService } from "./JWTService";
import { JWTPayload } from "@/lib/interfaces/JWTInterfaces";
import TokenRefreshService from "./TokenRefreshService";

export class AuthTokenService {
  private static instance: AuthTokenService;
  private jwtService: JWTService;
  private tokenRefreshService: typeof TokenRefreshService;
  private readonly tokenKey = "access_token";

  private constructor() {
    this.jwtService = JWTService.getInstance();
    this.tokenRefreshService = TokenRefreshService;
  }

  public static getInstance(): AuthTokenService {
    if (!AuthTokenService.instance) {
      AuthTokenService.instance = new AuthTokenService();
    }
    return AuthTokenService.instance;
  }

  public setToken(token: string): void {
    if (typeof window !== "undefined") {
      document.cookie = `${this.tokenKey}=${token}; path=/; secure; samesite=strict`;
    }
  }

  public getToken(): string | null {
    if (typeof window !== "undefined") {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${this.tokenKey}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
      }
    }
    return null;
  }

  public removeToken(): void {
    if (typeof window !== "undefined") {
      document.cookie = `${this.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }

  public isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.jwtService.isTokenExpired(token);
  }

  /**
   * Enhanced token validation with automatic refresh
   * This method will attempt to refresh the token if it's expired or about to expire
   */
  public async ensureValidToken(): Promise<boolean> {
    return await this.tokenRefreshService.ensureValidToken();
  }

  /**
   * Check if token needs refresh (within 2 minutes of expiry)
   */
  public isTokenNearExpiry(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]!));
      const { exp } = payload;

      if (!exp) return false;

      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = exp - currentTime;

      // Return true if token expires within 2 minutes
      return timeUntilExpiry < 120;
    } catch (_error) {
      return true; // Treat parsing errors as expired
    }
  }

  public getTokenPayload(): JWTPayload | null {
    const token = this.getToken();
    if (!token) return null;
    return this.jwtService.getTokenPayload(token);
  }

  public getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    return this.jwtService.getUserIdFromToken(token);
  }

  public getTenantCode(): string | null {
    const token = this.getToken();
    if (!token) return null;
    return this.jwtService.getTenantFromToken(token);
  }

  /**
   * Logout user and clear all authentication data
   */
  public async logout(): Promise<void> {
    // Clear the token refresh queue
    this.tokenRefreshService.clearQueue();

    // Remove tokens from cookies
    this.removeToken();

    // Clear additional auth cookies
    if (typeof document !== "undefined") {
      document.cookie =
        "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "access_token_client=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "anonymous_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
  }

  /**
   * Get token refresh service instance for advanced operations
   */
  public getRefreshService(): typeof TokenRefreshService {
    return this.tokenRefreshService;
  }

  /**
   * Legacy method compatibility - modernized token handler functionality
   * @deprecated Use ensureValidToken() instead
   */
  public async validateAndRefreshToken(): Promise<boolean> {
    return await this.ensureValidToken();
  }
}
