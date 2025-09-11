"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "@/i18n/navigation";
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

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize auth state from localStorage on mount
    if (typeof window !== "undefined") {
      return AuthStorage.isAuthenticated();
    }
    return false;
  });

  const router = useRouter();

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

  // Only run once on mount
  useEffect(() => {
    // Quick validation on mount
    const isAuth = checkAuth();
    setIsLoading(false);

    // If not authenticated and trying to access protected route
    if (!isAuth && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const protectedRoutes = ["/dashboard", "/orders", "/profile"];
      const isProtectedRoute = protectedRoutes.some(route =>
        pathname.includes(route)
      );

      if (isProtectedRoute) {
        router.push("/login");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

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

      // Use replace instead of push for better navigation
      router.replace("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    AuthStorage.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    router.replace("/login");
  }, [router]);

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
