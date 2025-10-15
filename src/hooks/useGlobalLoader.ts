"use client";

import { useLoading } from "@/contexts/LoadingContext";
import { useCallback } from "react";

export function useGlobalLoader() {
  const {
    isLoading,
    message,
    showLoading,
    hideLoading,
    updateMessage,
    showLogoutLoader,
    showProcessingLoader,
    showSubmittingLoader,
  } = useLoading();

  // Enhanced methods with automatic cleanup
  const withLoader = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options?: {
        message?: string;
        loadingId?: string;
        onError?: (error: Error) => void;
      }
    ): Promise<T> => {
      const { message = "Processing...", loadingId, onError } = options || {};

      try {
        showLoading(message, loadingId);
        const result = await asyncFn();
        return result;
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        }
        throw error;
      } finally {
        hideLoading(loadingId);
      }
    },
    [showLoading, hideLoading]
  );

  // Logout-specific wrapper
  const withLogoutLoader = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      return withLoader(asyncFn, {
        message: "Logging out...",
        loadingId: "logout",
      });
    },
    [withLoader]
  );

  // Form submission wrapper
  const withSubmissionLoader = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      message = "Submitting..."
    ): Promise<T> => {
      return withLoader(asyncFn, {
        message,
        loadingId: "submission",
      });
    },
    [withLoader]
  );

  // Generic processing wrapper
  const withProcessingLoader = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      message = "Processing..."
    ): Promise<T> => {
      return withLoader(asyncFn, {
        message,
        loadingId: "processing",
      });
    },
    [withLoader]
  );

  return {
    // State
    isLoading,
    message,

    // Basic controls
    showLoading,
    hideLoading,
    updateMessage,

    // Preset loaders
    showLogoutLoader,
    showProcessingLoader,
    showSubmittingLoader,

    // Wrapper functions for async operations
    withLoader,
    withLogoutLoader,
    withSubmissionLoader,
    withProcessingLoader,
  };
}

// Specialized hooks for specific use cases
export function useLogoutLoader() {
  const { withLogoutLoader, isLoading, message } = useGlobalLoader();

  return {
    isLoading: isLoading && message === "Logging out...",
    logout: withLogoutLoader,
  };
}

export function useSubmissionLoader() {
  const { withSubmissionLoader, isLoading } = useGlobalLoader();

  return {
    isLoading,
    submit: withSubmissionLoader,
  };
}

export function useProcessingLoader() {
  const { withProcessingLoader, isLoading } = useGlobalLoader();

  return {
    isLoading,
    process: withProcessingLoader,
  };
}
