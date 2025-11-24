"use client";

import { useNavigationProgress } from "@/hooks/useNavigationProgress";

/**
 * NavigationProgressProvider
 *
 * Automatically tracks navigation events and shows/hides the progress bar
 * during page transitions and route changes.
 */
export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Automatically track navigation progress
  useNavigationProgress({
    autoDetect: true,
    delayMs: 100,
    respectReducedMotion: true,
    timeoutMs: 30000,
  });

  return <>{children}</>;
}
