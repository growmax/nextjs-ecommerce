"use client";

import React, { createContext, useContext, useState } from "react";
import { UserDetails } from "@/lib/interfaces/UserInterfaces";

interface UserSessionContextData {
  user: UserDetails | null;
  isLoading: boolean;
  error: string | null;
}

const UserSessionContext = createContext<UserSessionContextData>({
  user: null,
  isLoading: false,
  error: null,
});

export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return context;
};

export const useUserId = () => {
  const { user } = useUserSession();
  return user?.userId || null;
};

export const useUserDisplayName = () => {
  const { user } = useUserSession();
  return user?.displayName || null;
};

export const useUserRole = () => {
  const { user } = useUserSession();
  return user?.roleName || null;
};

interface UserSessionProviderProps {
  children: React.ReactNode;
  initialUserData?: UserDetails | null;
}

export function UserSessionProvider({
  children,
  initialUserData,
}: UserSessionProviderProps) {
  const [user] = useState<UserDetails | null>(() => {
    if (initialUserData) {
      return initialUserData;
    }
    return null;
  });

  const contextValue: UserSessionContextData = {
    user,
    isLoading: false, // Server-side loading is done in layout
    error: user ? null : "No user session",
  };

  return (
    <UserSessionContext.Provider value={contextValue}>
      {children}
    </UserSessionContext.Provider>
  );
}
