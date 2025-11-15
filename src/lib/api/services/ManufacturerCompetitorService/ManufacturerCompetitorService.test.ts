import { BaseService } from "../BaseService";
import { ManufacturerCompetitorService } from "./ManufacturerCompetitorService";
import {
  mockCompanyId,
  mockFetchCompetitorsResponse,
  mockFetchCompetitorsResponseEmpty,
} from "./ManufacturerCompetitorService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("ManufacturerCompetitorService", () => {
  let manufacturerCompetitorService: ManufacturerCompetitorService;
  let callApiSpy: jest.SpyInstance;
  let callApiSafeSpy: jest.SpyInstance;

  beforeEach(() => {
    manufacturerCompetitorService = new ManufacturerCompetitorService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
    callApiSafeSpy = jest.spyOn(BaseService.prototype as any, "callApiSafe");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    callApiSafeSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("fetchCompetitors", () => {
    it("should call API with correct endpoint for number companyId", async () => {
      callApiSpy.mockResolvedValueOnce(mockFetchCompetitorsResponse);

      const result =
        await manufacturerCompetitorService.fetchCompetitors(mockCompanyId);

      expect(callApiSpy).toHaveBeenCalledWith(
        `manufacturerCompetitors/fetchAllCompetitorsName?manufacturerCompanyId=${mockCompanyId}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockFetchCompetitorsResponse);
    });

    it("should call API with correct endpoint for string companyId", async () => {
      callApiSpy.mockResolvedValueOnce(mockFetchCompetitorsResponse);

      const result =
        await manufacturerCompetitorService.fetchCompetitors("123");

      expect(callApiSpy).toHaveBeenCalledWith(
        `manufacturerCompetitors/fetchAllCompetitorsName?manufacturerCompanyId=123`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockFetchCompetitorsResponse);
    });

    it("should return FetchCompetitorsResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockFetchCompetitorsResponse);

      const result =
        await manufacturerCompetitorService.fetchCompetitors(mockCompanyId);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
      expect(result.data).toHaveProperty("competitorDetails");
      expect(Array.isArray(result.data.competitorDetails)).toBe(true);
    });

    it("should handle empty competitors list", async () => {
      callApiSpy.mockResolvedValueOnce(mockFetchCompetitorsResponseEmpty);

      const result =
        await manufacturerCompetitorService.fetchCompetitors(mockCompanyId);

      expect(result.data.competitorDetails).toEqual([]);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        manufacturerCompetitorService.fetchCompetitors(mockCompanyId)
      ).rejects.toThrow("API Error");
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockFetchCompetitorsResponse);

      await manufacturerCompetitorService.fetchCompetitors(mockCompanyId);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });

  describe("fetchCompetitorsServerSide", () => {
    it("should call safe API with correct parameters", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockFetchCompetitorsResponse);

      const result =
        await manufacturerCompetitorService.fetchCompetitorsServerSide(
          mockCompanyId
        );

      expect(callApiSafeSpy).toHaveBeenCalledWith(
        `manufacturerCompetitors/fetchAllCompetitorsName?manufacturerCompanyId=${mockCompanyId}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockFetchCompetitorsResponse);
    });

    it("should return null on error", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result =
        await manufacturerCompetitorService.fetchCompetitorsServerSide(
          mockCompanyId
        );

      expect(result).toBeNull();
    });
  });

  describe("getCompetitorsList", () => {
    it("should extract competitor details array from response", async () => {
      callApiSpy.mockResolvedValueOnce(mockFetchCompetitorsResponse);

      const result =
        await manufacturerCompetitorService.getCompetitorsList(mockCompanyId);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
    });

    it("should return empty array when response has no competitorDetails", async () => {
      callApiSpy.mockResolvedValueOnce({
        success: true,
        data: {},
      });

      const result =
        await manufacturerCompetitorService.getCompetitorsList(mockCompanyId);

      expect(result).toEqual([]);
    });

    it("should return empty array when response is null", async () => {
      callApiSpy.mockResolvedValueOnce(null);

      const result =
        await manufacturerCompetitorService.getCompetitorsList(mockCompanyId);

      expect(result).toEqual([]);
    });
  });

  describe("getCompetitorsListServerSide", () => {
    it("should extract competitor details array from response", async () => {
      callApiSafeSpy.mockResolvedValueOnce(mockFetchCompetitorsResponse);

      const result =
        await manufacturerCompetitorService.getCompetitorsListServerSide(
          mockCompanyId
        );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when response is null", async () => {
      callApiSafeSpy.mockResolvedValueOnce(null);

      const result =
        await manufacturerCompetitorService.getCompetitorsListServerSide(
          mockCompanyId
        );

      expect(result).toEqual([]);
    });

    it("should return empty array when response has no competitorDetails", async () => {
      callApiSafeSpy.mockResolvedValueOnce({
        success: true,
        data: {},
      });

      const result =
        await manufacturerCompetitorService.getCompetitorsListServerSide(
          mockCompanyId
        );

      expect(result).toEqual([]);
    });
  });
});
