import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AccountOwnerService } from "./AccountOwnerService";

describe("AccountOwnerService", () => {
  let service: AccountOwnerService;
  let callSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    service = AccountOwnerService.getInstance();
    callSpy = jest.spyOn(service as any, "call");
  });

  afterEach(() => {
    callSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      // Arrange & Act
      const instance1 = AccountOwnerService.getInstance();
      const instance2 = AccountOwnerService.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });
  });

  describe("getAccountOwners", () => {
    describe("Successful API Calls", () => {
      it("should call API with correct endpoint", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        await service.getAccountOwners(123);

        // Assert
        expect(callSpy).toHaveBeenCalledWith(
          "/accountses/getAccountAndSupportOwner?companyId=123",
          {},
          "GET"
        );
      });

      it("should handle string company ID", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        await service.getAccountOwners("456");

        // Assert
        expect(callSpy).toHaveBeenCalledWith(
          "/accountses/getAccountAndSupportOwner?companyId=456",
          {},
          "GET"
        );
      });

      it("should return account owners from nested data", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [
              {
                id: 1,
                userId: 101,
                displayName: "John Doe",
                email: "john@example.com",
                isActive: true,
              },
            ],
            supportOwner: [
              {
                id: 2,
                userId: 102,
                displayName: "Jane Smith",
                email: "jane@example.com",
                isActive: true,
              },
            ],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toHaveLength(1);
        expect(result.accountOwner[0]?.displayName).toBe("John Doe");
        expect(result.supportOwner).toHaveLength(1);
        expect(result.supportOwner?.[0]?.displayName).toBe("Jane Smith");
      });

      it("should return account owners from direct response", async () => {
        // Arrange
        const mockResponse = {
          accountOwner: [
            {
              id: 1,
              userId: 101,
              displayName: "John Doe",
              email: "john@example.com",
            },
          ],
          supportOwner: [],
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toHaveLength(1);
        expect(result.accountOwner[0]?.displayName).toBe("John Doe");
      });

      it("should handle multiple account owners", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [
              { id: 1, displayName: "Owner 1" },
              { id: 2, displayName: "Owner 2" },
              { id: 3, displayName: "Owner 3" },
            ],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toHaveLength(3);
        expect(result.accountOwner[0]?.displayName).toBe("Owner 1");
        expect(result.accountOwner[1]?.displayName).toBe("Owner 2");
        expect(result.accountOwner[2]?.displayName).toBe("Owner 3");
      });

      it("should handle multiple support owners", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [],
            supportOwner: [
              { id: 1, displayName: "Support 1" },
              { id: 2, displayName: "Support 2" },
            ],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.supportOwner).toHaveLength(2);
        expect(result.supportOwner?.[0]?.displayName).toBe("Support 1");
        expect(result.supportOwner?.[1]?.displayName).toBe("Support 2");
      });

      it("should include company information when provided", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [],
            supportOwner: [],
            company: {
              id: 123,
              name: "Test Company",
            },
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.company).toBeDefined();
        expect(result.company?.id).toBe(123);
        expect(result.company?.name).toBe("Test Company");
      });
    });

    describe("Empty Response Handling", () => {
      it("should handle empty account owners array", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toEqual([]);
        expect(result.supportOwner).toEqual([]);
      });

      it("should handle missing supportOwner field", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [{ id: 1, displayName: "Owner" }],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toHaveLength(1);
        expect(result.supportOwner).toBeUndefined();
      });

      it("should return empty structure for unexpected response format", async () => {
        // Arrange
        const mockResponse = {
          unexpected: "format",
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toEqual([]);
        expect(result.supportOwner).toEqual([]);
      });

      it("should return empty structure for null response", async () => {
        // Arrange
        callSpy.mockResolvedValue(null);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toEqual([]);
        expect(result.supportOwner).toEqual([]);
      });

      it("should return empty structure for undefined response", async () => {
        // Arrange
        callSpy.mockResolvedValue(undefined);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toEqual([]);
        expect(result.supportOwner).toEqual([]);
      });
    });

    describe("Error Handling", () => {
      it("should handle API errors", async () => {
        // Arrange
        const error = new Error("API Error");
        callSpy.mockRejectedValue(error);

        // Act & Assert
        await expect(service.getAccountOwners(123)).rejects.toThrow("API Error");
      });

      it("should handle network errors", async () => {
        // Arrange
        const networkError = new Error("Network Error");
        callSpy.mockRejectedValue(networkError);

        // Act & Assert
        await expect(service.getAccountOwners(123)).rejects.toThrow("Network Error");
      });

      it("should handle 404 errors", async () => {
        // Arrange
        const notFoundError = {
          response: {
            status: 404,
            data: { message: "Company not found" },
          },
        };
        callSpy.mockRejectedValue(notFoundError);

        // Act & Assert
        await expect(service.getAccountOwners(123)).rejects.toEqual(notFoundError);
      });

      it("should handle 500 errors", async () => {
        // Arrange
        const serverError = {
          response: {
            status: 500,
            data: { message: "Internal Server Error" },
          },
        };
        callSpy.mockRejectedValue(serverError);

        // Act & Assert
        await expect(service.getAccountOwners(123)).rejects.toEqual(serverError);
      });

      it("should handle authentication errors", async () => {
        // Arrange
        const authError = {
          response: {
            status: 401,
            data: { message: "Unauthorized" },
          },
        };
        callSpy.mockRejectedValue(authError);

        // Act & Assert
        await expect(service.getAccountOwners(123)).rejects.toEqual(authError);
      });
    });

    describe("Account Owner Data Structure", () => {
      it("should preserve all account owner fields", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [
              {
                id: 1,
                userId: 101,
                displayName: "John Doe",
                email: "john@example.com",
                isActive: true,
                customField: "custom value",
              },
            ],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        const owner = result.accountOwner[0];
        expect(owner).toBeDefined();
        if (owner) {
          expect(owner.id).toBe(1);
          expect(owner.userId).toBe(101);
          expect(owner.displayName).toBe("John Doe");
          expect(owner.email).toBe("john@example.com");
          expect(owner.isActive).toBe(true);
          expect((owner as any).customField).toBe("custom value");
        }
      });

      it("should handle account owners with minimal fields", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [{ id: 1 }],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner[0]?.id).toBe(1);
        expect(result.accountOwner[0]?.userId).toBeUndefined();
        expect(result.accountOwner[0]?.displayName).toBeUndefined();
      });

      it("should handle inactive account owners", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [
              { id: 1, displayName: "Active Owner", isActive: true },
              { id: 2, displayName: "Inactive Owner", isActive: false },
            ],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toHaveLength(2);
        expect(result.accountOwner[0]?.isActive).toBe(true);
        expect(result.accountOwner[1]?.isActive).toBe(false);
      });
    });

    describe("Edge Cases", () => {
      it("should handle very large company IDs", async () => {
        // Arrange
        const largeId = 9999999999;
        const mockResponse = {
          data: {
            accountOwner: [],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        await service.getAccountOwners(largeId);

        // Assert
        expect(callSpy).toHaveBeenCalledWith(
          `/accountses/getAccountAndSupportOwner?companyId=${largeId}`,
          {},
          "GET"
        );
      });

      it("should handle zero company ID", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        await service.getAccountOwners(0);

        // Assert
        expect(callSpy).toHaveBeenCalledWith(
          "/accountses/getAccountAndSupportOwner?companyId=0",
          {},
          "GET"
        );
      });

      it("should handle negative company ID", async () => {
        // Arrange
        const mockResponse = {
          data: {
            accountOwner: [],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        await service.getAccountOwners(-1);

        // Assert
        expect(callSpy).toHaveBeenCalledWith(
          "/accountses/getAccountAndSupportOwner?companyId=-1",
          {},
          "GET"
        );
      });

      it("should handle response with success flag", async () => {
        // Arrange
        const mockResponse = {
          success: true,
          data: {
            accountOwner: [{ id: 1, displayName: "Owner" }],
            supportOwner: [],
          },
          message: "Success",
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toHaveLength(1);
      });

      it("should handle response with status field", async () => {
        // Arrange
        const mockResponse = {
          status: "success",
          data: {
            accountOwner: [{ id: 1, displayName: "Owner" }],
            supportOwner: [],
          },
        };
        callSpy.mockResolvedValue(mockResponse);

        // Act
        const result = await service.getAccountOwners(123);

        // Assert
        expect(result.accountOwner).toHaveLength(1);
      });
    });
  });
});
