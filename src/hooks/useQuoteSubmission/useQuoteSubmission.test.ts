// Mock the @/lib/api module
jest.mock("@/lib/api", () => ({
  QuoteSubmissionService: {
    submitQuoteAsNewVersion: jest.fn(),
  },
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { act, renderHook } from "@testing-library/react";
import { useQuoteSubmission } from "./useQuoteSubmission";
import {
  mockFailureResponse,
  mockQuoteSubmissionRequest,
  mockSuccessResponse,
} from "./useQuoteSubmission.mocks";
import { QuoteSubmissionService } from "@/lib/api";
import { toast } from "sonner";

const mockSubmitQuoteAsNewVersion =
  QuoteSubmissionService.submitQuoteAsNewVersion as jest.MockedFunction<
    typeof QuoteSubmissionService.submitQuoteAsNewVersion
  >;
const mockToastSuccess = toast.success as jest.MockedFunction<
  typeof toast.success
>;
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>;

describe("useQuoteSubmission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should submit quote successfully", async () => {
    mockSubmitQuoteAsNewVersion.mockResolvedValueOnce(mockSuccessResponse);
    const { result } = renderHook(() => useQuoteSubmission());
    let submitResult: boolean | undefined;
    await act(async () => {
      submitResult = await result.current.submitQuote(
        mockQuoteSubmissionRequest
      );
    });
    expect(submitResult).toBe(true);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Quote submitted successfully!"
    );
    expect(result.current.error).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle failed quote submission", async () => {
    mockSubmitQuoteAsNewVersion.mockResolvedValueOnce(mockFailureResponse);
    const { result } = renderHook(() => useQuoteSubmission());
    let submitResult: boolean | undefined;
    await act(async () => {
      submitResult = await result.current.submitQuote(
        mockQuoteSubmissionRequest
      );
    });
    expect(submitResult).toBe(false);
    expect(mockToastError).toHaveBeenCalledWith(
      "Failed to submit quote. Please try again."
    );
    expect(result.current.error).toBe(
      "Failed to submit quote. Please try again."
    );
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle error thrown during submission", async () => {
    mockSubmitQuoteAsNewVersion.mockRejectedValueOnce(
      new Error("Network error")
    );
    const { result } = renderHook(() => useQuoteSubmission());
    let submitResult: boolean | undefined;
    await act(async () => {
      submitResult = await result.current.submitQuote(
        mockQuoteSubmissionRequest
      );
    });
    expect(submitResult).toBe(false);
    expect(mockToastError).toHaveBeenCalledWith(
      "Failed to submit quote: Network error"
    );
    expect(result.current.error).toBe("Network error");
    expect(result.current.isSubmitting).toBe(false);
  });
});
