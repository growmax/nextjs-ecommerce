"use client";

import { useUserDetails } from "@/contexts/UserDetailsContext";
import { redirectTo } from "@/lib/utils/navigation"; // Added import
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export default function useLogout() {
  const { logout } = useUserDetails();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useTranslations();

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-clicking

    setIsLoggingOut(true);

    try {
      await logout();
      // Show success toast (matching login toast style)
      toast.success(t("messages.success"), {
        description: t("auth.logoutSuccess"),
        duration: 4000,
      });
      // On successful logout, redirect to the homepage.
      // Using redirectTo to ensure a full page refresh and state clearing.
      redirectTo("/"); // Replaced window.location.assign
    } catch (error) {
      console.error("Logout failed:", error);
      // Show error toast
      toast.error(t("messages.error"), {
        description: t("auth.logoutError") || "Failed to logout",
        duration: 4000,
      });
    } finally {
      // This may not execute if redirect happens quickly, but good practice.
      setIsLoggingOut(false);
    }
  };

  return { isLoggingOut, handleLogout };
}
