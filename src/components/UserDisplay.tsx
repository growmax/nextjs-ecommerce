"use client";

import { useUserSession } from "@/contexts/UserSessionContext";
import { Card, CardContent } from "@/components/ui/card";

export function UserDisplay() {
  const { user, isLoading, error } = useUserSession();

  if (isLoading)
    return <div className="text-sm text-gray-500">Loading user...</div>;
  if (error)
    return <div className="text-sm text-red-500">User Error: {error}</div>;
  if (!user) return <div className="text-sm text-yellow-500">No user data</div>;

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-3">
        <div className="text-sm font-semibold text-blue-800">
          👤 User: {user.displayName} | ID: {user.userId} | Role:{" "}
          {user.roleName}
        </div>
      </CardContent>
    </Card>
  );
}
