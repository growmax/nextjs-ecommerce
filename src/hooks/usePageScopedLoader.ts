"use client";

import { useBlockingLoader } from "@/providers/BlockingLoaderProvider";
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
    const { showLoader, hideLoader } = useBlockingLoader();

    useEffect(() => {
        if (isPending) {
            showLoader({ mode: "scoped", message });
        } else {
            hideLoader();
        }
    }, [isPending, message, showLoader, hideLoader]);
}
