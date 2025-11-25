// Server-side user data fetching service
import { UserApiResponse } from "@/lib/interfaces/UserInterfaces";
import { CookieService } from "@/lib/services/CookieService";
import { SessionValidator } from "@/lib/services/SessionValidator";
import { UserApiService } from "@/lib/services/UserApiService";

/**
 * ServerUserService - Handles server-side user data fetching
 * Consistent with TenantService pattern using static methods
 */
export class ServerUserService {
  public static async fetchUserDataServerSide(): Promise<UserApiResponse | null> {
    try {
      // Get services from singletons (consistent with other services)
      const cookieService = CookieService.getInstance();
      const sessionValidator = SessionValidator.getInstance();
      const userApiService = UserApiService.getInstance();

      // Get token from server-side cookies
      const token = await cookieService.getTokenFromCookies();
      if (!token) {
        return null;
      }

      // Validate token and extract credentials
      const validation = sessionValidator.validateToken(token);
      if (!validation.isValid || !validation.payload) {
        return null;
      }

      const { sub, tenantCode } =
        sessionValidator.extractUserCredentials(token) || {};
      if (!sub || !tenantCode) {
        return null;
      }

      // Fetch user data from API
      const userData = await userApiService.fetchUserDetailsServerSide(
        sub,
        tenantCode,
        token
      );

      return userData;
    } catch {
      return null;
    }
  }
}
