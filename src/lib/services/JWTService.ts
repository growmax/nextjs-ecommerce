// JWT Service class for token management
import { JWTPayload } from "@/lib/interfaces/UserInterfaces";

export class JWTService {
  private static instance: JWTService;

  private constructor() {}

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  public decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  public isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    return Date.now() >= payload.exp * 1000;
  }

  public getUserIdFromToken(token: string): string | null {
    const payload = this.decodeToken(token);
    return payload ? payload.sub : null;
  }

  public getTenantFromToken(token: string): string | null {
    const payload = this.decodeToken(token);
    return payload ? payload.iss : null;
  }

  public getTokenPayload(token: string): JWTPayload | null {
    return this.decodeToken(token);
  }
}
