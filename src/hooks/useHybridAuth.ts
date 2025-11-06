"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { ServerUser } from "@/lib/auth-server";
import { useEffect, useState } from "react";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";

/**
 * Hybrid authentication hook that combines server-side and client-side auth state
 *
 * This hook accepts initial auth state from server-side rendering and smoothly
 * transitions to client-side auth state after hydration, eliminating UI flickering.
 *
 * @param initialAuth - Authentication state from server-side rendering
 * @param initialUser - User data from server-side rendering
 * @returns Authentication state and utilities
 */
export function useHybridAuth(
  initialAuth?: boolean,
  initialUser?: ServerUser | null
) {
  const clientAuth = useUserDetails();
  const [isHydrated, setIsHydrated] = useState(false);

  // Track hydration status
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use server auth initially, then switch to client auth after hydration
  const isAuthenticated = isHydrated
    ? clientAuth.isAuthenticated
    : (initialAuth ?? false);

  const user = isHydrated ? clientAuth.user : (initialUser ?? null);

  const isLoading = isHydrated ? clientAuth.isLoading : false; // Server has no loading state

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    isHydrated,

    // Client-side only functions (available after hydration)
    login: clientAuth.login,
    logout: clientAuth.logout,
    checkAuth: clientAuth.checkAuth,

    // Utilities
    isServerRender: !isHydrated,
    isClientRender: isHydrated,
  };
}

/**
 * Simple hook for checking authentication status with SSR support
 *
 * @param initialAuth - Initial authentication state from server
 * @returns boolean - Authentication status
 */
export function useIsAuthenticated(initialAuth?: boolean): boolean {
  const { isAuthenticated } = useHybridAuth(initialAuth);
  return isAuthenticated;
}

/**
 * Hook for getting user data with SSR support
 *
 * @param initialUser - Initial user data from server
 * @returns User object or null
 */
export function useAuthUser(initialUser?: ServerUser | null) {
  const { user } = useHybridAuth(undefined, initialUser);
  return user;
}

/**
 * Hook for components that need both auth state and loading capabilities
 *
 * @param initialAuth - Initial authentication state from server
 * @param initialUser - Initial user data from server
 * @returns Combined auth and loading utilities
 */
export function useAuthWithLoader(
  initialAuth?: boolean,
  initialUser?: ServerUser | null
) {
  const auth = useHybridAuth(initialAuth, initialUser);
  const { withLogoutLoader } = useGlobalLoader();

  const handleLogout = async () => {
    if (!auth.isAuthenticated) return;

    await withLogoutLoader(async () => {
      auth.logout();
    });
  };

  return {
    ...auth,
    logoutWithLoader: handleLogout,
  };
}
