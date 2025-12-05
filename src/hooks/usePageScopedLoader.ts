"use client";

import { useEffect } from "react";

/**
 * usePageScopedLoader Hook
 *
 * Auto-triggers scoped blocking loader based on isPending state from useTransition.
 *
 * Usage:
 * ```tsx
 * const [isPending, startTransition] = useTransition();
 * usePageScopedLoader(isPending);
 * ```
 *
 * Phase 1: Only used in product pages (Category, Brand, Brand+Category)
 *
 * @param isPending - Transition pending state from useTransition()
 * @param message - Optional custom loading message (default: "Loading…")
 */
export function usePageScopedLoader(
  isPending: boolean,
  message: string = "Loading…"
) {
  useEffect(() => {
    // This hook is deprecated - blocking loader system removed
    // Consider using regular loading states instead
  }, [isPending, message]);
}
