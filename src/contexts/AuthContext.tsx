"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  useEffect(() => {
    checkAuth();
    setIsLoading(false);
  }, [checkAuth]);

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
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    AuthStorage.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
