import { apiClient } from "../client";
import { BaseService } from "./BaseService";
import { JWTService } from "@/lib/services/JWTService";
import { AuthStorage } from "@/lib/auth";

// Define preference data types
export interface UserPreference {
  id?: string;
  userId: string;
  module: string;
  preferences: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export type PreferenceModule = "order" | "quote" | string;

export class PreferenceService extends BaseService<PreferenceService> {
  // Using apiClient for PREFERENCES_URL endpoint
  protected defaultClient = apiClient;
  private jwtService = JWTService.getInstance();

  /**
   * Get user data from JWT token
   * @returns Object with userId, tenantCode, and companyId
   */
  private getUserDataFromToken() {
    const token = AuthStorage.getAccessToken();
    if (!token) {
      throw new Error("No access token found");
    }

    const payload = this.jwtService.getTokenPayload(token);
    if (!payload) {
      throw new Error("Invalid token");
    }

    return {
      userId: payload.userId.toString(),
      tenantCode: payload.tenantId,
      companyId: payload.companyId.toString(),
    };
  }

  /**
   * Find user preferences for a specific module (auto-extracts user data from token)
   * @param module - The module type (order, quote, etc.)
   * @returns User preferences
   */
  async findPreferences(module: string): Promise<UserPreference> {
    const { userId, tenantCode } = this.getUserDataFromToken();
    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      {},
      "GET"
    )) as UserPreference;
  }

  /**
   * Server-safe version - returns null on error instead of throwing
   * @param module - The module type (order, quote, etc.)
   * @returns User preferences or null if error
   */
  async findPreferencesServerSide(
    module: string
  ): Promise<UserPreference | null> {
    try {
      const { userId, tenantCode } = this.getUserDataFromToken();
      return (await this.callSafe(
        `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
        {},
        "GET"
      )) as UserPreference | null;
    } catch {
      return null;
    }
  }

  /**
   * Find user preferences with explicit parameters (for advanced usage)
   * @param userId - The user ID
   * @param module - The module type (order, quote, etc.)
   * @param tenantCode - The tenant code (required as query param)
   * @returns User preferences
   */
  async findPreferencesWithParams(
    userId: string,
    module: string,
    tenantCode: string
  ): Promise<UserPreference> {
    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      {},
      "GET"
    )) as UserPreference;
  }
}

export default PreferenceService.getInstance();
