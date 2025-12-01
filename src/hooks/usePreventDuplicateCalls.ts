"use client";

import { useCallback, useRef } from "react";

/**
 * Hook to prevent duplicate API calls
 *
 * This hook provides a mechanism to prevent duplicate function calls
 * with the same parameters within a short time window.
 *
 * @returns Object with `callOnce` function that prevents duplicate calls
 *
 * @example
 * ```tsx
 * const { callOnce } = usePreventDuplicateCalls();
 *
 * const fetchData = useCallback(async () => {
 *   await callOnce(async () => {
 *     // Your API call here
 *     return await api.getData();
 *   }, [param1, param2]);
 * }, [param1, param2]);
 * ```
 */
export function usePreventDuplicateCalls() {
  const activeCallsRef = useRef<Map<string, AbortController>>(new Map());
  const lastCallTimeRef = useRef<Map<string, number>>(new Map());

  /**
   * Execute a function only once per unique key within a debounce window
   *
   * @param fn - The function to execute
   * @param key - Unique key to identify this call (usually based on parameters)
   * @param debounceMs - Minimum time between calls with same key (default: 200ms)
   * @returns Promise that resolves with the function result or rejects if aborted
   */
  const callOnce = useCallback(
    async <T>(
      fn: () => Promise<T>,
      key: string | (string | number | boolean | null | undefined)[],
      debounceMs: number = 200
    ): Promise<T> => {
      // Convert key to string if it's an array
      const keyString = Array.isArray(key) ? JSON.stringify(key) : String(key);

      const now = Date.now();
      const lastCallTime = lastCallTimeRef.current.get(keyString) || 0;

      // Debounce: prevent calls within the debounce window
      if (now - lastCallTime < debounceMs) {
        // Cancel any existing call with this key
        const existingController = activeCallsRef.current.get(keyString);
        if (existingController) {
          existingController.abort();
        }
        // Wait for debounce period
        await new Promise(resolve =>
          setTimeout(resolve, debounceMs - (now - lastCallTime))
        );
      }

      // Cancel any existing call with this key
      const existingController = activeCallsRef.current.get(keyString);
      if (existingController) {
        existingController.abort();
      }

      // Create new abort controller for this call
      const abortController = new AbortController();
      activeCallsRef.current.set(keyString, abortController);

      // Update last call time
      lastCallTimeRef.current.set(keyString, Date.now());

      try {
        const result = await fn();

        // Only return result if not aborted
        if (abortController.signal.aborted) {
          throw new Error("Call was aborted");
        }

        // Clean up
        activeCallsRef.current.delete(keyString);
        return result;
      } catch (error: any) {
        // Clean up on error (unless it was an abort)
        if (error?.name !== "AbortError" && !abortController.signal.aborted) {
          activeCallsRef.current.delete(keyString);
        }
        throw error;
      }
    },
    []
  );

  /**
   * Cancel all active calls
   */
  const cancelAll = useCallback(() => {
    activeCallsRef.current.forEach(controller => {
      controller.abort();
    });
    activeCallsRef.current.clear();
  }, []);

  /**
   * Cancel a specific call by key
   */
  const cancel = useCallback(
    (key: string | (string | number | boolean | null | undefined)[]) => {
      const keyString = Array.isArray(key) ? JSON.stringify(key) : String(key);
      const controller = activeCallsRef.current.get(keyString);
      if (controller) {
        controller.abort();
        activeCallsRef.current.delete(keyString);
      }
    },
    []
  );

  return {
    callOnce,
    cancelAll,
    cancel,
  };
}
