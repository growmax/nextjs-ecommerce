"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AuthStorage } from "@/lib/auth";

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
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user from localStorage on mount (client-side only)
    if (typeof window !== "undefined") {
      return AuthStorage.getUserData();
    }
    return null;
  });

  const [isLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize auth state from localStorage on mount
    if (typeof window !== "undefined") {
      return AuthStorage.isAuthenticated();
    }
    return false;
  });

  const checkAuth = useCallback(() => {
    const authenticated = AuthStorage.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const userData = AuthStorage.getUserData();
      setUser(userData);
    } else {
      setUser(null);
    }

    return authenticated;
  }, []);

  // No useEffect needed - middleware handles auth checks

  const login = useCallback(
    (
      tokens: {
        accessToken: string;
        refreshToken?: string;
        expiresIn?: number;
      },
      userData: User
    ) => {
      AuthStorage.setTokens(tokens);
      AuthStorage.setUserData(userData);
      setUser(userData);
      setIsAuthenticated(true);

      // Don't redirect here - let the login page handle it
    },
    []
  );

  const logout = useCallback(() => {
    AuthStorage.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    // Use window.location for logout to ensure clean redirect
    window.location.href = "/en/login";
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
