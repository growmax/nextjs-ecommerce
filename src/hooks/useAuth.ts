"use client";

import { AuthStorage } from "@/lib/auth";
import { JWTPayload } from "@/lib/interfaces/UserInterfaces";
import { JWTService } from "@/lib/services/JWTService";
import { useEffect, useState } from "react";

interface DecodedAuthData {
  userId: number | null;
  companyId: number | null;
  displayName: string | null;
  email: string | null;
  tenantId: string | null;
  roleId: number | null;
  roleName: string | null;
  sub: string | null;
  exp: number | null;
  iat: number | null;
  isAuthenticated: boolean;
  isTokenExpired: boolean;
  token: string | null;
}

export function useAuth() {
  const [authData, setAuthData] = useState<DecodedAuthData>({
    userId: null,
    companyId: null,
    displayName: null,
    email: null,
    tenantId: null,
    roleId: null,
    roleName: null,
    sub: null,
    exp: null,
    iat: null,
    isAuthenticated: false,
    isTokenExpired: true,
    token: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decodeAndSetAuthData = () => {
      try {
        // Get access token
        const token = AuthStorage.getAccessToken();

        if (!token) {
          setAuthData({
            userId: null,
            companyId: null,
            displayName: null,
            email: null,
            tenantId: null,
            roleId: null,
            roleName: null,
            sub: null,
            exp: null,
            iat: null,
            isAuthenticated: false,
            isTokenExpired: true,
            token: null,
          });
          setLoading(false);
          return;
        }

        // Decode JWT token
        const jwtService = JWTService.getInstance();
        const payload: JWTPayload | null = jwtService.decodeToken(token);

        if (!payload) {
          setAuthData({
            userId: null,
            companyId: null,
            displayName: null,
            email: null,
            tenantId: null,
            roleId: null,
            roleName: null,
            sub: null,
            exp: null,
            iat: null,
            isAuthenticated: false,
            isTokenExpired: true,
            token: null,
          });
          setLoading(false);
          return;
        }

        // Check if token is expired
        const isExpired = jwtService.isTokenExpired(token);

        // Set decoded auth data
        setAuthData({
          userId: payload.userId || null,
          companyId: payload.companyId || null,
          displayName: payload.displayName || null,
          email: payload.email || null,
          tenantId: payload.tenantId || null,
          roleId: payload.roleId || null,
          roleName: payload.roleName || null,
          sub: payload.sub || null,
          exp: payload.exp || null,
          iat: payload.iat || null,
          isAuthenticated: !isExpired,
          isTokenExpired: isExpired,
          token,
        });
      } catch (_error) {
        setAuthData({
          userId: null,
          companyId: null,
          displayName: null,
          email: null,
          tenantId: null,
          roleId: null,
          roleName: null,
          sub: null,
          exp: null,
          iat: null,
          isAuthenticated: false,
          isTokenExpired: true,
          token: null,
        });
      } finally {
        setLoading(false);
      }
    };

    decodeAndSetAuthData();

    // Optional: Listen for storage changes (if token is updated in another tab)
    const handleStorageChange = () => {
      decodeAndSetAuthData();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Refresh auth data manually
  const refreshAuthData = () => {
    const token = AuthStorage.getAccessToken();

    if (!token) {
      setAuthData({
        userId: null,
        companyId: null,
        displayName: null,
        email: null,
        tenantId: null,
        roleId: null,
        roleName: null,
        sub: null,
        exp: null,
        iat: null,
        isAuthenticated: false,
        isTokenExpired: true,
        token: null,
      });
      return;
    }

    const jwtService = JWTService.getInstance();
    const payload = jwtService.decodeToken(token);

    if (payload) {
      const isExpired = jwtService.isTokenExpired(token);
      setAuthData({
        userId: payload.userId || null,
        companyId: payload.companyId || null,
        displayName: payload.displayName || null,
        email: payload.email || null,
        tenantId: payload.tenantId || null,
        roleId: payload.roleId || null,
        roleName: payload.roleName || null,
        sub: payload.sub || null,
        exp: payload.exp || null,
        iat: payload.iat || null,
        isAuthenticated: !isExpired,
        isTokenExpired: isExpired,
        token,
      });
    }
  };

  return {
    ...authData,
    loading,
    refreshAuthData,
  };
}
