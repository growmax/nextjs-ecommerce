import { authClient } from "../../client";
import { BaseService } from "../BaseService";

export interface Profile {
  email: string;
  emailVerified: boolean;
  status: "CONFIRMED" | "PENDING" | "INACTIVE";
  tenantId: string;
  displayName: string;
  isSeller: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  secondaryEmail?: string;
  secondaryPhoneNumber?: string;
  id: string;
  hasPassword: boolean;
}

export interface ProfileResponse {
  success: boolean;
  data: Profile;
}

export class ProfileService extends BaseService<ProfileService> {
  protected defaultClient = authClient;

  async getCurrentProfile(): Promise<Profile> {
    const response = (await this.call(
      "/user/me",
      {},
      "GET"
    )) as ProfileResponse;
    return response.data;
  }

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const response = (await this.call(
      "/user/me",
      data,
      "PUT"
    )) as ProfileResponse;
    return response.data;
  }

  async getCurrentProfileServerSide(): Promise<Profile | null> {
    const response = (await this.callSafe(
      "/user/me",
      {},
      "GET"
    )) as ProfileResponse | null;
    return response?.data || null;
  }

  async updateProfileServerSide(
    data: Partial<Profile>
  ): Promise<Profile | null> {
    const response = (await this.callSafe(
      "/user/me",
      data,
      "PUT"
    )) as ProfileResponse | null;
    return response?.data || null;
  }
}

export default ProfileService.getInstance();
