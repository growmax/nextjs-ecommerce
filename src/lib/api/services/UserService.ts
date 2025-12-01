import { UserApiResponse } from "@/lib/interfaces/UserInterfaces";
import { coreCommerceClient, RequestContext } from "../client";
import { BaseService } from "./BaseService";

export interface UserDetails {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  companyId?: number;
  companyName?: string;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyDetails {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  tenantId?: number;
}

export interface UserProfile {
  user: UserDetails;
  company?: CompanyDetails | undefined;
}

export class UserService extends BaseService<UserService> {
  // Configure default client for user operations
  protected defaultClient = coreCommerceClient;

  /**
   * Fetch user details by user ID/name
   * Compatible with UserServices.getUser interface
   */
  async getUser(params: { sub: string | number }): Promise<UserApiResponse> {
    return (await this.call(
      `userses/findByName?name=${params.sub}`,
      {},
      "GET"
    )) as UserApiResponse;
  }

  /**
   * Fetch user details by user ID/name (with context)
   */
  async getUserDetails(
    sub: string,
    context: RequestContext
  ): Promise<UserApiResponse> {
    return (await this.callWith(
      `userses/findByName?name=${sub}`,
      {},
      { context, method: "GET" }
    )) as UserApiResponse;
  }

  /**
   * Fetch user details for server-side rendering
   * Uses callSafe() to return null on error
   */
  async getUserDetailsServerSide(
    sub: string,
    context: RequestContext
  ): Promise<UserApiResponse | null> {
      return (await this.callWithSafe(
        `userses/findByName?name=${sub}`,
        {},
        { context, method: "GET" }
      )) as UserApiResponse | null;
  }

  /**
   * Fetch company details by company ID
   */
  async getCompanyDetails(
    companyId: string,
    context: RequestContext
  ): Promise<CompanyDetails> {
    return (await this.callWith(
      `companys/${companyId}`,
      {},
      { context, method: "GET" }
    )) as CompanyDetails;
  }

  /**
   * Fetch company details for server-side rendering
   * Uses callSafe() to return null on error
   */
  async getCompanyDetailsServerSide(
    companyId: string,
    context: RequestContext
  ): Promise<CompanyDetails | null> {
    return (await this.callWithSafe(
      `companys/${companyId}`,
      {},
      { context, method: "GET" }
    )) as CompanyDetails | null;
  }

  /**
   * Get complete user profile (user + company data)
   */
  async getUserProfile(
    userId: string,
    context: RequestContext
  ): Promise<UserProfile> {
    const userResponse = await this.getUserDetails(userId, context);

    let company: CompanyDetails | undefined;
    if (userResponse.data?.companyId) {
      try {
        company = await this.getCompanyDetails(
          userResponse.data.companyId.toString(),
          context
        );
      } catch {
        // Company fetch failed, continue without company data
      }
    }

    return {
      user: userResponse.data as unknown as UserDetails,
      company,
    };
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserDetails>,
    context: RequestContext
  ): Promise<UserDetails> {
    return (await this.callWith(`userses/${userId}`, updates, {
      context,
      method: "PUT",
    })) as UserDetails;
  }

  /**
   * Update user company
   */
  async updateCompany(
    companyId: string,
    updates: Partial<CompanyDetails>,
    context: RequestContext
  ): Promise<CompanyDetails> {
    return (await this.callWith(`companys/${companyId}`, updates, {
      context,
      method: "PUT",
    })) as CompanyDetails;
  }

  /**
   * Search users
   */
  async searchUsers(
    query: string,
    context: RequestContext,
    options?: {
      limit?: number;
      offset?: number;
      filters?: Record<string, unknown>;
    }
  ): Promise<{ users: UserDetails[]; total: number }> {
    const params = new URLSearchParams({
      q: query,
      limit: String(options?.limit || 10),
      offset: String(options?.offset || 0),
      ...(options?.filters &&
        Object.fromEntries(
          Object.entries(options.filters).map(([k, v]) => [
            k,
            String(v),
          ])
        )),
    });

    return (await this.callWith(
      `userses/search?${params.toString()}`,
      {},
      { context, method: "GET" }
    )) as { users: UserDetails[]; total: number };
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(
    userId: string,
    context: RequestContext
  ): Promise<string[]> {
    const response = (await this.callWith(
      `userses/${userId}/permissions`,
      {},
      { context, method: "GET" }
    )) as { permissions?: string[] };
    return response.permissions || [];
  }

  /**
   * Upload user avatar
   * Note: FormData is handled automatically by axios (Content-Type with boundary)
   */
  async uploadAvatar(
    userId: string,
    file: File,
    context: RequestContext
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    // Use callApi for FormData - axios automatically sets Content-Type with boundary
    return (await this.callApi(
      `userses/${userId}/avatar`,
      formData,
      context,
      "POST",
      this.defaultClient
    )) as { url: string };
  }

  /**
   * Delete user account
   */
  async deleteUser(
    userId: string,
    context: RequestContext
  ): Promise<{ success: boolean }> {
    return (await this.callWith(`userses/${userId}`, {}, {
      context,
      method: "DELETE",
    })) as { success: boolean };
  }
}

export default UserService.getInstance();
