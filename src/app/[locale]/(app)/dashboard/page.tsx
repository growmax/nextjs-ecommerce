"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building2, Mail, Phone } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
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
      {/* Mobile-First Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile: Single column, Tablet: 2 cols, Desktop: 3 cols */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card - Mobile-First */}
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                {/* Mobile-First Avatar Sizing */}
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback className="text-sm sm:text-base lg:text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Mobile-First Profile Details */}
                <div className="w-full space-y-2 sm:space-y-3">
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                    </div>
                    <span className="break-all">{user.name || "Not set"}</span>
                  </div>

                  {user.email && (
                    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                      </div>
                      <span className="break-all">{user.email}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                      </div>
                      <span>{user.phone}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Company:</span>
                    </div>
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
              {/* Mobile-First Stats Layout */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:space-y-4">
                <div className="text-center sm:text-left">
                  <p className="text-xl font-bold sm:text-2xl">0</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Total Orders
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xl font-bold sm:text-2xl">0</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Pending Tasks
                  </p>
                </div>
                <div className="col-span-2 text-center sm:col-span-1 sm:text-left">
                  <p className="text-xl font-bold sm:text-2xl">Active</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
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
              {/* Mobile-First Activity List */}
              <div className="space-y-2 sm:space-y-3">
                <div className="rounded-lg bg-muted/30 p-3 text-sm">
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

        {/* Mobile-First Main Welcome Card */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Welcome to Your Dashboard
            </CardTitle>
            <CardDescription className="text-sm">
              Manage your account and access all features from here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground sm:text-base">
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
