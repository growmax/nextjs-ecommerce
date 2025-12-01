"use client";

import { usePathname } from "@/i18n/navigation";
import { useNavigationProgress } from "@/hooks/useNavigationProgress";
import { useEffect, useRef } from "react";

/**
 * NavigationLoadingProvider
 *
 * Ensures loading states are shown immediately on navigation
 * by detecting pathname changes and triggering loading state early.
 */
export function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const { startNavigation } = useNavigationProgress();

  useEffect(() => {
    // On initial mount, just store the pathname
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    // If pathname changed, navigation is happening
    if (prevPathnameRef.current !== pathname) {
      // Start navigation loading immediately
      // This ensures loading.tsx files show up right away
      startNavigation("Loading page...");

      // Update previous pathname
      prevPathnameRef.current = pathname;
    }
  }, [pathname, startNavigation]);

  return <>{children}</>;
}
