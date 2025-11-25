import { BaseService } from "@/lib/api/services/BaseService";
import { LocationService } from "@/lib/api/services/LocationService/LocationService";
import {
  mockCountriesResponse,
  mockDistrictsResponse,
  mockStatesResponse,
} from "@/lib/api/services/LocationService/LocationService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  homePageClient: {},
}));

describe("LocationService", () => {
  let locationService: LocationService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    locationService = new LocationService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getAllCountries", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockCountriesResponse);

      const result = await locationService.getAllCountries();

      expect(callApiSpy).toHaveBeenCalledWith(
        "/getCountry",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockCountriesResponse);
    });

    it("should return LocationResponse with CountryData array", async () => {
      callApiSpy.mockResolvedValueOnce(mockCountriesResponse);

      const result = await locationService.getAllCountries();

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(locationService.getAllCountries()).rejects.toThrow(
        "API Error"
      );
    });
  });

  describe("getAllStates", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockStatesResponse);

      const result = await locationService.getAllStates();

      expect(callApiSpy).toHaveBeenCalledWith(
        "/getAllState",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockStatesResponse);
    });

    it("should return LocationResponse with StateData array", async () => {
      callApiSpy.mockResolvedValueOnce(mockStatesResponse);

      const result = await locationService.getAllStates();

      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("getAllDistricts", () => {
    it("should call API with correct endpoint", async () => {
      callApiSpy.mockResolvedValueOnce(mockDistrictsResponse);

      const result = await locationService.getAllDistricts();

      expect(callApiSpy).toHaveBeenCalledWith(
        "/getAllDistrict",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockDistrictsResponse);
    });

    it("should return LocationResponse with DistrictData array", async () => {
      callApiSpy.mockResolvedValueOnce(mockDistrictsResponse);

      const result = await locationService.getAllDistricts();

      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("getStatesByCountry", () => {
    it("should filter states by countryId", async () => {
      callApiSpy.mockResolvedValueOnce(mockStatesResponse);

      const result = await locationService.getStatesByCountry(1);

      expect(callApiSpy).toHaveBeenCalledWith(
        "/getAllState",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result.data).toHaveLength(2); // Only US states
      expect(result.data.every(state => state.countryId === 1)).toBe(true);
    });

    it("should return empty array when no states match countryId", async () => {
      callApiSpy.mockResolvedValueOnce(mockStatesResponse);

      const result = await locationService.getStatesByCountry(999);

      expect(result.data).toEqual([]);
    });

    it("should preserve response structure", async () => {
      callApiSpy.mockResolvedValueOnce(mockStatesResponse);

      const result = await locationService.getStatesByCountry(1);

      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
    });
  });

  describe("getDistrictsByState", () => {
    it("should filter districts by stateId", async () => {
      callApiSpy.mockResolvedValueOnce(mockDistrictsResponse);

      const result = await locationService.getDistrictsByState(1);

      expect(callApiSpy).toHaveBeenCalledWith(
        "/getAllDistrict",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result.data).toHaveLength(2); // Only state 1 districts
      expect(result.data.every(district => district.stateId === 1)).toBe(true);
    });

    it("should return empty array when no districts match stateId", async () => {
      callApiSpy.mockResolvedValueOnce(mockDistrictsResponse);

      const result = await locationService.getDistrictsByState(999);

      expect(result.data).toEqual([]);
    });

    it("should preserve response structure", async () => {
      callApiSpy.mockResolvedValueOnce(mockDistrictsResponse);

      const result = await locationService.getDistrictsByState(1);

      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
    });
  });
});
