"use client";

import { useState, useEffect } from "react";

interface UserProfile {
  displayName: string;
  email: string;
  companyName: string;
  role: string;
  accountRole: string;
  lastLogin?: string;
  picture?: string;
}

export default function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = async () => {
    try {
      let accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

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
      }

      if (!accessToken) {
        return;
      }

      try {
        const tokenParts = accessToken.split(".");
        if (tokenParts.length < 2) {
          return;
        }
        const payload = JSON.parse(atob(tokenParts[1]!));

        const lastLoginDate = payload.iat
          ? new Date(payload.iat * 1000)
          : new Date();
        const formattedLastLogin = `${lastLoginDate.toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }
        )} ${lastLoginDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`;

        setUserProfile({
          displayName: payload.displayName || "User",
          email: payload.email || "No email",
          companyName: payload.companyName || "No company",
          role: payload.roleName || "User",
          accountRole: payload.accountRole || "",
          lastLogin: formattedLastLogin,
          picture: payload.picture,
        });
      } catch {
        // Silent error - invalid token format
      }
    } catch {
      // Silent error - unable to fetch profile
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return { userProfile, fetchUserProfile };
}
