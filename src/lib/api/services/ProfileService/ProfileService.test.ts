import { BaseService } from "../BaseService";
import { ProfileService } from "./ProfileService";
import {
  mockProfile,
  mockProfileResponse,
  mockProfileUpdateData,
  mockUpdatedProfileResponse,
} from "./ProfileService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  authClient: {},
}));

describe("ProfileService", () => {
  let profileService: ProfileService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    profileService = new ProfileService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getCurrentProfile", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockProfileResponse);

      const result = await profileService.getCurrentProfile();

      expect(callApiSpy).toHaveBeenCalledWith(
        "/user/me",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockProfile);
    });

    it("should extract data from ProfileResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockProfileResponse);

      const result = await profileService.getCurrentProfile();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("displayName");
      expect(result.id).toBe("user-123");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(profileService.getCurrentProfile()).rejects.toThrow(
        "API Error"
      );
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockProfileResponse);

      await profileService.getCurrentProfile();

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("updateProfile", () => {
    it("should call API with correct endpoint and data", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdatedProfileResponse);

      const result = await profileService.updateProfile(mockProfileUpdateData);

      expect(callApiSpy).toHaveBeenCalledWith(
        "/user/me",
        mockProfileUpdateData,
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
      expect(result).toEqual(mockUpdatedProfileResponse.data);
    });

    it("should extract data from ProfileResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdatedProfileResponse);

      const result = await profileService.updateProfile(mockProfileUpdateData);

      expect(result).toHaveProperty("displayName");
      expect(result.displayName).toBe("Jane Doe");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        profileService.updateProfile(mockProfileUpdateData)
      ).rejects.toThrow("API Error");
    });

    it("should use PUT method", async () => {
      callApiSpy.mockResolvedValueOnce(mockUpdatedProfileResponse);

      await profileService.updateProfile(mockProfileUpdateData);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
    });
  });

  describe("getCurrentProfileServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockProfileResponse);

      const result = await profileService.getCurrentProfileServerSide();

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "/user/me",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockProfile);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await profileService.getCurrentProfileServerSide();

      expect(result).toBeNull();
    });

    it("should return null when response has no data", async () => {
      callApiSafeSpy.mockResolvedValueOnce({ success: false });

      const result = await profileService.getCurrentProfileServerSide();

      expect(result).toBeNull();
    });
  });

  describe("updateProfileServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockUpdatedProfileResponse);

      const result = await profileService.updateProfileServerSide(
        mockProfileUpdateData
      );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        "/user/me",
        mockProfileUpdateData,
        expect.any(Object),
        "PUT",
        expect.any(Object)
      );
      expect(result).toEqual(mockUpdatedProfileResponse.data);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result = await profileService.updateProfileServerSide(
        mockProfileUpdateData
      );

      expect(result).toBeNull();
    });

    it("should return null when response has no data", async () => {
      callApiSafeSpy.mockResolvedValueOnce({ success: false });

      const result = await profileService.updateProfileServerSide(
        mockProfileUpdateData
      );

      expect(result).toBeNull();
    });
  });
});
