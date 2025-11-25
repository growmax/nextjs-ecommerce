import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { preferenceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

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

// Filter Preference Interfaces
export interface FilterPreference {
  filter_index: number;
  filter_name: string;
  accountId: number[];
  partnerAcccountId?: number[];
  accountOwners: string[];
  approvalAwaiting: string[];
  endDate: string;
  endCreatedDate: string;
  endValue: number | null | string;
  endTaxableAmount: number | null | string;
  endGrandTotal: number | null | string;
  identifier: string;
  limit: number;
  offset: number;
  name: string;
  pageNumber: number;
  startDate: string;
  startCreatedDate: string;
  startValue: number | null | string;
  startTaxableAmount: number | null | string;
  startGrandTotal: number | null | string;
  status: string[];
  quoteUsers: string[];
  tagsList: string[];
  options: string[];
  branchId: number[];
  businessUnitId: number[];
  selectedColumn?: string[];
  selectedColumns: string[];
  columnWidth: Array<{
    id: string;
    width: number;
  }>;
  columnPosition: string;
  partnerAccountId?: number[];
  userDisplayName?: string;
  userStatus?: string[];
}

export interface PreferenceData {
  filters: FilterPreference[];
  selected: number;
}

export interface FilterPreferenceResponse {
  id: number;
  userId: number;
  companyId: number;
  isMobile: boolean;
  module: string;
  preference: PreferenceData;
}

// Order Preferences Request Interface
export interface OrderPreferencesRequest {
  userId: number;
  companyId: number;
  tenantCode: string;
  module: string;
  isMobile?: boolean;
}

// Order Preferences Response Interface
export interface OrderPreferencesResponse {
  data: {
    id?: number;
    userId: number;
    companyId: number;
    isMobile: boolean;
    module: string;
    preferences: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
  };
  message: string | null;
  status: string;
}

export class PreferenceService extends BaseService<PreferenceService> {
  // Using preferenceClient for userpreference microservice
  protected defaultClient = preferenceClient;
  private jwtService = JWTService.getInstance();

  /**
   * Get user data from JWT token
   * @returns Object with userId, companyId, and tenantId
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

    // Type-safe way to access elasticCode if it exists
    const elasticCode =
      typeof payload.elasticCode === "string" ? payload.elasticCode : "";

    return {
      userId: payload.userId.toString(),
      companyId: payload.companyId.toString(),
      tenantCode: payload.tenantId || elasticCode || "",
    };
  }

  /**
   * Create request data with user info from token
   * @param module - The module type
   * @param data - Additional data to include
   * @param isMobile - Mobile flag
   * @returns Request data object
   */
  private createRequestData(
    module: string,
    data: Record<string, unknown> = {},
    isMobile: boolean = false
  ) {
    const { userId, companyId } = this.getUserDataFromToken();
    return {
      userId: parseInt(userId),
      companyId: parseInt(companyId),
      module,
      isMobile,
      ...data,
    };
  }

  /**
   * Generic server-safe wrapper that returns null on error
   * @param fn - The function to execute
   * @returns Function result or null if error
   */
  private async serverSafe<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch {
      return null;
    }
  }

  /**
   * Find user preferences for a specific module (auto-extracts user data from token)
   * @param module - The module type (order, quote, etc.)
   * @returns User preferences
   */
  async findPreferences(module: string): Promise<UserPreference> {
    const { userId, tenantCode } = this.getUserDataFromToken();
    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}&isMobile=false`,
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
    return this.serverSafe(() => this.findPreferences(module));
  }

  /**
   * Find user preferences with explicit parameters (for advanced usage)
   * @param userId - The user ID
   * @param module - The module type (order, quote, etc.)
   * @param tenantCode - The tenant code
   * @param isMobile - Mobile flag
   * @returns User preferences
   */
  async findPreferencesWithParams(
    userId: number,
    module: string,
    tenantCode: string,
    isMobile: boolean = false
  ): Promise<UserPreference> {
    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}&isMobile=${isMobile}`,
      {},
      "GET"
    )) as UserPreference;
  }

  /**
   * Server-safe version with custom context (for API routes)
   * @param userId - The user ID
   * @param module - The module type (order, quote, etc.)
   * @param context - Request context with accessToken and other fields
   * @returns User preferences or null if error
   */
  async findPreferencesWithParamsServerSide(
    userId: number,
    module: string,
    context: {
      accessToken: string;
      companyId: number;
      isMobile: boolean;
      userId: number;
      tenantCode: string;
    }
  ): Promise<UserPreference | null> {
    try {
      return (await this.callWithSafe(
        `/preferences/find?userId=${userId}&module=${module}&tenantCode=${context.tenantCode}`,
        {},
        { context, method: "GET" }
      )) as UserPreference | null;
    } catch {
      return null;
    }
  }

  /**
   * Find order preferences with company context
   * @param requestData - Object containing userId, companyId, module, and optional isMobile
   * @returns Order preferences response
   */
  async findOrderPreferences(
    requestData: OrderPreferencesRequest
  ): Promise<OrderPreferencesResponse> {
    const { userId, tenantCode, module, isMobile = false } = requestData;

    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}&isMobile=${isMobile}`,
      requestData,
      "GET"
    )) as OrderPreferencesResponse;
  }

  /**
   * Find order preferences with auto-extracted user data
   * @param isMobile - Optional flag for mobile preferences
   * @returns Order preferences response
   */
  async findOrderPreferencesAuto(
    isMobile: boolean = false
  ): Promise<OrderPreferencesResponse> {
    const { userId, companyId, tenantCode } = this.getUserDataFromToken();

    const requestData: OrderPreferencesRequest = {
      userId: parseInt(userId),
      companyId: parseInt(companyId),
      tenantCode,
      module: "order",
      isMobile,
    };

    return (await this.call(
      `/preferences/find?userId=${userId}&module=order&tenantCode=${tenantCode}&isMobile=${isMobile}`,
      requestData,
      "GET"
    )) as OrderPreferencesResponse;
  }

  /**
   * Server-safe version for order preferences
   * @param isMobile - Optional flag for mobile preferences
   * @returns Order preferences response or null if error
   */
  async findOrderPreferencesServerSide(
    isMobile: boolean = false
  ): Promise<OrderPreferencesResponse | null> {
    return this.serverSafe(() => this.findOrderPreferencesAuto(isMobile));
  }

  /**
   * Find filter preferences for a specific module with auto-extracted user data
   * @param module - The module type (quote, order, etc.)
   * @returns Filter preferences response with filters array
   */
  async findFilterPreferences(
    module: string
  ): Promise<FilterPreferenceResponse> {
    const { userId, tenantCode } = this.getUserDataFromToken();
    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&tenantCode=${tenantCode}&isMobile=false`,
      {},
      "GET"
    )) as FilterPreferenceResponse;
  }

  /**
   * Server-safe version for filter preferences
   * @param module - The module type (quote, order, etc.)
   * @returns Filter preferences response or null if error
   */
  async findFilterPreferencesServerSide(
    module: string
  ): Promise<FilterPreferenceResponse | null> {
    return this.serverSafe(() => this.findFilterPreferences(module));
  }

  // ========================================
  // POST METHODS FOR CREATING/UPDATING PREFERENCES
  // ========================================

  /**
   * Create/Update user preferences with auto-extracted user data
   * @param module - The module type (order, quote, etc.)
   * @param preferences - The preferences data to save
   * @returns Created/Updated preference response
   */
  async createPreferences(
    module: string,
    preferences: Record<string, unknown>
  ): Promise<UserPreference> {
    const requestData = this.createRequestData(module, { preferences });

    return (await this.call(
      `/preferences`,
      requestData,
      "POST"
    )) as UserPreference;
  }

  /**
   * Server-safe version for creating preferences
   * @param module - The module type (order, quote, etc.)
   * @param preferences - The preferences data to save
   * @returns Created preference response or null if error
   */
  async createPreferencesServerSide(
    module: string,
    preferences: Record<string, unknown>
  ): Promise<UserPreference | null> {
    return this.serverSafe(() => this.createPreferences(module, preferences));
  }

  /**
   * Update user preferences with auto-extracted user data
   * @param module - The module type (order, quote, etc.)
   * @param preferences - The preferences data to update
   * @returns Updated preference response
   */
  async updatePreferences(
    module: string,
    preferences: Record<string, unknown>
  ): Promise<UserPreference> {
    const requestData = this.createRequestData(module, { preferences });

    return (await this.call(
      `/preferences/update`,
      requestData,
      "POST"
    )) as UserPreference;
  }

  /**
   * Server-safe version for updating preferences
   * @param module - The module type (order, quote, etc.)
   * @param preferences - The preferences data to update
   * @returns Updated preference response or null if error
   */
  async updatePreferencesServerSide(
    module: string,
    preferences: Record<string, unknown>
  ): Promise<UserPreference | null> {
    return this.serverSafe(() => this.updatePreferences(module, preferences));
  }

  /**
   * Save (create or update) user preferences with auto-extracted user data
   * Matches the curl example format with query parameters
   * @param module - The module type (order, quote, etc.)
   * @param preferences - The preferences data to save
   * @returns Saved preference response
   */
  async savePreferences(
    module: string,
    preferences: Record<string, unknown>
  ): Promise<UserPreference> {
    const { userId, tenantCode } = this.getUserDataFromToken();

    return (await this.call(
      `/preferences/save?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      preferences,
      "POST"
    )) as UserPreference;
  }

  /**
   * Server-safe version for saving preferences
   * @param module - The module type (order, quote, etc.)
   * @param preferences - The preferences data to save
   * @returns Saved preference response or null if error
   */
  async savePreferencesServerSide(
    module: string,
    preferences: Record<string, unknown>
  ): Promise<UserPreference | null> {
    return this.serverSafe(() => this.savePreferences(module, preferences));
  }

  /**
   * Save filter preferences for a specific module with auto-extracted user data
   * Matches the curl example format with query parameters
   * @param module - The module type (quote, order, etc.)
   * @param filterPreferences - The filter preferences data to save
   * @returns Saved filter preferences response
   */
  async saveFilterPreferences(
    module: string,
    filterPreferences: PreferenceData
  ): Promise<FilterPreferenceResponse> {
    const { userId, tenantCode } = this.getUserDataFromToken();

    return (await this.call(
      `/preferences/save?userId=${userId}&module=${module}&tenantCode=${tenantCode}`,
      filterPreferences,
      "POST"
    )) as FilterPreferenceResponse;
  }

  /**
   * Server-safe version for saving filter preferences
   * @param module - The module type (quote, order, etc.)
   * @param filterPreferences - The filter preferences data to save
   * @returns Saved filter preferences response or null if error
   */
  async saveFilterPreferencesServerSide(
    module: string,
    filterPreferences: PreferenceData
  ): Promise<FilterPreferenceResponse | null> {
    return this.serverSafe(() =>
      this.saveFilterPreferences(module, filterPreferences)
    );
  }

  // ========================================
  // ADVANCED POST METHODS WITH CUSTOM CONTEXT
  // ========================================

  /**
   * Create preferences with custom context (for advanced usage)
   * @param module - The module type (order, quote, etc.)
   * @param preferences - The preferences data to save
   * @param context - Request context with accessToken and other fields
   * @returns Created preference response
   */
  async createPreferencesWithContext(
    module: string,
    preferences: Record<string, unknown>,
    context: {
      accessToken: string;
      companyId: number;
      isMobile: boolean;
      userId: number;
      tenantCode: string;
    }
  ): Promise<UserPreference> {
    const requestData = {
      userId: context.userId,
      companyId: context.companyId,
      module,
      preferences,
      isMobile: context.isMobile,
    };

    return (await this.callWithSafe(`/preferences`, requestData, {
      context,
      method: "POST",
    })) as UserPreference;
  }

  /**
   * Server-safe version for creating preferences with custom context
   * @param module - The module type (order, quote, etc.)
   * @param preferences - The preferences data to save
   * @param context - Request context with accessToken and other fields
   * @returns Created preference response or null if error
   */
  async createPreferencesWithContextServerSide(
    module: string,
    preferences: Record<string, unknown>,
    context: {
      accessToken: string;
      companyId: number;
      isMobile: boolean;
      userId: number;
      tenantCode: string;
    }
  ): Promise<UserPreference | null> {
    return this.serverSafe(() =>
      this.createPreferencesWithContext(module, preferences, context)
    );
  }

  /**
   * Save filter preferences with custom context (for API routes)
   * @param module - The module type (order, quote, etc.)
   * @param filterPreferences - The filter preferences data to save
   * @param context - Request context with accessToken and other fields
   * @returns Saved filter preferences response
   */
  async saveFilterPreferencesWithContext(
    module: string,
    filterPreferences: PreferenceData,
    context: {
      accessToken: string;
      companyId: number;
      isMobile: boolean;
      userId: number;
      tenantCode: string;
    }
  ): Promise<FilterPreferenceResponse> {
    return (await this.callWithSafe(
      `/preferences/save?userId=${context.userId}&module=${module}&tenantCode=${context.tenantCode}`,
      filterPreferences,
      { context, method: "POST" }
    )) as FilterPreferenceResponse;
  }

  /**
   * Server-safe version for saving filter preferences with custom context
   * @param module - The module type (order, quote, etc.)
   * @param filterPreferences - The filter preferences data to save
   * @param context - Request context with accessToken and other fields
   * @returns Saved filter preferences response or null if error
   */
  async saveFilterPreferencesWithContextServerSide(
    module: string,
    filterPreferences: PreferenceData,
    context: {
      accessToken: string;
      companyId: number;
      isMobile: boolean;
      userId: number;
      tenantCode: string;
    }
  ): Promise<FilterPreferenceResponse | null> {
    return this.serverSafe(() =>
      this.saveFilterPreferencesWithContext(module, filterPreferences, context)
    );
  }
}

export default PreferenceService.getInstance();
