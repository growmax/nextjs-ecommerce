"use client";

import { AuthStorage } from "@/lib/auth";
import { UserDetails } from "@/lib/interfaces/UserInterfaces";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Consolidated User Details Context
 * Provides both authentication state AND full user data
 * Replaces both AuthProvider and UserSessionProvider
 */
interface UserDetailsContextData {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;

  // User data
  user: UserDetails | null;
  error: string | null;

  // Actions
  login: (
    tokens: { accessToken: string; refreshToken?: string; expiresIn?: number },
    userData: UserDetails
  ) => void;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
}

const UserDetailsContext = createContext<UserDetailsContextData | undefined>(
  undefined
);

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error("useUserDetails must be used within a UserDetailsProvider");
  }
  return context;
};

// Convenience hooks
export const useUserId = () => {
  const { user } = useUserDetails();
  return user?.userId || null;
};

export const useUserDisplayName = () => {
  const { user } = useUserDetails();
  return user?.displayName || null;
};

export const useUserRole = () => {
  const { user } = useUserDetails();
  return user?.roleName || null;
};

export const useIsAuthenticated = () => {
  const { isAuthenticated } = useUserDetails();
  return isAuthenticated;
};

// Backward compatibility - these will work but are deprecated
export const useUserSession = () => {
  const { user, isLoading, error } = useUserDetails();
  return { user, isLoading, error };
};

interface UserDetailsProviderProps {
  children: React.ReactNode;
  initialAuthState?: boolean;
  initialUserData?: UserDetails | null;
}

export function UserDetailsProvider({
  children,
  initialAuthState = false,
  initialUserData,
}: UserDetailsProviderProps) {
  const [user, setUser] = useState<UserDetails | null>(() => {
    return initialUserData || null;
  });
  // Use a ref to preserve auth state during navigation transitions
  // This prevents the login button from flashing during language switching
  const authStateRef = React.useRef<boolean>(
    initialAuthState !== undefined ? initialAuthState : false
  );
  // Update ref when initialAuthState changes
  React.useEffect(() => {
    if (initialAuthState !== undefined) {
      authStateRef.current = initialAuthState;
    }
  }, [initialAuthState]);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Use server state if provided, otherwise check client-side
    if (initialAuthState !== undefined) {
      authStateRef.current = initialAuthState;
      return initialAuthState;
    }
    const authenticated = AuthStorage.isAuthenticated();
    authStateRef.current = authenticated;
    return authenticated;
  });

  // Sync auth state from storage on mount and preserve during transitions
  // This ensures auth state is preserved during language switching
  React.useEffect(() => {
    const checkAuthState = () => {
      // Defensive check for test environments where AuthStorage might not be available
      try {
        if (
          typeof AuthStorage === "undefined" ||
          !AuthStorage ||
          typeof AuthStorage.isAuthenticated !== "function"
        ) {
          // In test environments, use the initial auth state
          return;
        }
        const authenticated = AuthStorage.isAuthenticated();
        // Only update if state actually changed to prevent unnecessary re-renders
        if (authStateRef.current !== authenticated) {
          authStateRef.current = authenticated;
          setIsAuthenticated(authenticated);
        }
      } catch (error) {
        // Silently fail in test environments
        if (process.env.NODE_ENV !== "test") {
          console.error("Error checking auth state:", error);
        }
      }
    };

    // Check immediately on mount
    checkAuthState();

    // Also check when storage changes (e.g., during navigation)
    // Use a small delay to batch multiple checks
    const timeoutId = setTimeout(checkAuthState, 50);

    // Listen for token refresh events
    const handleTokenRefresh = () => {
      // Delay slightly to ensure cookie is available
      setTimeout(checkAuthState, 150);
    };
    window.addEventListener("token-refreshed", handleTokenRefresh);

    // Periodic check to catch any missed updates (every 2 seconds)
    const intervalId = setInterval(checkAuthState, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener("token-refreshed", handleTokenRefresh);
    };
  }, []);
  // Loading state: true during hydration, false after mount
  // Use a ref to track if we've already hydrated to prevent resetting during navigation
  const hasHydratedRef = React.useRef(false);
  const [isLoading, setIsLoading] = useState(() => {
    // If we have initial auth state, we're not loading
    if (initialAuthState !== undefined) {
      hasHydratedRef.current = true;
      return false;
    }
    return true;
  });

  // Set loading to false after hydration (only once)
  React.useEffect(() => {
    if (!hasHydratedRef.current) {
      setIsLoading(false);
      hasHydratedRef.current = true;
    }
  }, []);

  const login = useCallback(
    (
      tokens: {
        accessToken: string;
        refreshToken?: string;
        expiresIn?: number;
      },
      userData: UserDetails
    ) => {
      AuthStorage.setTokens(tokens);
      setUser(userData);
      setIsAuthenticated(true);
    },
    []
  );

  const logout = useCallback(async () => {
    await AuthStorage.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const checkAuth = useCallback(() => {
    const authenticated = AuthStorage.isAuthenticated();
    setIsAuthenticated(authenticated);

    // Clear user data if not authenticated
    if (!authenticated) {
      setUser(null);
    }

    return authenticated;
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<UserDetailsContextData>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      error: user ? null : isAuthenticated ? "No user session" : null,
      login,
      logout,
      checkAuth,
    }),
    [isAuthenticated, isLoading, user, login, logout, checkAuth]
  );

  return (
    <UserDetailsContext.Provider value={contextValue}>
      {children}
    </UserDetailsContext.Provider>
  );
}
