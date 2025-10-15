import { Mutex } from "async-mutex";
import { AxiosRequestConfig } from "axios";

export interface RefreshTokenResult {
  success: boolean;
  newAccessToken?: string;
  error?: string;
}

export interface QueuedRequest {
  id: string;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  requestConfig: AxiosRequestConfig;
  retryFunction: () => Promise<unknown>;
}

export class TokenRefreshService {
  private static instance: TokenRefreshService;
  private refreshMutex = new Mutex();
  private isRefreshing = false;
  private requestQueue: QueuedRequest[] = [];
  private requestCounter = 0;

  private constructor() {}

  public static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService();
    }
    return TokenRefreshService.instance;
  }

  /**
   * Queue a request that failed with 401 and needs retry after token refresh
   */
  public queueRequest(
    requestConfig: AxiosRequestConfig,
    retryFunction: () => Promise<unknown>
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${++this.requestCounter}_${Date.now()}`;

      this.requestQueue.push({
        id: requestId,
        resolve,
        reject,
        requestConfig,
        retryFunction,
      });

      if (process.env.NODE_ENV === "development") {
      }
    });
  }

  /**
   * Process all queued requests after successful token refresh
   */
  private async processQueuedRequests(success: boolean): Promise<void> {
    const queue = [...this.requestQueue];
    this.requestQueue = [];

    if (process.env.NODE_ENV === "development") {
    }

    for (const queuedRequest of queue) {
      try {
        if (success) {
          // Retry the original request with new token
          const result = await queuedRequest.retryFunction();
          queuedRequest.resolve(result);
        } else {
          // Reject all queued requests
          queuedRequest.reject(new Error("Token refresh failed"));
        }
      } catch (error) {
        queuedRequest.reject(error);
      }
    }
  }

  /**
   * Clear all queued requests (used when user logs out)
   */
  public clearQueue(): void {
    const queue = [...this.requestQueue];
    this.requestQueue = [];

    queue.forEach(request => {
      request.reject(new Error("Authentication session ended"));
    });
  }

  /**
   * Main token refresh method with queue management
   */
  public async refreshToken(): Promise<RefreshTokenResult> {
    // If already refreshing, wait for the current refresh to complete
    if (this.isRefreshing) {
      return new Promise(resolve => {
        const checkRefresh = () => {
          if (!this.isRefreshing) {
            resolve({ success: true });
          } else {
            setTimeout(checkRefresh, 100);
          }
        };
        checkRefresh();
      });
    }

    const release = await this.refreshMutex.acquire();

    try {
      this.isRefreshing = true;

      if (process.env.NODE_ENV === "development") {
      }

      // Call the refresh API endpoint
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();

        if (process.env.NODE_ENV === "development") {
        }

        // Process all queued requests with success
        await this.processQueuedRequests(true);

        return {
          success: true,
          newAccessToken: refreshData.accessToken,
        };
      } else {
        const errorData = await refreshResponse.json().catch(() => ({}));

        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error(
            "❌ Token refresh failed:",
            refreshResponse.status,
            errorData
          );
        }

        // Process all queued requests with failure
        await this.processQueuedRequests(false);

        return {
          success: false,
          error: errorData.message || "Token refresh failed",
        };
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("❌ Token refresh error:", error);
      }

      // Process all queued requests with failure
      await this.processQueuedRequests(false);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error during token refresh",
      };
    } finally {
      this.isRefreshing = false;
      release();
    }
  }

  /**
   * Check if a token refresh is currently in progress
   */
  public isRefreshInProgress(): boolean {
    return this.isRefreshing;
  }

  /**
   * Get the number of requests currently in queue
   */
  public getQueueLength(): number {
    return this.requestQueue.length;
  }

  /**
   * Handle authentication failure (logout user)
   */
  public async handleAuthFailure(): Promise<void> {
    this.clearQueue();

    if (typeof window !== "undefined") {
      // Use React Router navigation instead of hard redirect
      const router = (
        window as unknown as {
          __NEXT_ROUTER__?: { push: (path: string) => void };
        }
      ).__NEXT_ROUTER__;
      if (router) {
        router.push("/login");
      } else {
        // Fallback to window.location if router not available
        window.location.href = "/login";
      }
    }

    // Clear cookies
    if (typeof document !== "undefined") {
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "access_token_client=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
  }

  /**
   * Modernized version of the legacy TokenHandler functionality
   * Checks token expiration and refreshes if needed
   */
  public async ensureValidToken(): Promise<boolean> {
    if (typeof window === "undefined") return true; // Server-side, assume valid

    try {
      // Get token from cookie
      const tokenCookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("access_token="));

      if (!tokenCookie) return false;

      const token = tokenCookie.split("=")[1];
      if (!token) return false;

      // Decode JWT to check expiration
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]!));
      const { exp, anonymous } = payload;

      if (anonymous) return true; // Anonymous tokens don't need refresh

      // Check if token will expire in next 2 minutes
      const currentTime = Math.floor(Date.now() / 1000);
      const willExpire = exp && exp - currentTime < 120; // 2 minutes buffer

      if (willExpire) {
        const refreshResult = await this.refreshToken();
        return refreshResult.success;
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Error checking token validity:", error);
      }
      return false;
    }
  }
}

export default TokenRefreshService.getInstance();
