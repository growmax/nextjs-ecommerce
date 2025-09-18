"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface LoadingState {
  isLoading: boolean;
  message: string | undefined;
  loadingId: string | undefined;
}

interface LoadingContextType {
  // Current loading state
  isLoading: boolean;
  message: string | undefined;
  loadingId: string | undefined;

  // Actions
  showLoading: (message?: string, loadingId?: string) => void;
  hideLoading: (loadingId?: string) => void;
  updateMessage: (message: string) => void;

  // Convenience methods for common operations
  showLogoutLoader: () => void;
  showProcessingLoader: (message?: string) => void;
  showSubmittingLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: undefined,
    loadingId: undefined,
  });

  const showLoading = useCallback((message?: string, loadingId?: string) => {
    setLoadingState({
      isLoading: true,
      message,
      loadingId,
    });
  }, []);

  const hideLoading = useCallback((loadingId?: string) => {
    setLoadingState(current => {
      // If a specific loadingId is provided, only hide if it matches
      if (loadingId && current.loadingId !== loadingId) {
        return current;
      }

      return {
        isLoading: false,
        message: undefined,
        loadingId: undefined,
      };
    });
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoadingState(current => ({
      ...current,
      message,
    }));
  }, []);

  // Convenience methods for common loading scenarios
  const showLogoutLoader = useCallback(() => {
    showLoading("Logging out...", "logout");
  }, [showLoading]);

  const showProcessingLoader = useCallback(
    (message = "Processing...") => {
      showLoading(message, "processing");
    },
    [showLoading]
  );

  const showSubmittingLoader = useCallback(() => {
    showLoading("Submitting...", "submitting");
  }, [showLoading]);

  const contextValue: LoadingContextType = {
    // State
    isLoading: loadingState.isLoading,
    message: loadingState.message,
    loadingId: loadingState.loadingId,

    // Actions
    showLoading,
    hideLoading,
    updateMessage,

    // Convenience methods
    showLogoutLoader,
    showProcessingLoader,
    showSubmittingLoader,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
}

// Custom hook to use the loading context
export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }

  return context;
}

// Additional hooks for specific loading scenarios
export function useLogoutLoader() {
  const { showLogoutLoader, hideLoading, isLoading, loadingId } = useLoading();

  return {
    isLoading: isLoading && loadingId === "logout",
    showLoader: showLogoutLoader,
    hideLoader: () => hideLoading("logout"),
  };
}

export function useProcessingLoader() {
  const { showProcessingLoader, hideLoading, isLoading, loadingId } =
    useLoading();

  return {
    isLoading: isLoading && loadingId === "processing",
    showLoader: showProcessingLoader,
    hideLoader: () => hideLoading("processing"),
  };
}

export function useSubmittingLoader() {
  const { showSubmittingLoader, hideLoading, isLoading, loadingId } =
    useLoading();

  return {
    isLoading: isLoading && loadingId === "submitting",
    showLoader: showSubmittingLoader,
    hideLoader: () => hideLoading("submitting"),
  };
}
