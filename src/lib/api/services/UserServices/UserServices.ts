import { UserApiResponse } from "@/lib/interfaces/UserInterfaces";
import { coreCommerceClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

export interface GetUserParams {
  sub: string | number;
}

export class UserServices extends BaseService<UserServices> {
  // Configure default client for cart operations
  protected defaultClient = coreCommerceClient;

  async getUser(params: GetUserParams): Promise<UserApiResponse> {
    return (await this.call(
      `userses/findByName?name=${params.sub}`,
      {},
      "GET"
    )) as UserApiResponse;
  }
}

export default UserServices.getInstance();
