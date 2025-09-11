"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";

export function useSafeTranslation() {
  const [mounted, setMounted] = useState(false);

  // Always call useTranslation in the same position
  const translation = useTranslation();

  // Always call useEffect in the same position
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call useCallback in the same position
  const safeT = useCallback(
    (
      key: string,
      fallback?: string,
      options?: Record<string, unknown>
    ): string => {
      // If not mounted or translations not ready, return fallback
      if (!mounted || !translation.ready) {
        return fallback || key.split(".").pop() || key;
      }

      try {
        const result = options
          ? translation.t(key, options)
          : translation.t(key);
        return typeof result === "string" ? result : fallback || key;
      } catch {
        // Translation error for key
        return fallback || key;
      }
    },
    [mounted, translation]
  );

  return {
    t: safeT,
    ready: mounted && translation.ready,
    i18n: translation.i18n,
    isClient: mounted,
  };
}
