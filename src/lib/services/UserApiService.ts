// User API Service class for handling user-related API calls
import { UserApiResponse } from "@/lib/interfaces/UserInterfaces";

export class UserApiService {
  private static instance: UserApiService;
  private readonly baseUrl = `${process.env.API_BASE_URL}/corecommerce`;

  private constructor() {}

  public static getInstance(): UserApiService {
    if (!UserApiService.instance) {
      UserApiService.instance = new UserApiService();
    }
    return UserApiService.instance;
  }

  public async fetchUserDetails(
    userId: string,
    tenantCode: string,
    accessToken: string
  ): Promise<UserApiResponse> {
    const url = `${this.baseUrl}/userses/findByName?name=${userId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-tenant": tenantCode,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.status}`);
    }

    return response.json();
  }

  public async fetchUserDetailsServerSide(
    userId: string,
    tenantCode: string,
    accessToken: string
  ): Promise<UserApiResponse | null> {
    try {
      return await this.fetchUserDetails(userId, tenantCode, accessToken);
    } catch {
      return null;
    }
  }
}
