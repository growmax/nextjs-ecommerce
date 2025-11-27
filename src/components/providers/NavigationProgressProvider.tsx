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
  // delayMs set to 0 for instant feedback - skeleton should show immediately on click
  useNavigationProgress({
    autoDetect: true,
    delayMs: 0, // Instant feedback - no delay
    respectReducedMotion: true,
    timeoutMs: 30000,
  });

  return <>{children}</>;
}
