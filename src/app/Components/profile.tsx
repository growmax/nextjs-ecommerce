"use client";
/* eslint-disable no-console */

import {
  User,
  Home,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Building2,
  IdCard,
  ShoppingCart,
  FileText,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
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

export default function ProfileButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleLogout = async () => {
    console.log("=== LOGOUT PROCESS STARTED ===");
    setIsLoggingOut(true);

    try {
      // Step 1: Get tokens from current session (multiple sources)
      console.log("Step 1: Retrieving tokens from session...");

      // Try localStorage first
      let accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");
      let refreshToken =
        localStorage.getItem("refresh-token") ||
        localStorage.getItem("refreshToken");

      // Try cookies if localStorage is empty
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

      console.log("Token Status:", {
        accessToken: accessToken
          ? `${accessToken.substring(0, 20)}...`
          : "NOT FOUND",
        refreshToken: refreshToken
          ? `${refreshToken.substring(0, 20)}...`
          : "NOT FOUND",
        source: "localStorage + cookies",
      });

      if (!accessToken || !refreshToken) {
        console.warn("⚠️ No tokens found in session");
        console.log(
          "Since no active session exists, clearing any remaining local data..."
        );
        clearAuthData();
        router.push("/login");
        return;
      }

      // Step 2: Prepare API request (using internal API route)
      console.log("Step 2: Preparing logout API request...");
      const apiUrl = "/api/auth/logout"; // Use internal API route

      const requestHeaders = {
        "Content-Type": "application/json",
      };

      const requestBody = {
        refreshToken,
        accessToken,
      };

      console.log("API Request Details:", {
        url: apiUrl,
        method: "POST",
        headers: requestHeaders,
        body: {
          refreshToken: `${refreshToken.substring(0, 20)}...`,
          accessToken: `${accessToken.substring(0, 20)}...`,
        },
        note: "Using internal API route to clear HttpOnly cookies",
      });

      // Step 3: Make API call to internal route
      console.log("Step 3: Sending logout request to internal API...");
      const startTime = performance.now();

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Step 4: Process response
      console.log("Step 4: Processing backend response...");

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.warn("Response is not valid JSON:", jsonError);
        responseData = await response.text();
      }

      // Step 5: Log complete response details
      console.log("=== COMPLETE LOGOUT API RESPONSE ===");
      console.log("Response Status:", response.status, response.statusText);
      console.log(
        "Response Headers:",
        Object.fromEntries(response.headers.entries())
      );
      console.log("Response Data:", responseData);
      console.log("Request Duration:", `${duration}ms`);
      console.log("Success:", response.ok);
      console.log("=====================================");

      // Step 6: Check API response before clearing data
      if (response.ok && responseData && responseData.success === true) {
        console.log(
          "✅ API Response Success: true - Proceeding with data cleanup"
        );
        console.log("Step 5: Clearing local authentication data...");
        clearAuthData();

        console.log("Step 6: Redirecting to login page...");
        router.push("/login");

        console.log("=== LOGOUT PROCESS COMPLETED SUCCESSFULLY ===");
      } else {
        console.warn(
          "⚠️ API Response Failed or Success=false - NOT clearing local data"
        );
        console.log("Response Details:", {
          httpStatus: response.status,
          responseOk: response.ok,
          successFlag: responseData?.success,
          keepingLocalData: true,
        });

        // Show error message to user but don't clear data
        alert("Logout failed on server. Please try again or contact support.");
        console.log("=== LOGOUT PROCESS FAILED - DATA PRESERVED ===");
      }
    } catch (error) {
      console.error("=== LOGOUT PROCESS ERROR ===");
      console.error("Error Details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : "Error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      // On network/API errors, ask user what to do
      const shouldClearData = confirm(
        "Logout request failed due to network error. Would you like to:\n\n" +
          "OK: Clear local data anyway (force logout)\n" +
          "Cancel: Keep logged in and try again later"
      );

      if (shouldClearData) {
        console.log("User chose to force logout - clearing data despite error");
        clearAuthData();
        router.push("/login");
        console.log("=== LOGOUT PROCESS COMPLETED WITH FORCE CLEAR ===");
      } else {
        console.log("User chose to stay logged in - preserving session data");
        console.log("=== LOGOUT PROCESS CANCELLED BY USER ===");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // Get token from localStorage/cookies
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
        console.log("No access token found for profile fetch");
        return;
      }

      // Decode JWT to get user info (basic info from token)
      try {
        const tokenParts = accessToken.split(".");
        if (tokenParts.length < 2) {
          console.error("Invalid JWT token format");
          return;
        }
        const payload = JSON.parse(atob(tokenParts[1]!));

        // Format last login from token timestamp
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

        console.log("User profile loaded from token:", {
          name: payload.displayName,
          role: payload.roleName,
          company: payload.companyName,
        });
      } catch (decodeError) {
        console.error("Failed to decode JWT token:", decodeError);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const clearAuthData = () => {
    console.log("=== CLEARING AUTHENTICATION DATA ===");

    // Clear localStorage - all possible token keys
    const localStorageKeys = [
      "access_token",
      "accessToken",
      "refresh-token",
      "refreshToken",
      "userInfo",
      "tenantInfo",
      "user-data",
      "tenant-data",
      "token-expiry",
    ];

    localStorageKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        localStorage.removeItem(key);
        console.log(`✅ Cleared localStorage: ${key}`);
      }
    });

    // Clear cookies - all possible cookie names with proper deletion
    const cookieNames = [
      "access_token",
      "refresh-token",
      "auth-token",
      "userSession",
    ];
    // const isProduction = process.env.NODE_ENV === 'production'; // Currently unused

    console.log("Before clearing - Current cookies:", document.cookie);

    cookieNames.forEach(cookieName => {
      // Method 1: Standard cookie deletion
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

      // Method 2: Alternative deletion (different date format)
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;

      // Method 3: Set max-age to 0
      document.cookie = `${cookieName}=; max-age=0; path=/`;

      // Method 4: For cookies that might have been set with different domains
      const hostname = window.location.hostname;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`;

      // Method 5: For cookies with root domain
      if (hostname.includes(".")) {
        const rootDomain = hostname.split(".").slice(-2).join(".");
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
      }

      console.log(`🔄 Attempted to clear cookie: ${cookieName}`);
    });

    // Wait a bit and check if cookies are actually cleared
    setTimeout(() => {
      console.log("After clearing - Remaining cookies:", document.cookie);

      // If cookies still exist, try more aggressive clearing
      const remainingCookies = document.cookie;
      if (
        remainingCookies.includes("access_token") ||
        remainingCookies.includes("refresh-token")
      ) {
        console.warn(
          "⚠️ Some cookies still exist, trying aggressive clearing..."
        );

        // Extract all cookie names from current cookies
        const currentCookies = remainingCookies
          .split(";")
          .map(cookie => {
            return cookie.trim().split("=")[0];
          })
          .filter(name => name);

        currentCookies.forEach(cookieName => {
          if (
            cookieName &&
            (cookieName.includes("token") || cookieName.includes("auth"))
          ) {
            // Try all possible combinations
            const variations = [
              `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`,
              `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`,
              `${cookieName}=; max-age=0; path=/`,
              `${cookieName}=; max-age=-1; path=/`,
            ];

            variations.forEach(variation => {
              document.cookie = variation;
            });

            console.log(`🔥 Aggressively cleared: ${cookieName}`);
          }
        });

        // Final check
        setTimeout(() => {
          const finalCookies = document.cookie;
          console.log("Final cookie status:", finalCookies);

          if (finalCookies.includes("access_token")) {
            console.error(
              "❌ COOKIE CLEARING FAILED - access_token still exists!"
            );
            console.log(
              "This might be due to HttpOnly cookies that can only be cleared by server"
            );
          } else {
            console.log("✅ All authentication cookies successfully cleared!");
          }
        }, 100);
      } else {
        console.log("✅ All cookies cleared successfully!");
      }
    }, 100);

    console.log("=== AUTHENTICATION DATA CLEARED ===");
  };

  return (
    <DropdownMenu
      onOpenChange={open => {
        if (open && !userProfile) {
          fetchUserProfile();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {/* User Profile Section */}
        {userProfile && (
          <DropdownMenuLabel className="font-normal">
            <CardContent className="p-0 space-y-1">
              <CardTitle className="text-sm font-semibold">
                {userProfile.displayName}{" "}
                {userProfile.role &&
                  `(${userProfile.role} ${userProfile.accountRole || ""})`}
              </CardTitle>
              <CardContent className="text-sm text-muted-foreground p-0">
                {userProfile.email}
              </CardContent>
              <CardContent className="text-sm p-0">
                {userProfile.companyName}
              </CardContent>
              {userProfile.lastLogin && (
                <CardContent className="text-xs text-muted-foreground p-0">
                  Last Login : {userProfile.lastLogin}
                </CardContent>
              )}
            </CardContent>
          </DropdownMenuLabel>
        )}

        <DropdownMenuSeparator />

        {/* Home */}
        <DropdownMenuItem onClick={() => router.push("/")}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </DropdownMenuItem>

        {/* Dashboard */}
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>

        {/* Sales Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Sales
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem
              onClick={() => router.push("/landing/orderslanding")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/landing/quoteslanding")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Quotes
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Settings Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem onClick={() => router.push("/profilesettings")}>
              <IdCard className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/companysettings")}>
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Logout Button */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
