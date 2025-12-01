"use client";

import { usePrefetchMainRoutes } from "@/hooks/usePrefetchMainRoutes";

/**
 * Component to prefetch main routes on app mount
 * This ensures routes are ready for instant navigation
 */
export function PrefetchMainRoutes() {
  usePrefetchMainRoutes();
  return null; // This component doesn't render anything
}
