// Server-side user data fetching service
import { UserApiResponse } from "@/lib/interfaces/UserInterfaces";
import { CookieService } from "./CookieService";
import { SessionValidator } from "./SessionValidator";
import { UserApiService } from "./UserApiService";

export class ServerUserService {
  private static instance: ServerUserService;
  private cookieService: CookieService;
  private sessionValidator: SessionValidator;
  private userApiService: UserApiService;

  private constructor() {
    this.cookieService = CookieService.getInstance();
    this.sessionValidator = SessionValidator.getInstance();
    this.userApiService = UserApiService.getInstance();
  }

  public static getInstance(): ServerUserService {
    if (!ServerUserService.instance) {
      ServerUserService.instance = new ServerUserService();
    }
    return ServerUserService.instance;
  }

  public async fetchUserDataServerSide(): Promise<UserApiResponse | null> {
    try {
      // Get token from server-side cookies
      const token = await this.cookieService.getTokenFromCookies();
      if (!token) {
        return null;
      }

      // Validate token and extract credentials
      const validation = this.sessionValidator.validateToken(token);
      if (!validation.isValid || !validation.payload) {
        return null;
      }

      const { userId, tenantCode } =
        this.sessionValidator.extractUserCredentials(token) || {};
      if (!userId || !tenantCode) {
        return null;
      }

      // Fetch user data from API
      const userData = await this.userApiService.fetchUserDetailsServerSide(
        userId,
        tenantCode,
        token
      );
      return userData;
    } catch {
      return null;
    }
  }

  public async getUserSessionStatus(): Promise<{
    hasSession: boolean;
    userId?: string;
    tenantCode?: string;
    error?: string;
  }> {
    try {
      const token = await this.cookieService.getTokenFromCookies();
      if (!token) {
        return { hasSession: false, error: "No token found" };
      }

      const validation = this.sessionValidator.validateToken(token);
      if (!validation.isValid) {
        return {
          hasSession: false,
          error: validation.error || "Token validation failed",
        };
      }

      const credentials = this.sessionValidator.extractUserCredentials(token);
      if (!credentials) {
        return { hasSession: false, error: "Invalid credentials" };
      }

      return {
        hasSession: true,
        userId: credentials.userId,
        tenantCode: credentials.tenantCode,
      };
    } catch {
      return { hasSession: false, error: "Session validation failed" };
    }
  }
}
