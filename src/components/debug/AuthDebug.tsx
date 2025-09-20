"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthStorage } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface UserData {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role?: string;
  companyName?: string;
  companyId?: number;
  picture?: string;
}

interface DebugInfo {
  contextAuthenticated: boolean;
  contextUser: User | null;
  storageToken: string | null;
  storageRefreshToken: string | null;
  storageUserData: UserData | null;
  storageIsAuthenticated: boolean;
  storageIsTokenExpired: boolean;
  allCookies: string;
  accessTokenCookie: string | undefined;
  localStorage: {
    accessToken: string | null;
    refreshToken: string | null;
    userData: string | null;
    tokenExpiry: string | null;
  };
}

export function AuthDebug() {
  const { isAuthenticated, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({} as DebugInfo);

  const checkAuthState = useCallback(() => {
    const info = {
      // Context state
      contextAuthenticated: isAuthenticated,
      contextUser: user,

      // Storage state
      storageToken: AuthStorage.getAccessToken(),
      storageRefreshToken: AuthStorage.getRefreshToken(),
      storageUserData: AuthStorage.getUserData(),
      storageIsAuthenticated: AuthStorage.isAuthenticated(),
      storageIsTokenExpired: AuthStorage.isTokenExpired(),

      // Cookies (client-side visible ones)
      allCookies: document.cookie,
      accessTokenCookie: document.cookie
        .split("; ")
        .find(row => row.startsWith("access_token="))
        ?.split("=")[1],

      // Local Storage
      localStorage: {
        accessToken: localStorage.getItem("access_token"),
        refreshToken: localStorage.getItem("refresh-token"),
        userData: localStorage.getItem("user-data"),
        tokenExpiry: localStorage.getItem("token-expiry"),
      },
    };

    setDebugInfo(info);
  }, [isAuthenticated, user]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>🐛 Auth Debug Info</CardTitle>
          <Button onClick={checkAuthState} size="sm">
            Refresh Debug Info
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Auth Status */}
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Authentication Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Context Authenticated:</strong>{" "}
                {debugInfo.contextAuthenticated ? "✅ Yes" : "❌ No"}
              </p>
              <p>
                <strong>Storage Authenticated:</strong>{" "}
                {debugInfo.storageIsAuthenticated ? "✅ Yes" : "❌ No"}
              </p>
              <p>
                <strong>Token Expired:</strong>{" "}
                {debugInfo.storageIsTokenExpired ? "❌ Yes" : "✅ No"}
              </p>
            </div>
          </div>

          {/* Tokens */}
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium mb-2">Tokens</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Access Token (Storage):</strong>{" "}
                {debugInfo.storageToken
                  ? `✅ ${debugInfo.storageToken.substring(0, 30)}...`
                  : "❌ Not found"}
              </p>
              <p>
                <strong>Access Token (Cookie):</strong>{" "}
                {debugInfo.accessTokenCookie
                  ? `✅ ${debugInfo.accessTokenCookie.substring(0, 30)}...`
                  : "❌ Not found"}
              </p>
              <p>
                <strong>Refresh Token:</strong>{" "}
                {debugInfo.storageRefreshToken
                  ? `✅ ${debugInfo.storageRefreshToken.substring(0, 30)}...`
                  : "❌ Not found"}
              </p>
            </div>
          </div>

          {/* User Data */}
          {debugInfo.contextUser && (
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-medium mb-2">User Data</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>ID:</strong> {debugInfo.contextUser.id}
                </p>
                <p>
                  <strong>Name:</strong>{" "}
                  {debugInfo.contextUser.name || "Not set"}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {debugInfo.contextUser.email || "Not set"}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  {debugInfo.contextUser.role || "Not set"}
                </p>
                <p>
                  <strong>Company:</strong>{" "}
                  {debugInfo.contextUser.companyName || "Not set"}
                </p>
                <p>
                  <strong>Company ID:</strong>{" "}
                  {debugInfo.contextUser.companyId || "Not set"}
                </p>
              </div>
            </div>
          )}

          {/* Raw Data */}
          <details className="p-4 bg-gray-50 rounded">
            <summary className="font-medium cursor-pointer">
              🔍 Raw Debug Data
            </summary>
            <pre className="mt-2 text-xs overflow-auto bg-white p-3 rounded border">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
