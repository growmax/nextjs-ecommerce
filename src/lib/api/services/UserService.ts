import { UserApiResponse } from "@/lib/interfaces/UserInterfaces";
import {
  coreCommerceClient,
  createClientWithContext,
  RequestContext,
} from "../client";

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

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Fetch user details by user ID/name
   */
  async getUserDetails(
    sub: string,
    context: RequestContext
  ): Promise<UserApiResponse> {
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.get(`/users/findByName?name=${sub}`);

    return response.data;
  }

  /**
   * Fetch user details for server-side rendering
   */
  async getUserDetailsServerSide(
    sub: string,
    context: RequestContext
  ): Promise<UserApiResponse | null> {
    try {
      return await this.getUserDetails(sub, context);
    } catch {
      return null;
    }
  }

  /**
   * Fetch company details by company ID
   */
  async getCompanyDetails(
    companyId: string,
    context: RequestContext
  ): Promise<CompanyDetails> {
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.get(`/companys/${companyId}`);
    return response.data;
  }

  /**
   * Fetch company details for server-side rendering
   */
  async getCompanyDetailsServerSide(
    companyId: string,
    context: RequestContext
  ): Promise<CompanyDetails | null> {
    try {
      return await this.getCompanyDetails(companyId, context);
    } catch {
      return null;
    }
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
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.put(`/users/${userId}`, updates);
    return response.data;
  }

  /**
   * Update user company
   */
  async updateCompany(
    companyId: string,
    updates: Partial<CompanyDetails>,
    context: RequestContext
  ): Promise<CompanyDetails> {
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.put(`/companys/${companyId}`, updates);
    return response.data;
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
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.get("/users/search", {
      params: {
        q: query,
        limit: options?.limit || 10,
        offset: options?.offset || 0,
        ...options?.filters,
      },
    });

    return response.data;
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(
    userId: string,
    context: RequestContext
  ): Promise<string[]> {
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.get(`/users/${userId}/permissions`);
    return response.data.permissions || [];
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(
    userId: string,
    file: File,
    context: RequestContext
  ): Promise<{ url: string }> {
    const client = createClientWithContext(coreCommerceClient, context);

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await client.post(`/users/${userId}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteUser(
    userId: string,
    context: RequestContext
  ): Promise<{ success: boolean }> {
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.delete(`/users/${userId}`);
    return response.data;
  }
}

export default UserService.getInstance();
