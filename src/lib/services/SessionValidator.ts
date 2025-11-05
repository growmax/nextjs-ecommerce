// Server-side JWT session validation
import { JWTPayload } from "@/lib/interfaces/JWTInterfaces";
import { JWTService } from "./JWTService";

export class SessionValidator {
  private static instance: SessionValidator;
  private jwtService: JWTService;

  private constructor() {
    this.jwtService = JWTService.getInstance();
  }

  public static getInstance(): SessionValidator {
    if (!SessionValidator.instance) {
      SessionValidator.instance = new SessionValidator();
    }
    return SessionValidator.instance;
  }

  public validateToken(token: string): {
    isValid: boolean;
    payload: JWTPayload | null;
    error?: string;
  } {
    try {
      // Check if token exists
      if (!token) {
        return { isValid: false, payload: null, error: "No token provided" };
      }

      // Decode JWT payload
      const payload = this.jwtService.decodeToken(token);
      if (!payload) {
        return { isValid: false, payload: null, error: "Invalid token format" };
      }

      // Check expiration
      if (this.jwtService.isTokenExpired(token)) {
        return { isValid: false, payload: null, error: "Token expired" };
      }

      // Validate required fields
      if (!payload.sub || !payload.iss || !payload.userId) {
        return {
          isValid: false,
          payload: null,
          error: "Missing required token data",
        };
      }

      return { isValid: true, payload };
    } catch {
      return {
        isValid: false,
        payload: null,
        error: "Token validation failed",
      };
    }
  }

  public extractUserCredentials(
    token: string
  ): { sub: string; tenantCode: string } | null {
    const validation = this.validateToken(token);
    if (!validation.isValid || !validation.payload) {
      return null;
    }

    return {
      sub: validation.payload.sub,
      tenantCode: validation.payload.iss,
    };
  }
}
