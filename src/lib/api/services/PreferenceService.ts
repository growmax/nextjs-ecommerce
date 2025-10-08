import { preferenceClient } from "../client";
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
  endValue: number | null;
  endTaxableAmount: number | null;
  endGrandTotal: number | null;
  identifier: string;
  limit: number;
  offset: number;
  name: string;
  pageNumber: number;
  startDate: string;
  startCreatedDate: string;
  startValue: number | null;
  startTaxableAmount: number | null;
  startGrandTotal: number | null;
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
   * @returns Object with userId and companyId
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
      companyId: payload.companyId.toString(),
    };
  }

  /**
   * Find user preferences for a specific module (auto-extracts user data from token)
   * @param module - The module type (order, quote, etc.)
   * @returns User preferences
   */
  async findPreferences(module: string): Promise<UserPreference> {
    const { userId, companyId } = this.getUserDataFromToken();
    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&companyId=${companyId}&isMobile=false`,
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
      const { userId, companyId } = this.getUserDataFromToken();
      return (await this.callSafe(
        `/preferences/find?userId=${userId}&module=${module}&companyId=${companyId}&isMobile=false`,
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
   * @param companyId - The company ID
   * @param isMobile - Mobile flag
   * @returns User preferences
   */
  async findPreferencesWithParams(
    userId: number,
    module: string,
    companyId: number,
    isMobile: boolean = false
  ): Promise<UserPreference> {
    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&companyId=${companyId}&isMobile=${isMobile}`,
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
    const { userId, companyId, module, isMobile = false } = requestData;

    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&companyId=${companyId}&isMobile=${isMobile}`,
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
    const { userId, companyId } = this.getUserDataFromToken();

    const requestData: OrderPreferencesRequest = {
      userId: parseInt(userId),
      companyId: parseInt(companyId),
      module: "order",
      isMobile,
    };

    return (await this.call(
      `/preferences/find?userId=${userId}&module=order&companyId=${companyId}&isMobile=${isMobile}`,
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
    try {
      return await this.findOrderPreferencesAuto(isMobile);
    } catch {
      return null;
    }
  }

  /**
   * Find filter preferences for a specific module with auto-extracted user data
   * @param module - The module type (quote, order, etc.)
   * @returns Filter preferences response with filters array
   */
  async findFilterPreferences(
    module: string
  ): Promise<FilterPreferenceResponse> {
    const { userId, companyId } = this.getUserDataFromToken();
    return (await this.call(
      `/preferences/find?userId=${userId}&module=${module}&companyId=${companyId}&isMobile=false`,
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
    try {
      return await this.findFilterPreferences(module);
    } catch {
      return null;
    }
  }
}

export default PreferenceService.getInstance();
