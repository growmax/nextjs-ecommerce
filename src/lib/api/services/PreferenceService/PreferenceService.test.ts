import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { BaseService } from "../BaseService";
import { PreferenceService } from "./PreferenceService";
import {
  mockAccessToken,
  mockContext,
  mockFilterPreferenceResponse,
  mockJwtPayload,
  mockOrderPreferencesRequest,
  mockOrderPreferencesResponse,
  mockPreferenceData,
  mockUserPreference,
} from "./PreferenceService.mocks";

// Mock AuthStorage
jest.mock("@/lib/auth", () => ({
  AuthStorage: {
    getAccessToken: jest.fn(),
  },
}));

// Mock JWTService
jest.mock("@/lib/services/JWTService", () => ({
  JWTService: {
    getInstance: jest.fn(),
  },
}));

// Mock the client
jest.mock("../../client", () => ({
  preferenceClient: {},
}));

describe("PreferenceService", () => {
  let preferenceService: PreferenceService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;
  let callWithSafeSpy: jest.SpyInstance;
  let mockJwtService: {
    getTokenPayload: jest.Mock;
  };

  beforeEach(() => {
    preferenceService = new PreferenceService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
    callWithSafeSpy = jest.spyOn(BaseService.prototype as any, "callWithSafe");

    mockJwtService = {
      getTokenPayload: jest.fn(),
    };
    (JWTService.getInstance as jest.Mock).mockReturnValue(mockJwtService);
    (AuthStorage.getAccessToken as jest.Mock).mockReturnValue(mockAccessToken);
    mockJwtService.getTokenPayload.mockReturnValue(mockJwtPayload);
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    callWithSafeSpy.mockRestore();
    // Reset mocks to default state
    (AuthStorage.getAccessToken as jest.Mock).mockReturnValue(mockAccessToken);
    mockJwtService.getTokenPayload.mockReturnValue(mockJwtPayload);
    // Clear call history but keep implementations
    jest.clearAllMocks();
    // Re-setup mocks after clearing
    (AuthStorage.getAccessToken as jest.Mock).mockReturnValue(mockAccessToken);
    mockJwtService.getTokenPayload.mockReturnValue(mockJwtPayload);
  });

  describe("getUserDataFromToken", () => {
    it("should throw error when no access token", () => {
      (AuthStorage.getAccessToken as jest.Mock).mockReturnValue(null);

      expect(() => {
        (preferenceService as any).getUserDataFromToken();
      }).toThrow("No access token found");
    });

    it("should throw error when invalid token", () => {
      // Override the mock for this test - must be set before creating the instance
      (AuthStorage.getAccessToken as jest.Mock).mockReturnValue(
        mockAccessToken
      );
      mockJwtService.getTokenPayload.mockReturnValue(null);

      // Recreate instance with updated mock
      preferenceService = new PreferenceService();

      expect(() => {
        (preferenceService as any).getUserDataFromToken();
      }).toThrow("Invalid token");
    });

    it("should return user data from token", () => {
      // Ensure mocks are set to default values
      (AuthStorage.getAccessToken as jest.Mock).mockReturnValue(
        mockAccessToken
      );
      mockJwtService.getTokenPayload.mockReturnValue(mockJwtPayload);

      const result = (preferenceService as any).getUserDataFromToken();

      expect(result).toEqual({
        userId: "123",
        companyId: "456",
        tenantCode: "tenant-1",
      });
    });

    it("should use elasticCode as fallback for tenantCode", () => {
      // Override the mock for this test - no tenantId, only elasticCode
      (AuthStorage.getAccessToken as jest.Mock).mockReturnValue(
        mockAccessToken
      );
      mockJwtService.getTokenPayload.mockReturnValue({
        userId: 123,
        companyId: 456,
        elasticCode: "elastic-fallback",
      });

      // Recreate instance with updated mock
      preferenceService = new PreferenceService();

      const result = (preferenceService as any).getUserDataFromToken();

      expect(result.tenantCode).toBe("elastic-fallback");
    });
  });

  describe("findPreferences", () => {
    it("should call API with correct endpoint", async () => {
      // Ensure mock returns default payload (set in beforeEach)
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.findPreferences("order");

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences/find?userId=123&module=order&tenantCode=tenant-1&isMobile=false`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockUserPreference);
    });

    it("should throw error when token is missing", async () => {
      (AuthStorage.getAccessToken as jest.Mock).mockReturnValue(null);

      await expect(preferenceService.findPreferences("order")).rejects.toThrow(
        "No access token found"
      );
    });
  });

  describe("findPreferencesServerSide", () => {
    it("should return preferences on success", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.findPreferencesServerSide("order");

      expect(result).toEqual(mockUserPreference);
    });

    it("should return null on error", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result = await preferenceService.findPreferencesServerSide("order");

      expect(result).toBeNull();
    });
  });

  describe("findPreferencesWithParams", () => {
    it("should call API with explicit parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.findPreferencesWithParams(
        123,
        "order",
        "tenant-1",
        true
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences/find?userId=123&module=order&tenantCode=tenant-1&isMobile=true`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockUserPreference);
    });
  });

  describe("findPreferencesWithParamsServerSide", () => {
    it("should call safe API with context", async () => {
      callWithSafeSpy.mockResolvedValueOnce(mockUserPreference);

      const result =
        await preferenceService.findPreferencesWithParamsServerSide(
          123,
          "order",
          mockContext
        );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        `/preferences/find?userId=123&module=order&tenantCode=tenant-1`,
        {},
        { context: mockContext, method: "GET" }
      );
      expect(result).toEqual(mockUserPreference);
    });

    it("should return null on error", async () => {
      callWithSafeSpy.mockRejectedValueOnce(new Error("API Error"));

      const result =
        await preferenceService.findPreferencesWithParamsServerSide(
          123,
          "order",
          mockContext
        );

      expect(result).toBeNull();
    });
  });

  describe("findOrderPreferences", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderPreferencesResponse);

      const result = await preferenceService.findOrderPreferences(
        mockOrderPreferencesRequest
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences/find?userId=123&module=order&tenantCode=tenant-1&isMobile=false`,
        mockOrderPreferencesRequest,
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrderPreferencesResponse);
    });
  });

  describe("findOrderPreferencesAuto", () => {
    it("should call API with auto-extracted user data", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderPreferencesResponse);

      const result = await preferenceService.findOrderPreferencesAuto(false);

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences/find?userId=123&module=order&tenantCode=tenant-1&isMobile=false`,
        expect.objectContaining({
          userId: 123,
          companyId: 456,
          tenantCode: "tenant-1",
          module: "order",
          isMobile: false,
        }),
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockOrderPreferencesResponse);
    });
  });

  describe("findOrderPreferencesServerSide", () => {
    it("should return preferences on success", async () => {
      callApiSpy.mockResolvedValueOnce(mockOrderPreferencesResponse);

      const result =
        await preferenceService.findOrderPreferencesServerSide(false);

      expect(result).toEqual(mockOrderPreferencesResponse);
    });

    it("should return null on error", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result =
        await preferenceService.findOrderPreferencesServerSide(false);

      expect(result).toBeNull();
    });
  });

  describe("findFilterPreferences", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockFilterPreferenceResponse);

      const result = await preferenceService.findFilterPreferences("order");

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences/find?userId=123&module=order&tenantCode=tenant-1&isMobile=false`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockFilterPreferenceResponse);
    });
  });

  describe("findFilterPreferencesServerSide", () => {
    it("should return preferences on success", async () => {
      callApiSpy.mockResolvedValueOnce(mockFilterPreferenceResponse);

      const result =
        await preferenceService.findFilterPreferencesServerSide("order");

      expect(result).toEqual(mockFilterPreferenceResponse);
    });

    it("should return null on error", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result =
        await preferenceService.findFilterPreferencesServerSide("order");

      expect(result).toBeNull();
    });
  });

  describe("createPreferences", () => {
    it("should call API with correct endpoint and data", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.createPreferences("order", {
        theme: "dark",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences`,
        expect.objectContaining({
          userId: 123,
          companyId: 456,
          module: "order",
          isMobile: false,
          preferences: { theme: "dark" },
        }),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockUserPreference);
    });
  });

  describe("createPreferencesServerSide", () => {
    it("should return preferences on success", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.createPreferencesServerSide(
        "order",
        { theme: "dark" }
      );

      expect(result).toEqual(mockUserPreference);
    });

    it("should return null on error", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result = await preferenceService.createPreferencesServerSide(
        "order",
        { theme: "dark" }
      );

      expect(result).toBeNull();
    });
  });

  describe("updatePreferences", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.updatePreferences("order", {
        theme: "light",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences/update`,
        expect.objectContaining({
          userId: 123,
          companyId: 456,
          module: "order",
          isMobile: false,
          preferences: { theme: "light" },
        }),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockUserPreference);
    });
  });

  describe("updatePreferencesServerSide", () => {
    it("should return preferences on success", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.updatePreferencesServerSide(
        "order",
        { theme: "light" }
      );

      expect(result).toEqual(mockUserPreference);
    });

    it("should return null on error", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result = await preferenceService.updatePreferencesServerSide(
        "order",
        { theme: "light" }
      );

      expect(result).toBeNull();
    });
  });

  describe("savePreferences", () => {
    it("should call API with query parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.savePreferences("order", {
        theme: "dark",
      });

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences/save?userId=123&module=order&tenantCode=tenant-1`,
        { theme: "dark" },
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockUserPreference);
    });
  });

  describe("savePreferencesServerSide", () => {
    it("should return preferences on success", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.savePreferencesServerSide(
        "order",
        { theme: "dark" }
      );

      expect(result).toEqual(mockUserPreference);
    });

    it("should return null on error", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result = await preferenceService.savePreferencesServerSide(
        "order",
        { theme: "dark" }
      );

      expect(result).toBeNull();
    });
  });

  describe("saveFilterPreferences", () => {
    it("should call API with query parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockFilterPreferenceResponse);

      const result = await preferenceService.saveFilterPreferences(
        "order",
        mockPreferenceData
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/preferences/save?userId=123&module=order&tenantCode=tenant-1`,
        mockPreferenceData,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockFilterPreferenceResponse);
    });
  });

  describe("saveFilterPreferencesServerSide", () => {
    it("should return preferences on success", async () => {
      callApiSpy.mockResolvedValueOnce(mockFilterPreferenceResponse);

      const result = await preferenceService.saveFilterPreferencesServerSide(
        "order",
        mockPreferenceData
      );

      expect(result).toEqual(mockFilterPreferenceResponse);
    });

    it("should return null on error", async () => {
      callApiSpy.mockRejectedValueOnce(new Error("API Error"));

      const result = await preferenceService.saveFilterPreferencesServerSide(
        "order",
        mockPreferenceData
      );

      expect(result).toBeNull();
    });
  });

  describe("createPreferencesWithContext", () => {
    it("should call safe API with context", async () => {
      callWithSafeSpy.mockResolvedValueOnce(mockUserPreference);

      const result = await preferenceService.createPreferencesWithContext(
        "order",
        { theme: "dark" },
        mockContext
      );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        `/preferences`,
        expect.objectContaining({
          userId: 123,
          companyId: 456,
          module: "order",
          preferences: { theme: "dark" },
          isMobile: false,
        }),
        { context: mockContext, method: "POST" }
      );
      expect(result).toEqual(mockUserPreference);
    });
  });

  describe("createPreferencesWithContextServerSide", () => {
    it("should return preferences on success", async () => {
      callWithSafeSpy.mockResolvedValueOnce(mockUserPreference);

      const result =
        await preferenceService.createPreferencesWithContextServerSide(
          "order",
          { theme: "dark" },
          mockContext
        );

      expect(result).toEqual(mockUserPreference);
    });

    it("should return null on error", async () => {
      callWithSafeSpy.mockRejectedValueOnce(new Error("API Error"));

      const result =
        await preferenceService.createPreferencesWithContextServerSide(
          "order",
          { theme: "dark" },
          mockContext
        );

      expect(result).toBeNull();
    });
  });

  describe("saveFilterPreferencesWithContext", () => {
    it("should call safe API with context", async () => {
      callWithSafeSpy.mockResolvedValueOnce(mockFilterPreferenceResponse);

      const result = await preferenceService.saveFilterPreferencesWithContext(
        "order",
        mockPreferenceData,
        mockContext
      );

      expect(callWithSafeSpy).toHaveBeenCalledWith(
        `/preferences/save?userId=123&module=order&tenantCode=tenant-1`,
        mockPreferenceData,
        { context: mockContext, method: "POST" }
      );
      expect(result).toEqual(mockFilterPreferenceResponse);
    });
  });

  describe("saveFilterPreferencesWithContextServerSide", () => {
    it("should return preferences on success", async () => {
      callWithSafeSpy.mockResolvedValueOnce(mockFilterPreferenceResponse);

      const result =
        await preferenceService.saveFilterPreferencesWithContextServerSide(
          "order",
          mockPreferenceData,
          mockContext
        );

      expect(result).toEqual(mockFilterPreferenceResponse);
    });

    it("should return null on error", async () => {
      callWithSafeSpy.mockRejectedValueOnce(new Error("API Error"));

      const result =
        await preferenceService.saveFilterPreferencesWithContextServerSide(
          "order",
          mockPreferenceData,
          mockContext
        );

      expect(result).toBeNull();
    });
  });
});
