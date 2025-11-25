import { BaseService } from "@/lib/api/services/BaseService";
import { ModuleService } from "@/lib/api/services/ModuleService/ModuleService";
import {
  mockModuleParams,
  mockModuleParamsWithNumbers,
} from "@/lib/api/services/ModuleService/ModuleService.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("ModuleService", () => {
  let moduleService: ModuleService;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    moduleService = new ModuleService();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getModule", () => {
    it("should call API with correct endpoint and parameters", async () => {
      const mockResponse = { success: true, data: [] };
      callApiSpy.mockResolvedValueOnce(mockResponse);

      const result = await moduleService.getModule(mockModuleParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        "module_setting/getAllModuleSettings?userId=123&companyId=456",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle numeric userId and companyId", async () => {
      const mockResponse = { success: true, data: [] };
      callApiSpy.mockResolvedValueOnce(mockResponse);

      await moduleService.getModule(mockModuleParamsWithNumbers);

      expect(callApiSpy).toHaveBeenCalledWith(
        "module_setting/getAllModuleSettings?userId=123&companyId=456",
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should return API response", async () => {
      const mockResponse = {
        success: true,
        data: [{ moduleId: "module-1", moduleName: "Orders" }],
      };
      callApiSpy.mockResolvedValueOnce(mockResponse);

      const result = await moduleService.getModule(mockModuleParams);

      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(moduleService.getModule(mockModuleParams)).rejects.toThrow(
        "API Error"
      );
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce({});

      await moduleService.getModule(mockModuleParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });

    it("should send empty body", async () => {
      callApiSpy.mockResolvedValueOnce({});

      await moduleService.getModule(mockModuleParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        expect.any(String),
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
    });
  });
});
