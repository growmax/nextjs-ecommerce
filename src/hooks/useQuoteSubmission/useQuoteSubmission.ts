import type { QuoteSubmissionRequest } from "@/lib/api";
import { QuoteSubmissionService } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

interface UseQuoteSubmissionResult {
  submitQuote: (request: QuoteSubmissionRequest) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Custom hook for submitting quotes as new versions
 * Handles the submission process, loading states, and error handling
 */
export function useQuoteSubmission(): UseQuoteSubmissionResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuote = async (
    request: QuoteSubmissionRequest
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response =
        await QuoteSubmissionService.submitQuoteAsNewVersion(request);

      if (response.success) {
        toast.success("Quote submitted successfully!");
        return true;
      } else {
        const errorMessage = "Failed to submit quote. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(`Failed to submit quote: ${errorMessage}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitQuote,
    isSubmitting,
    error,
  };
}
