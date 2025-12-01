import { userPreferenceApiClient } from "@/lib/api/client";
import { BaseService } from "../../../BaseService";

// Types matching the request body example provided
export interface UserIdRef {
  id: number;
}

export interface UserPreferenceProfile {
  id?: number;
  tenantId?: number;
  userId?: UserIdRef | number;
  vendorId?: number | null;
  dateFormat: string;
  timeFormat: string;
  timeZone: string;
}

/**
 * Service for user preference/profile endpoints.
 * Uses the `userPreferenceApiClient` (configured in `src/lib/api/client.ts`).
 */
export class UserPreferenceApiService extends BaseService<UserPreferenceApiService> {
  protected defaultClient = userPreferenceApiClient;

  /**
   * Save (create or update) user preference/profile using POST.
   * The backend is expected to handle create vs update semantics based on the payload.
   * @param payload UserPreferenceProfile
   */
  async savePreference(
    payload: UserPreferenceProfile
  ): Promise<UserPreferenceProfile> {
    return (await this.call(
      `/userpreference`,
      payload,
      "POST"
    )) as UserPreferenceProfile;
  }

  /**
   * Server-safe version - returns null on error
   */
  async savePreferenceServerSide(
    payload: UserPreferenceProfile
  ): Promise<UserPreferenceProfile | null> {
    return (await this.callWithSafe(`/userpreference`, payload, {
      method: "POST",
    })) as UserPreferenceProfile | null;
  }
}

export default UserPreferenceApiService.getInstance();
