// Auth Token Service class for managing authentication tokens
import { JWTService } from "./JWTService";
import { JWTPayload } from "@/lib/interfaces/UserInterfaces";

export class AuthTokenService {
  private static instance: AuthTokenService;
  private jwtService: JWTService;
  private readonly tokenKey = "access_token";

  private constructor() {
    this.jwtService = JWTService.getInstance();
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
}
