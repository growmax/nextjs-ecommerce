"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { redirectTo } from "@/lib/utils/navigation"; // Added import
import { useState } from "react";

export default function useLogout() {
  const { logout } = useUserDetails();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-clicking

    setIsLoggingOut(true);

    try {
      await logout();
      // On successful logout, redirect to the homepage.
      // Using redirectTo to ensure a full page refresh and state clearing.
      redirectTo("/"); // Replaced window.location.assign
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally handle logout errors, e.g., show a notification
    } finally {
      // This may not execute if redirect happens quickly, but good practice.
      setIsLoggingOut(false);
    }
  };

  return { isLoggingOut, handleLogout };
}
