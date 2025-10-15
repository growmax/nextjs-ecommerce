// User API Service class for handling user-related API calls
// DEPRECATED: Use API.User instead (from @/lib/api)
import { UserApiResponse } from "@/lib/interfaces/UserInterfaces";
import API from "@/lib/api";

export class UserApiService {
  private static instance: UserApiService;

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
    return API.User.getUserDetails(userId, { tenantCode, accessToken });
  }

  public async fetchUserDetailsServerSide(
    userId: string,
    tenantCode: string,
    accessToken: string
  ): Promise<UserApiResponse | null> {
    return API.User.getUserDetailsServerSide(userId, {
      tenantCode,
      accessToken,
    });
  }

  public async fetchCompanyDetails(
    companyId: string,
    tenantCode: string,
    accessToken: string
  ): Promise<unknown> {
    return API.User.getCompanyDetails(companyId, { tenantCode, accessToken });
  }

  public async fetchCompanyDetailsServerSide(
    companyId: string,
    tenantCode: string,
    accessToken: string
  ): Promise<unknown | null> {
    return API.User.getCompanyDetailsServerSide(companyId, {
      tenantCode,
      accessToken,
    });
  }
}
