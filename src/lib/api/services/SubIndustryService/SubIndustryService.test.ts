import { BaseService } from "../BaseService";
import { SubIndustryService } from "./SubIndustryService";
import { mockSubIndustryResponse } from "./SubIndustryService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("SubIndustryService", () => {
  let subIndustryService: SubIndustryService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    subIndustryService = new SubIndustryService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getData", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockSubIndustryResponse);

      const result = await subIndustryService.getData();

      expect(callApiSpy).toHaveBeenCalledWith(
        "/subindustrys",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockSubIndustryResponse);
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockSubIndustryResponse);

      await subIndustryService.getData();

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should send empty object as body (BaseService converts undefined)", async () => {
      callApiSpy.mockResolvedValueOnce(mockSubIndustryResponse);

      await subIndustryService.getData();

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(subIndustryService.getData()).rejects.toThrow("API Error");
    });

    it("should return API response", async () => {
      callApiSpy.mockResolvedValueOnce(mockSubIndustryResponse);

      const result = await subIndustryService.getData();

      expect(result).toEqual(mockSubIndustryResponse);
    });
  });
});
