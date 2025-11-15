import { BaseService } from "../BaseService";
import { UserServices } from "./UserServices";
import { mockGetUserParams, mockUserApiResponse } from "./UserServices.mocks";

// Mock the client
jest.mock("../../client", () => ({
  coreCommerceClient: {},
}));

describe("UserServices", () => {
  let userServices: UserServices;
  let callApiSpy: jest.SpyInstance;

  beforeEach(() => {
    userServices = new UserServices();
    callApiSpy = jest.spyOn(BaseService.prototype as any, "callApi");
  });

  afterEach(() => {
    callApiSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe("getUser", () => {
    it("should call API with correct endpoint for string sub", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserApiResponse);

      const result = await userServices.getUser(mockGetUserParams);

      expect(callApiSpy).toHaveBeenCalledWith(
        `users/findByName?name=${mockGetUserParams.sub}`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockUserApiResponse);
    });

    it("should call API with correct endpoint for number sub", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserApiResponse);

      const result = await userServices.getUser({ sub: 123 });

      expect(callApiSpy).toHaveBeenCalledWith(
        `users/findByName?name=123`,
        {},
        expect.any(Object),
        "GET",
        expect.any(Object)
      );
      expect(result).toEqual(mockUserApiResponse);
    });

    it("should return UserApiResponse", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserApiResponse);

      const result = await userServices.getUser(mockGetUserParams);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("status");
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      callApiSpy.mockRejectedValueOnce(error);

      await expect(userServices.getUser(mockGetUserParams)).rejects.toThrow(
        "API Error"
      );
    });

    it("should use GET method", async () => {
      callApiSpy.mockResolvedValueOnce(mockUserApiResponse);

      await userServices.getUser(mockGetUserParams);

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
