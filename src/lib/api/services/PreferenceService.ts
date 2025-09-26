import { apiClient } from "../client";
import { BaseService } from "./BaseService";

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

  /**
   * Find user preferences for a specific module
   * @param userId - The user ID
   * @param module - The module type (order, quote, etc.)
   * @param tenantCode - The tenant code (required as query param)
   * @returns User preferences
   */
  async findPreferences(
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

  /**
   * Server-safe version - returns null on error instead of throwing
   * @param userId - The user ID
   * @param module - The module type (order, quote, etc.)
   * @param tenantCode - The tenant code (required as query param)
   * @returns User preferences or null if error
   */
  async findPreferencesServerSide(
    userId: string,
    module: string,
    tenantCode: string
  ): Promise<UserPreference | null> {
    return (await this.callSafe(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      {},
      "GET"
    )) as UserPreference | null;
  }
}

export default PreferenceService.getInstance();
