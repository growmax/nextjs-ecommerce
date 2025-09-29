import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// API Configuration
const API_CONFIG = {
  AUTH_URL: process.env.AUTH_URL || "https://api.myapptino.com/auth/",
  HOME_PAGE_URL:
    process.env.HOME_PAGE_URL || "https://api.myapptino.com/homepagepublic/",
  STOREFRONT_URL:
    process.env.STOREFRONT_URL ||
    "https://api.myapptino.com/storefront/graphql",
  CATALOG_URL: process.env.Catalog_URL || "https://api.myapptino.com/catalog",
  API_BASE_URL: process.env.API_BASE_URL || "https://api.myapptino.com",
  CORECOMMERCE_URL:
    process.env.BASE_URL || "https://api.myapptino.com/corecommerce",
} as const;

// Types
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
}

// Extend InternalAxiosRequestConfig to include _retry property
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// API response data interface for error handling
interface ApiResponseData {
  message?: string;
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

export interface RequestContext {
  tenantCode?: string;
  accessToken?: string;
  origin?: string;
}

// Custom error class
export class ApiClientError extends Error implements ApiError {
  public status: number;

  constructor(
    message: string,
    status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status || 500;
  }
}

// Token management helper
function getTokenFromCookie(cookieName: string): string | null {
  if (typeof window === "undefined") return null;

  const name = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) continue;
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

// Extract tenant from JWT
function getTenantFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]!));
    return payload.iss || null;
  } catch {
    return null;
  }
}

// Create axios instance factory
function createApiClient(config: ApiClientConfig = {}): AxiosInstance {
  const instance = axios.create({
    timeout: 30000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    ...config,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Auto-inject authorization token
      if (typeof window !== "undefined") {
        // Use client-specific cookie for browser requests
        const cookieName = "access_token_client";
        const accessToken = getTokenFromCookie(cookieName);
        // Auto-inject origin header
        if (!config.headers.origin) {
          config.headers.origin = window.location.origin;
        }
        if (accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;

          // Auto-inject tenant header
          const tenant = getTenantFromToken(accessToken);
          if (tenant && !config.headers["x-tenant"]) {
            config.headers["x-tenant"] = tenant;
          }
        }
      }

      return config;
    },
    (error: unknown) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetryableAxiosRequestConfig
        | undefined;

      // Log errors in development
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error(
          `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          }
        );
      }
      // Handle 401 errors with modern token refresh service
      // Also handle network errors that might be 401s (CORS/auth failures)
      if (
        (error.response?.status === 401 ||
          (error.code === "ERR_NETWORK" && !error.response)) &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        // Import dynamically to avoid circular dependencies
        const { default: TokenRefreshService } = await import(
          "../services/TokenRefreshService"
        );

        try {
          // Check if refresh is already in progress
          if (TokenRefreshService.isRefreshInProgress()) {
            // Queue this request to retry after current refresh completes
            return TokenRefreshService.queueRequest(originalRequest, () =>
              instance(originalRequest)
            );
          } else {
            // Initiate token refresh and queue this request
            const queuePromise = TokenRefreshService.queueRequest(
              originalRequest,
              () => instance(originalRequest)
            );

            // Start the refresh process
            const refreshResult = await TokenRefreshService.refreshToken();

            if (!refreshResult.success) {
              // If refresh failed, handle auth failure
              await TokenRefreshService.handleAuthFailure();
              throw new ApiClientError("Authentication failed", 401);
            }

            return queuePromise;
          }
        } catch (refreshError) {
          // Handle refresh failure
          await TokenRefreshService.handleAuthFailure();
          throw new ApiClientError(
            refreshError instanceof Error
              ? refreshError.message
              : "Token refresh failed",
            401
          );
        }
      }

      // Transform error
      const responseData = error.response?.data as ApiResponseData | undefined;
      const apiError = new ApiClientError(
        responseData?.message || error.message || "API request failed",
        error.response?.status,
        error.response?.data
      );

      return Promise.reject(apiError);
    }
  );

  return instance;
}

// Pre-configured API clients
export const authClient = createApiClient({
  baseURL: API_CONFIG.AUTH_URL,
});

export const homePageClient = createApiClient({
  baseURL: API_CONFIG.HOME_PAGE_URL,
});

export const storefrontClient = createApiClient({
  baseURL: API_CONFIG.STOREFRONT_URL,
});

export const catalogClient = createApiClient({
  baseURL: API_CONFIG.CATALOG_URL,
});

export const coreCommerceClient = createApiClient({
  baseURL: `${API_CONFIG.CORECOMMERCE_URL}`,
});

// Generic API client
export const apiClient = createApiClient({
  baseURL: API_CONFIG.API_BASE_URL,
});

export const preferenceClient = createApiClient({
  baseURL: API_CONFIG.API_BASE_URL,
});

// Utility functions
export const createClientWithContext = (
  baseClient: AxiosInstance,
  context: RequestContext
) => {
  return {
    get: (url: string, config?: AxiosRequestConfig) =>
      baseClient.get(url, {
        ...config,
        headers: {
          ...config?.headers,
          ...(context.accessToken && {
            Authorization: `Bearer ${context.accessToken}`,
          }),
          ...(context.tenantCode && { "x-tenant": context.tenantCode }),
          ...(context.origin && { origin: context.origin }),
        },
      }),

    post: (url: string, data?: unknown, config?: AxiosRequestConfig) =>
      baseClient.post(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          ...(context.accessToken && {
            Authorization: `Bearer ${context.accessToken}`,
          }),
          ...(context.tenantCode && { "x-tenant": context.tenantCode }),
          ...(context.origin && { origin: context.origin }),
        },
      }),

    put: (url: string, data?: unknown, config?: AxiosRequestConfig) =>
      baseClient.put(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          ...(context.accessToken && {
            Authorization: `Bearer ${context.accessToken}`,
          }),
          ...(context.tenantCode && { "x-tenant": context.tenantCode }),
          ...(context.origin && { origin: context.origin }),
        },
      }),

    delete: (url: string, config?: AxiosRequestConfig) =>
      baseClient.delete(url, {
        ...config,
        headers: {
          ...config?.headers,
          ...(context.accessToken && {
            Authorization: `Bearer ${context.accessToken}`,
          }),
          ...(context.tenantCode && { "x-tenant": context.tenantCode }),
          ...(context.origin && { origin: context.origin }),
        },
      }),
  };
};

export default apiClient;
