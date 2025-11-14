import * as api from "@/lib/api";
import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { useQuoteSubmission } from "./useQuoteSubmission";
import {
  mockFailureResponse,
  mockQuoteSubmissionRequest,
  mockQuoteSubmissionService,
  mockSuccessResponse,
  mockToast,
} from "./useQuoteSubmission.mocks";

describe("useQuoteSubmission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the QuoteSubmissionService
    (api.QuoteSubmissionService as any) = mockQuoteSubmissionService;
    // Mock toast
    (toast.success as any) = mockToast.success;
    (toast.error as any) = mockToast.error;
  });

  it("should submit quote successfully", async () => {
    mockQuoteSubmissionService.submitQuoteAsNewVersion.mockResolvedValueOnce(
      mockSuccessResponse
    );
    const { result } = renderHook(() => useQuoteSubmission());
    let submitResult: boolean | undefined;
    await act(async () => {
      submitResult = await result.current.submitQuote(
        mockQuoteSubmissionRequest
      );
    });
    expect(submitResult).toBe(true);
    expect(mockToast.success).toHaveBeenCalledWith(
      "Quote submitted successfully!"
    );
    expect(result.current.error).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle failed quote submission", async () => {
    mockQuoteSubmissionService.submitQuoteAsNewVersion.mockResolvedValueOnce(
      mockFailureResponse
    );
    const { result } = renderHook(() => useQuoteSubmission());
    let submitResult: boolean | undefined;
    await act(async () => {
      submitResult = await result.current.submitQuote(
        mockQuoteSubmissionRequest
      );
    });
    expect(submitResult).toBe(false);
    expect(mockToast.error).toHaveBeenCalledWith(
      "Failed to submit quote. Please try again."
    );
    expect(result.current.error).toBe(
      "Failed to submit quote. Please try again."
    );
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle error thrown during submission", async () => {
    mockQuoteSubmissionService.submitQuoteAsNewVersion.mockRejectedValueOnce(
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
    expect(mockToast.error).toHaveBeenCalledWith(
      "Failed to submit quote: Network error"
    );
    expect(result.current.error).toBe("Network error");
    expect(result.current.isSubmitting).toBe(false);
  });
});
