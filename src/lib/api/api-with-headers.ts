/**
 * Fallback API client that directly injects headers
 * Use this if Axios interceptors are being overridden by Next.js
 */

import { coreCommerceClient } from "./client";

// Helper to get token from cookie
function getTokenFromCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Helper to extract tenant from JWT
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

// Get headers with authentication
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    // Add origin header
    headers.origin = window.location.origin;

    // Get token from client cookie
    const accessToken = getTokenFromCookie("access_token_client");

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;

      // Extract tenant from token
      const tenant = getTenantFromToken(accessToken);
      if (tenant) {
        headers["x-tenant"] = tenant;
      }
    } else {
    }
  }

  return headers;
}

// API wrapper that bypasses interceptors and directly injects headers
export const apiWithHeaders = {
  async get(endpoint: string, client = coreCommerceClient) {
    const headers = getAuthHeaders();
    return client.get(endpoint, { headers });
  },

  async post(endpoint: string, data: unknown, client = coreCommerceClient) {
    const headers = getAuthHeaders();
    return client.post(endpoint, data, { headers });
  },

  async put(endpoint: string, data: unknown, client = coreCommerceClient) {
    const headers = getAuthHeaders();
    return client.put(endpoint, data, { headers });
  },

  async delete(endpoint: string, client = coreCommerceClient) {
    const headers = getAuthHeaders();
    return client.delete(endpoint, { headers });
  },
};

// Enhanced BaseService that uses direct header injection
export class DirectHeaderBaseService {
  private static instances: Map<string, unknown> = new Map();
  protected defaultClient = coreCommerceClient;

  public static getInstance<T extends DirectHeaderBaseService>(
    this: new () => T
  ): T {
    const className = this.name;
    if (!DirectHeaderBaseService.instances.has(className)) {
      DirectHeaderBaseService.instances.set(className, new this());
    }
    return DirectHeaderBaseService.instances.get(className) as T;
  }

  protected async call(
    endpoint: string,
    data: unknown = {},
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST"
  ): Promise<unknown> {
    const headers = getAuthHeaders();

    switch (method) {
      case "GET":
        const response = await this.defaultClient.get(endpoint, { headers });
        return response.data;
      case "POST":
        const postResponse = await this.defaultClient.post(endpoint, data, {
          headers,
        });
        return postResponse.data;
      case "PUT":
        const putResponse = await this.defaultClient.put(endpoint, data, {
          headers,
        });
        return putResponse.data;
      case "DELETE":
        const deleteResponse = await this.defaultClient.delete(endpoint, {
          headers,
        });
        return deleteResponse.data;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  protected async callSafe(
    endpoint: string,
    data: unknown = {},
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST"
  ): Promise<unknown | null> {
    try {
      return await this.call(endpoint, data, method);
    } catch {
      return null;
    }
  }
}
