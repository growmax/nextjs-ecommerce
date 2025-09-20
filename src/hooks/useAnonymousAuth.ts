"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

interface AnonymousAuthState {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAnonymousAuth() {
  const [authState, setAuthState] = useState<AnonymousAuthState>({
    token: null,
    userId: null,
    isLoading: true,
    error: null,
  });

  // Check for existing token
  const { data: tokenCheck } = useQuery({
    queryKey: ["anonymous-token-check"],
    queryFn: async () => {
      const response = await fetch("/api/auth/anonymous");
      if (!response.ok) throw new Error("Failed to check token");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Initialize anonymous session
  const initMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/anonymous", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to initialize anonymous session");
      }

      return response.json();
    },
    onSuccess: data => {
      setAuthState({
        token: data.token,
        userId: data.userId,
        isLoading: false,
        error: null,
      });
    },
    onError: error => {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    },
  });

  // Clear anonymous session
  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/anonymous", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear anonymous session");
      }

      return response.json();
    },
    onSuccess: () => {
      setAuthState({
        token: null,
        userId: null,
        isLoading: false,
        error: null,
      });
    },
  });

  // Initialize on mount if no token exists
  useEffect(() => {
    if (tokenCheck && !tokenCheck.hasToken && !authState.token) {
      initMutation.mutate();
    } else if (tokenCheck && tokenCheck.hasToken) {
      setAuthState({
        token: tokenCheck.token,
        userId: tokenCheck.userId || null,
        isLoading: false,
        error: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenCheck]);

  const initializeSession = useCallback(() => {
    initMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSession = useCallback(() => {
    clearMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...authState,
    initializeSession,
    clearSession,
    isInitializing: initMutation.isPending,
    isClearing: clearMutation.isPending,
  };
}

// Utility to read cookie value client-side (for non-httpOnly cookies)
export function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}
