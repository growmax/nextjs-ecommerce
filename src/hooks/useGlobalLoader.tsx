"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LoadingState {
  isLoading: boolean;
  message: string;
  loadingIds: Set<string>;
}

interface LoadingContextType extends LoadingState {
  showLoading: (message?: string, loadingId?: string) => void;
  hideLoading: (loadingId?: string) => void;
  updateMessage: (message: string) => void;
  showLogoutLoader: () => void;
  showProcessingLoader: () => void;
  showSubmittingLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    message: "",
    loadingIds: new Set(),
  });

  const showLoading = (message = "Loading...", loadingId = "default") => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      message,
      loadingIds: new Set([...prev.loadingIds, loadingId]),
    }));
  };

  const hideLoading = (loadingId = "default") => {
    setState(prev => {
      const newLoadingIds = new Set(prev.loadingIds);
      newLoadingIds.delete(loadingId);
      
      return {
        ...prev,
        isLoading: newLoadingIds.size > 0,
        loadingIds: newLoadingIds,
        // If no more loading states, clear message
        message: newLoadingIds.size > 0 ? prev.message : "",
      };
    });
  };

  const updateMessage = (message: string) => {
    setState(prev => ({ ...prev, message }));
  };

  const showLogoutLoader = () => {
    showLoading("Logging out...", "logout");
  };

  const showProcessingLoader = () => {
    showLoading("Processing...", "processing");
  };

  const showSubmittingLoader = () => {
    showLoading("Submitting...", "submission");
  };

  return (
    <LoadingContext.Provider
      value={{
        ...state,
        showLoading,
        hideLoading,
        updateMessage,
        showLogoutLoader,
        showProcessingLoader,
        showSubmittingLoader,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

// Add the useGlobalLoader hook back
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
  };
}

// Specialized hooks for specific use cases
export function useLogoutLoader() {
  const { showLogoutLoader, isLoading, message } = useGlobalLoader();

  return {
    isLoading: isLoading && message === "Logging out...",
    logout: showLogoutLoader,
  };
}

export function useSubmissionLoader() {
  const { showSubmittingLoader, isLoading } = useGlobalLoader();

  return {
    isLoading,
    submit: showSubmittingLoader,
  };
}

export function useProcessingLoader() {
  const { showProcessingLoader, isLoading } = useGlobalLoader();

  return {
    isLoading,
    process: showProcessingLoader,
  };
}
