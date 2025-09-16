"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthData } from "./authUtils";

export default function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      let accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");
      let refreshToken =
        localStorage.getItem("refresh-token") ||
        localStorage.getItem("refreshToken");

      if (!accessToken) {
        const cookies = document.cookie.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            if (key) {
              acc[key] = value || "";
            }
            return acc;
          },
          {} as Record<string, string>
        );

        accessToken = cookies["access_token"] || null;
        refreshToken = cookies["refresh-token"] || null;
      }

      if (!accessToken || !refreshToken) {
        clearAuthData();
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          accessToken,
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success === true) {
        clearAuthData();
        router.push("/login");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch {
      const shouldClearData = confirm(
        "Logout request failed. Clear local data anyway?"
      );

      if (shouldClearData) {
        clearAuthData();
        router.push("/login");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { isLoggingOut, handleLogout };
}
