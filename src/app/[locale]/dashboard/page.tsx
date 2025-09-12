"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Building2, Mail, Phone } from "lucide-react";
import { TenantInfo } from "@/components/TenantInfo";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user after mounting, show loading (middleware will redirect)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome back, {user.name || user.email}!
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tenant Information - For Testing */}
        <div className="mb-6">
          <TenantInfo />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="w-full space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{user.name || "Not set"}</span>
                  </div>

                  {user.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{user.email}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{user.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Company:</span>
                    <span>{user.companyName || "Not set"}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {user.role?.toUpperCase() || "USER"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">Active</p>
                  <p className="text-sm text-muted-foreground">
                    Account Status
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Logged in successfully</p>
                  <p className="text-xs text-muted-foreground">Just now</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  No other recent activity
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Welcome to Your Dashboard</CardTitle>
            <CardDescription>
              Manage your account and access all features from here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is your personal dashboard where you can view your profile
              information, track your activities, and manage your account
              settings. Use the navigation menu to explore different sections of
              the application.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
