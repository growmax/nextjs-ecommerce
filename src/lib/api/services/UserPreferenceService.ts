import { RequestContext, preferenceClient } from "../client";
import { BaseService } from "./BaseService";

// Define types based on your curl request
export interface PreferenceFilter {
  accountId: string[];
  endDate: string;
  endValue: number | null;
  identifier: string;
  name: string;
  startDate: string;
  startValue: number | null;
  status: string[];
}

export interface PreferenceQueryParams {
  userId: number;
  module: string;
  tenantCode: string;
}

export interface UserPreference {
  id: string;
  userId: number;
  module: string;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PreferenceApiResponse {
  status: string;
  data: UserPreference[];
  message?: string;
}

export class UserPreferenceService extends BaseService<UserPreferenceService> {
  // Use the preference client for userpreference microservice
  protected defaultClient = preferenceClient;

  /**
   * 🚀 SIMPLIFIED: Get user preferences
   * Usage: UserPreferenceService.getPreferences(params, filters)
   */
  async getPreferences(
    params: PreferenceQueryParams,
    filters: PreferenceFilter
  ): Promise<PreferenceApiResponse> {
    const { userId, module, tenantCode } = params;

    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      filters,
      "POST" // Your curl shows it's actually a POST with body
    )) as PreferenceApiResponse;
  }

  /**
   * 🔧 ADVANCED: Get preferences with custom context
   */
  async getPreferencesWithContext(
    params: PreferenceQueryParams,
    filters: PreferenceFilter,
    context: RequestContext
  ): Promise<PreferenceApiResponse> {
    const { userId, module, tenantCode } = params;

    return (await this.callWith(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      filters,
      { context, method: "POST" }
    )) as PreferenceApiResponse;
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side version (auto-context + error handling)
   * Usage: UserPreferenceService.getPreferencesServerSide(params, filters)
   */
  async getPreferencesServerSide(
    params: PreferenceQueryParams,
    filters: PreferenceFilter
  ): Promise<PreferenceApiResponse | null> {
    const { userId, module, tenantCode } = params;

    return (await this.callSafe(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      filters,
      "POST"
    )) as PreferenceApiResponse | null;
  }

  /**
   * 🔧 ADVANCED: Server-side with custom context
   */
  async getPreferencesServerSideWithContext(
    params: PreferenceQueryParams,
    filters: PreferenceFilter,
    context: RequestContext
  ): Promise<PreferenceApiResponse | null> {
    const { userId, module, tenantCode } = params;

    return (await this.callWithSafe(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      filters,
      { context, method: "POST" }
    )) as PreferenceApiResponse | null;
  }

  /**
   * 🚀 SIMPLIFIED: Save user preferences
   */
  async savePreferences(
    params: PreferenceQueryParams,
    preferences: Record<string, unknown>
  ): Promise<PreferenceApiResponse> {
    const { userId, module, tenantCode } = params;

    return (await this.call(
      `/preferences/save?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      { preferences },
      "POST"
    )) as PreferenceApiResponse;
  }

  /**
   * 🛡️ SIMPLIFIED: Server-side save preferences
   */
  async savePreferencesServerSide(
    params: PreferenceQueryParams,
    preferences: Record<string, unknown>
  ): Promise<PreferenceApiResponse | null> {
    const { userId, module, tenantCode } = params;

    return (await this.callSafe(
      `/preferences/save?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      { preferences },
      "POST"
    )) as PreferenceApiResponse | null;
  }

  /**
   * Helper method to create default filter for date ranges
   */
  createDateRangeFilter(
    startDate?: string,
    endDate?: string,
    status?: string[]
  ): PreferenceFilter {
    const currentYear = new Date().getFullYear();
    return {
      accountId: [],
      endDate: endDate || `${currentYear}-12-31T23:59:59.999Z`,
      endValue: null,
      identifier: "",
      name: "",
      startDate: startDate || `${currentYear}-01-01T00:00:00.000Z`,
      startValue: null,
      status: status || [],
    };
  }
}

export default UserPreferenceService.getInstance();
