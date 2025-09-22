"use client";

import { AuthStorage } from "@/lib/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role?: string;
  companyName?: string;
  companyId?: number;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    tokens: { accessToken: string; refreshToken?: string; expiresIn?: number },
    userData: User
  ) => void;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialAuthState?: boolean;
  initialUser?: User | null;
}

export function AuthProvider({
  children,
  initialAuthState,
  initialUser,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    // Always use server-side initial data when available
    if (initialUser !== undefined) {
      return initialUser;
    }
    return null;
  });

  const [isLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Always use server-side initial state when available
    if (initialAuthState !== undefined) {
      return initialAuthState;
    }
    return false;
  });

  const checkAuth = useCallback(() => {
    const authenticated = AuthStorage.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      // User data should be fetched from server, not stored locally
      // Components should make authenticated API calls to get user data
      setUser(null); // Will be populated by server-side props or API calls
    } else {
      setUser(null);
    }

    return authenticated;
  }, []);

  // Sync client-side state with cookies after hydration
  useEffect(() => {
    // Only run on client-side after initial render
    if (typeof window !== "undefined") {
      // If no initial state was provided from server, check client-side auth
      if (initialAuthState === undefined && initialUser === undefined) {
        const clientAuth = AuthStorage.isAuthenticated();
        // Don't get user from localStorage - use server-provided initial user or fetch from API

        setIsAuthenticated(clientAuth);
        setUser(null); // User data should come from server
      }
    }
  }, [initialAuthState, initialUser]);

  const login = useCallback(
    (
      _tokens: {
        accessToken: string;
        refreshToken?: string;
        expiresIn?: number;
      },
      userData: User
    ) => {
      // Tokens are set by server-side login API as HttpOnly cookies
      // Just update local state with user data from server response
      setUser(userData);
      setIsAuthenticated(true);

      // Don't redirect here - let the login page handle it
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      // Call server-side logout API
      await AuthStorage.logout();

      // Clear local state regardless of server response
      setUser(null);
      setIsAuthenticated(false);

      // Redirect to login page
      window.location.href = "/en/login";
    } catch {
      AuthStorage.clearAuth();
      setUser(null);
      setIsAuthenticated(false);

      // Redirect even on error
      window.location.href = "/en/login";
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      checkAuth,
    }),
    [user, isLoading, isAuthenticated, login, logout, checkAuth]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
