"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

/**
 * Loader mode types
 * - 'global': Full-screen overlay (fixed positioning)
 * - 'scoped': Page-scoped overlay (absolute positioning within #page-main)
 */
type LoaderMode = "global" | "scoped";

/**
 * Loader state interface
 */
interface LoaderState {
  counter: number;
  isActive: boolean;
  message: string;
  mode: LoaderMode;
}

/**
 * Loader API interface
 */
interface LoaderAPI {
  showLoader: (options?: { message?: string; mode?: LoaderMode }) => void;
  hideLoader: () => void;
  withLoader: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

/**
 * Combined context type
 */
type BlockingLoaderContextType = LoaderState & LoaderAPI;

/**
 * Create context with undefined default
 */
const BlockingLoaderContext = createContext<
  BlockingLoaderContextType | undefined
>(undefined);

/**
 * BlockingLoaderProvider Component
 * 
 * Provides global blocking loader state with reference counting.
 * Multiple calls to showLoader() increment counter, hideLoader() decrements.
 * Loader is active when counter > 0.
 * 
 * Phase 1: Used ONLY in product pages (Category, Brand, Brand+Category)
 */
export function BlockingLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<LoaderState>({
    counter: 0,
    isActive: false,
    message: "Loading…",
    mode: "scoped", // Default to scoped for Phase 1
  });

  /**
   * Show loader with optional message and mode
   * Increments reference counter
   */
  const showLoader = useCallback(
    (options?: { message?: string; mode?: LoaderMode }) => {
      setState((prev) => {
        const newCounter = prev.counter + 1;
        return {
          counter: newCounter,
          isActive: true,
          message: options?.message || prev.message || "Loading…",
          mode: options?.mode || prev.mode || "scoped",
        };
      });
    },
    []
  );

  /**
   * Hide loader
   * Decrements reference counter
   * Only deactivates when counter reaches 0
   */
  const hideLoader = useCallback(() => {
    setState((prev) => {
      const newCounter = Math.max(0, prev.counter - 1); // Never allow negative
      return {
        ...prev,
        counter: newCounter,
        isActive: newCounter > 0,
      };
    });
  }, []);

  /**
   * Wrap an async function with loader
   * Automatically shows loader before execution and hides after completion
   */
  const withLoader = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      showLoader();
      try {
        return await asyncFn();
      } finally {
        hideLoader();
      }
    },
    [showLoader, hideLoader]
  );

  const contextValue: BlockingLoaderContextType = {
    ...state,
    showLoader,
    hideLoader,
    withLoader,
  };

  return (
    <BlockingLoaderContext.Provider value={contextValue}>
      {children}
    </BlockingLoaderContext.Provider>
  );
}

/**
 * Hook to access blocking loader context
 * 
 * @throws Error if used outside BlockingLoaderProvider
 */
export function useBlockingLoader(): BlockingLoaderContextType {
  const context = useContext(BlockingLoaderContext);
  if (!context) {
    throw new Error(
      "useBlockingLoader must be used within BlockingLoaderProvider"
    );
  }
  return context;
}
