import { getStatusStyle, isEditInProgress, isOrderCancelled } from "./status";
import {
  mockStatusAcknowledged,
  mockStatusAcknowledgedShort,
  mockStatusCancelled,
  mockStatusCompleted,
  mockStatusDelivered,
  mockStatusEditInProgress,
  mockStatusEmpty,
  mockStatusInProgress,
  mockStatusLowercase,
  mockStatusMixedCase,
  mockStatusNull,
  mockStatusOrderCancelled,
  mockStatusProcessing,
  mockStatusUndefined,
  mockStatusUnknown,
} from "./status.mocks";

describe("status utilities", () => {
  describe("getStatusStyle", () => {
    it("should return blue style for ORDER ACKNOWLEDGED", () => {
      const result = getStatusStyle(mockStatusAcknowledged);

      expect(result).toBe("bg-blue-100 text-blue-700 border-blue-200");
    });

    it("should return blue style for ACKNOWLEDGED", () => {
      const result = getStatusStyle(mockStatusAcknowledgedShort);

      expect(result).toBe("bg-blue-100 text-blue-700 border-blue-200");
    });

    it("should return orange style for IN PROGRESS", () => {
      const result = getStatusStyle(mockStatusInProgress);

      expect(result).toBe("bg-orange-100 text-orange-700 border-orange-200");
    });

    it("should return orange style for PROCESSING", () => {
      const result = getStatusStyle(mockStatusProcessing);

      expect(result).toBe("bg-orange-100 text-orange-700 border-orange-200");
    });

    it("should return green style for COMPLETED", () => {
      const result = getStatusStyle(mockStatusCompleted);

      expect(result).toBe("bg-green-100 text-green-700 border-green-200");
    });

    it("should return green style for DELIVERED", () => {
      const result = getStatusStyle(mockStatusDelivered);

      expect(result).toBe("bg-green-100 text-green-700 border-green-200");
    });

    it("should return red style for CANCELLED", () => {
      const result = getStatusStyle(mockStatusCancelled);

      expect(result).toBe("bg-red-100 text-red-700 border-red-200");
    });

    it("should return gray style for unknown status", () => {
      const result = getStatusStyle(mockStatusUnknown);

      expect(result).toBe("bg-gray-100 text-gray-700 border-gray-200");
    });

    it("should return gray style for default case", () => {
      const result = getStatusStyle("SOME OTHER STATUS");

      expect(result).toBe("bg-gray-100 text-gray-700 border-gray-200");
    });

    it("should handle lowercase status", () => {
      const result = getStatusStyle(mockStatusLowercase);

      expect(result).toBe("bg-green-100 text-green-700 border-green-200");
    });

    it("should handle mixed case status", () => {
      const result = getStatusStyle(mockStatusMixedCase);

      expect(result).toBe("bg-orange-100 text-orange-700 border-orange-200");
    });

    it("should return gray style for undefined status", () => {
      const result = getStatusStyle(mockStatusUndefined);

      expect(result).toBe("bg-gray-100 text-gray-700 border-gray-200");
    });

    it("should return gray style for empty string", () => {
      const result = getStatusStyle(mockStatusEmpty);

      expect(result).toBe("bg-gray-100 text-gray-700 border-gray-200");
    });

    it("should handle null status", () => {
      const result = getStatusStyle(mockStatusNull as any);

      expect(result).toBe("bg-gray-100 text-gray-700 border-gray-200");
    });
  });

  describe("isOrderCancelled", () => {
    it("should return true for CANCELLED", () => {
      const result = isOrderCancelled(mockStatusCancelled);

      expect(result).toBe(true);
    });

    it("should return true for ORDER CANCELLED", () => {
      const result = isOrderCancelled(mockStatusOrderCancelled);

      expect(result).toBe(true);
    });

    it("should return false for other statuses", () => {
      expect(isOrderCancelled(mockStatusCompleted)).toBe(false);
      expect(isOrderCancelled(mockStatusInProgress)).toBe(false);
      expect(isOrderCancelled(mockStatusAcknowledged)).toBe(false);
    });

    it("should return false for undefined status", () => {
      const result = isOrderCancelled(mockStatusUndefined);

      expect(result).toBe(false);
    });

    it("should return false for empty string", () => {
      const result = isOrderCancelled(mockStatusEmpty);

      expect(result).toBe(false);
    });

    it("should handle lowercase cancelled", () => {
      const result = isOrderCancelled("cancelled");

      expect(result).toBe(true);
    });

    it("should handle mixed case cancelled", () => {
      const result = isOrderCancelled("Cancelled");

      expect(result).toBe(true);
    });

    it("should handle mixed case order cancelled", () => {
      const result = isOrderCancelled("Order Cancelled");

      expect(result).toBe(true);
    });
  });

  describe("isEditInProgress", () => {
    it("should return true for EDIT IN PROGRESS", () => {
      const result = isEditInProgress(mockStatusEditInProgress);

      expect(result).toBe(true);
    });

    it("should return false for other statuses", () => {
      expect(isEditInProgress(mockStatusCompleted)).toBe(false);
      expect(isEditInProgress(mockStatusInProgress)).toBe(false);
      expect(isEditInProgress(mockStatusCancelled)).toBe(false);
    });

    it("should return false for undefined status", () => {
      const result = isEditInProgress(mockStatusUndefined);

      expect(result).toBe(false);
    });

    it("should return false for empty string", () => {
      const result = isEditInProgress(mockStatusEmpty);

      expect(result).toBe(false);
    });

    it("should handle lowercase edit in progress", () => {
      const result = isEditInProgress("edit in progress");

      expect(result).toBe(true);
    });

    it("should handle mixed case edit in progress", () => {
      const result = isEditInProgress("Edit In Progress");

      expect(result).toBe(true);
    });

    it("should return false for partial match", () => {
      const result = isEditInProgress("IN PROGRESS");

      expect(result).toBe(false);
    });
  });
});
