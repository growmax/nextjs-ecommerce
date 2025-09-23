import axios, {
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
} as const;

// Types
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
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
        const accessToken = getTokenFromCookie("access_token");
        if (accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;

          // Auto-inject tenant header
          const tenant = getTenantFromToken(accessToken);
          if (tenant && !config.headers["x-tenant"]) {
            config.headers["x-tenant"] = tenant;
          }
        }
      }

      // Log requests in development
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
        });
      }

      return config;
    },
    error => {
      // eslint-disable-next-line no-console
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log responses in development
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(
          `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
          {
            status: response.status,
            data: response.data,
          }
        );
      }
      return response;
    },
    async error => {
      const originalRequest = error.config;

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

      // Handle 401 errors - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token via API route
          const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });

          if (refreshResponse.ok) {
            // Retry original request
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // eslint-disable-next-line no-console
          console.error("Token refresh failed:", refreshError);
          // Redirect to login or handle as needed
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      }

      // Transform error
      const apiError = new ApiClientError(
        error.response?.data?.message || error.message || "API request failed",
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
  baseURL: `${API_CONFIG.API_BASE_URL}/corecommerce`,
});

// Generic API client
export const apiClient = createApiClient({
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
