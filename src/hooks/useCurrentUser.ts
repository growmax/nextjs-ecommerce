"use client";

import { useState, useEffect } from "react";

interface CurrentUser {
  userId: number;
  companyId: number;
  displayName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First check if we have cached user data
        const cachedUser = sessionStorage.getItem("currentUser");
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setLoading(false);
          return;
        }

        // Fetch user data from API
        const response = await fetch("/api/auth/current-user", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        if (data.success && data.user) {
          const userData: CurrentUser = {
            userId: data.user.userId || 1032, // Fallback to default
            companyId: data.user.companyId || 8690, // Fallback to default
            displayName: data.user.displayName || "",
            email: data.user.email || "",
            phoneNumber: data.user.phoneNumber,
            role: data.user.role,
          };

          // Cache the user data
          sessionStorage.setItem("currentUser", JSON.stringify(userData));
          setUser(userData);
        } else {
          // Use default values if API doesn't return proper data
          const defaultUser: CurrentUser = {
            userId: 1032,
            companyId: 8690,
            displayName: "User",
            email: "",
          };
          setUser(defaultUser);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");

        // Use default values on error
        const defaultUser: CurrentUser = {
          userId: 1032,
          companyId: 8690,
          displayName: "User",
          email: "",
        };
        setUser(defaultUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const clearUserCache = () => {
    sessionStorage.removeItem("currentUser");
  };

  return {
    user,
    loading,
    error,
    clearUserCache,
  };
}
