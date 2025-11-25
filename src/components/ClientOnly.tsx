"use client";

import { useHydration } from "@/hooks/useHydration/useHydration";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component to prevent hydration mismatches
 * Only renders children after client-side hydration is complete
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const mounted = useHydration();

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
