"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useState } from "react";

export default function useLogout() {
  const { logout } = useUserDetails();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-clicking

    setIsLoggingOut(true);

    try {
      // Use the AuthContext logout method which handles everything
      await logout();
      // Note: logout() redirects to login page, so this code may not execute
    } catch {
      // Even on error, logout context handles redirect
    } finally {
      // This may not execute due to redirect, but keep for safety
      setIsLoggingOut(false);
    }
  };

  return { isLoggingOut, handleLogout };
}
