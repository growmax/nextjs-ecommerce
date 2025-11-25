// Server-side user data fetching service
import { UserApiResponse } from "@/lib/interfaces/UserInterfaces";
import { CookieService } from "./CookieService";
import { SessionValidator } from "./SessionValidator";
import { UserApiService } from "./UserApiService";

/**
 * ServerUserService - Handles server-side user data fetching
 * Consistent with TenantService pattern using static methods
 * 
 * Uses Redis caching to prevent duplicate API calls across requests
 */
export class ServerUserService {
  public static async fetchUserDataServerSide(): Promise<UserApiResponse | null> {
    // Prevent client-side execution
    if (typeof window !== "undefined") {
      return null;
    }

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

      const cacheKey = `user:${sub}:${tenantCode}`;
      
      try {
        const { withRedisCache } = await import("@/lib/cache");
        
   

        const result = await withRedisCache(
          cacheKey,
          async () => {
            const data = await userApiService.fetchUserDetailsServerSide(
              sub,
              tenantCode,
              token
            );
    
            return data;
          },
          600 // 10 minutes TTL
        );
        
        
        return result;
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Fallback to direct call if Redis unavailable
        const result = await userApiService.fetchUserDetailsServerSide(
          sub,
          tenantCode,
          token
        );
        return result;
      }
    } catch {
      return null;
    }
  }
}
