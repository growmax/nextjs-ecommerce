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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Use server state if provided, otherwise check client-side
    if (initialAuthState !== undefined) {
      return initialAuthState;
    }
    return AuthStorage.isAuthenticated();
  });
  const [isLoading] = useState(false);

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
