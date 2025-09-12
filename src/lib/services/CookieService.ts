// Server-side cookie management service
import { cookies } from "next/headers";

export class CookieService {
  private static instance: CookieService;
  private readonly tokenKey = "access_token";

  private constructor() {}

  public static getInstance(): CookieService {
    if (!CookieService.instance) {
      CookieService.instance = new CookieService();
    }
    return CookieService.instance;
  }

  public async getTokenFromCookies(): Promise<string | null> {
    try {
      const cookieStore = await cookies();

      // Try both cookie names
      let tokenCookie = cookieStore.get(this.tokenKey); // access_token
      if (!tokenCookie) {
        tokenCookie = cookieStore.get("auth-token");
      }

      if (tokenCookie?.value) {
        // Decode URL-encoded cookie value
        const decodedToken = decodeURIComponent(tokenCookie.value);
        return decodedToken;
      }

      return null;
    } catch {
      return null;
    }
  }

  public async hasValidToken(): Promise<boolean> {
    const token = await this.getTokenFromCookies();
    return token !== null;
  }

  // Client-side cookie methods (for setting cookies after login)
  public setTokenCookie(token: string): void {
    if (typeof window !== "undefined") {
      // Set secure, httpOnly-like cookie (client-side limitation)
      document.cookie = `${this.tokenKey}=${token}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
  }

  public removeTokenCookie(): void {
    if (typeof window !== "undefined") {
      document.cookie = `${this.tokenKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }
}
