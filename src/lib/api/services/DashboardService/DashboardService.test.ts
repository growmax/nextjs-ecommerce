import { BaseService } from "../BaseService";
import { DashboardService } from "./DashboardService";
import {
  mockDashboardApiResponse,
  mockDashboardFilterParams,
  mockDashboardQueryParams,
} from "./DashboardService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("DashboardService", () => {
  let dashboardService: DashboardService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    dashboardService = new DashboardService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getDashboardData", () => {
    it("should call API with correct endpoint and parameters", async () => {
      callApiSpy.mockResolvedValueOnce(mockDashboardApiResponse);

      const result = await dashboardService.getDashboardData(
        mockDashboardQueryParams,
        mockDashboardFilterParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        `/dashBoardService/findByDashBoardFilterNew?userId=123&companyId=456&offset=0&limit=99999999&currencyId=1`,
        mockDashboardFilterParams,
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
      expect(result).toEqual(mockDashboardApiResponse);
    });

    it("should return DashboardApiResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockDashboardApiResponse);

      const result = await dashboardService.getDashboardData(
        mockDashboardQueryParams,
        mockDashboardFilterParams
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
      expect(result.data).toHaveProperty("lsOrderGraphDto");
      expect(result.data).toHaveProperty("lsQuoteGraphDto");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(
        dashboardService.getDashboardData(
          mockDashboardQueryParams,
          mockDashboardFilterParams
        )
      ).rejects.toThrow("API Error");
    });

    it("should use POST method", async () => {
      callApiSpy.mockResolvedValueOnce(mockDashboardApiResponse);

      await dashboardService.getDashboardData(
        mockDashboardQueryParams,
        mockDashboardFilterParams
      );

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
        "POST",
        expect.any(Object)
      );
    });
  });

  describe("transformOrderDataForChart", () => {
    it("should transform dashboard data to chart format", () => {
      const result = dashboardService.transformOrderDataForChart(
        mockDashboardApiResponse
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("month");
      expect(result[0]).toHaveProperty("orders");
      expect(result[0]).toHaveProperty("quotes");
    });

    it("should aggregate order statuses correctly", () => {
      const result = dashboardService.transformOrderDataForChart(
        mockDashboardApiResponse
      );

      const janData = result.find(item => item.dateValue === "Jan 2024");
      expect(janData).toBeDefined();
      expect(janData?.orders).toBeGreaterThan(0);
    });

    it("should handle empty data", () => {
      const emptyData: typeof mockDashboardApiResponse = {
        ...mockDashboardApiResponse,
        data: {
          ...mockDashboardApiResponse.data,
          lsOrderGraphDto: [],
          lsQuoteGraphDto: [],
        },
      };

      const result = dashboardService.transformOrderDataForChart(emptyData);

      expect(result).toEqual([]);
    });
  });

  describe("calculateTrendPercentage", () => {
    it("should calculate trend percentage from order data", () => {
      const result = dashboardService.calculateTrendPercentage(
        mockDashboardApiResponse
      );

      expect(typeof result).toBe("number");
    });

    it("should return 0 when insufficient data", () => {
      const insufficientData: typeof mockDashboardApiResponse = {
        ...mockDashboardApiResponse,
        data: {
          ...mockDashboardApiResponse.data,
          lsOrderGraphDto: [
            {
              amountValue: 1000,
              count: 5,
              dateValue: "Jan 2024",
              status: "INVOICED",
              avgScore: null,
            },
          ],
        },
      };

      const result =
        dashboardService.calculateTrendPercentage(insufficientData);

      expect(result).toBe(0);
    });

    it("should return 100 when previous month is 0", () => {
      const dataWithZero: typeof mockDashboardApiResponse = {
        ...mockDashboardApiResponse,
        data: {
          ...mockDashboardApiResponse.data,
          lsOrderGraphDto: [
            {
              amountValue: 0,
              count: 0,
              dateValue: "Jan 2024",
              status: "INVOICED",
              avgScore: null,
            },
            {
              amountValue: 1000,
              count: 5,
              dateValue: "Feb 2024",
              status: "INVOICED",
              avgScore: null,
            },
          ],
        },
      };

      const result = dashboardService.calculateTrendPercentage(dataWithZero);

      expect(result).toBe(100);
    });
  });

  describe("getDateRange", () => {
    it("should return date range from order data", () => {
      const result = dashboardService.getDateRange(mockDashboardApiResponse);

      expect(typeof result).toBe("string");
      expect(result).toContain(" - ");
    });

    it("should return 'No data available' when no data", () => {
      const emptyData: typeof mockDashboardApiResponse = {
        ...mockDashboardApiResponse,
        data: {
          ...mockDashboardApiResponse.data,
          lsOrderGraphDto: [],
        },
      };

      const result = dashboardService.getDateRange(emptyData);

      expect(result).toBe("No data available");
    });
  });

  describe("getComprehensiveStats", () => {
    it("should calculate comprehensive statistics", () => {
      const result = dashboardService.getComprehensiveStats(
        mockDashboardApiResponse
      );

      expect(result).toHaveProperty("totalOrderValue");
      expect(result).toHaveProperty("totalQuoteValue");
      expect(result).toHaveProperty("totalRevenue");
      expect(result).toHaveProperty("totalTransactions");
      expect(result).toHaveProperty("avgOrderValue");
      expect(result).toHaveProperty("avgQuoteValue");
      expect(result).toHaveProperty("orderStatuses");
      expect(result).toHaveProperty("quoteStatuses");
    });

    it("should calculate averages correctly", () => {
      const result = dashboardService.getComprehensiveStats(
        mockDashboardApiResponse
      );

      if (result.totalOrderCount > 0) {
        expect(result.avgOrderValue).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
