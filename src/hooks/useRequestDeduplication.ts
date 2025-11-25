"use client";

import { useCallback, useRef } from "react";

/**
 * Hook for deduplicating concurrent requests, especially useful for RSC calls
 *
 * This hook prevents duplicate requests when:
 * - React StrictMode causes double renders in development
 * - Multiple components trigger the same request
 * - Navigation events trigger duplicate route loads
 *
 * @returns Object with `deduplicate` function that ensures only one request per key
 *
 * @example
 * ```tsx
 * const { deduplicate } = useRequestDeduplication();
 *
 * const fetchData = useCallback(async () => {
 *   return await deduplicate(
 *     async () => {
 *       // Your API call here
 *       return await fetch('/api/data').then(r => r.json());
 *     },
 *     'data-fetch-key' // Unique key for this request
 *   );
 * }, [deduplicate]);
 * ```
 */
export function useRequestDeduplication() {
  // Track active requests by key
  const activeRequestsRef = useRef<Map<string, Promise<any>>>(new Map());

  // Track request timestamps to prevent rapid duplicate calls
  const lastRequestTimeRef = useRef<Map<string, number>>(new Map());
  const REQUEST_DEBOUNCE_MS = 100; // Minimum time between same requests

  /**
   * Deduplicate a request - if same request is already in-flight, return existing promise
   *
   * @param fn - The async function to execute
   * @param key - Unique key to identify this request (route path, API endpoint, etc.)
   * @param options - Optional configuration
   * @returns Promise that resolves with the function result
   */
  const deduplicate = useCallback(
    async <T>(
      fn: () => Promise<T>,
      key: string,
      options?: {
        debounceMs?: number;
        force?: boolean; // Force new request even if one exists
      }
    ): Promise<T> => {
      const requestKey = key;
      const debounceMs = options?.debounceMs ?? REQUEST_DEBOUNCE_MS;
      const now = Date.now();

      // Check if there's an active request with this key
      const activeRequest = activeRequestsRef.current.get(requestKey);
      if (activeRequest && !options?.force) {
        // Return existing promise if request is still active
        return activeRequest as Promise<T>;
      }

      // Check debounce window
      const lastRequestTime = lastRequestTimeRef.current.get(requestKey) || 0;
      if (now - lastRequestTime < debounceMs && !options?.force) {
        // If there's an active request, return it
        if (activeRequest) {
          return activeRequest as Promise<T>;
        }
        // Otherwise wait for debounce period
        await new Promise(resolve =>
          setTimeout(resolve, debounceMs - (now - lastRequestTime))
        );
        // Check again after debounce
        const stillActive = activeRequestsRef.current.get(requestKey);
        if (stillActive) {
          return stillActive as Promise<T>;
        }
      }

      // Create new request
      const requestPromise = (async () => {
        try {
          const result = await fn();
          return result;
        } finally {
          // Clean up after request completes
          activeRequestsRef.current.delete(requestKey);
        }
      })();

      // Store the promise
      activeRequestsRef.current.set(requestKey, requestPromise);
      lastRequestTimeRef.current.set(requestKey, Date.now());

      return requestPromise;
    },
    []
  );

  /**
   * Cancel an active request by key
   */
  const cancel = useCallback((key: string) => {
    activeRequestsRef.current.delete(key);
    lastRequestTimeRef.current.delete(key);
  }, []);

  /**
   * Cancel all active requests
   */
  const cancelAll = useCallback(() => {
    activeRequestsRef.current.clear();
    lastRequestTimeRef.current.clear();
  }, []);

  /**
   * Check if a request is currently active
   */
  const isActive = useCallback((key: string): boolean => {
    return activeRequestsRef.current.has(key);
  }, []);

  return {
    deduplicate,
    cancel,
    cancelAll,
    isActive,
  };
}
