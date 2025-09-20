"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  CreditCard,
  User,
  Settings,
  Clock,
  MoreHorizontal,
} from "lucide-react";

// Sample notification data
const notifications = [
  {
    id: 1,
    title: "Order Shipped",
    message:
      "Your order #12345 has been shipped and will arrive in 2-3 business days.",
    type: "success",
    time: "2 hours ago",
    read: false,
    icon: Package,
  },
  {
    id: 2,
    title: "Payment Processed",
    message: "Your payment of $299.99 has been successfully processed.",
    type: "info",
    time: "4 hours ago",
    read: false,
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Profile Updated",
    message: "Your profile information has been successfully updated.",
    type: "success",
    time: "1 day ago",
    read: true,
    icon: User,
  },
  {
    id: 4,
    title: "Security Alert",
    message:
      "New login detected from Chrome on Windows. If this wasn't you, please secure your account.",
    type: "warning",
    time: "2 days ago",
    read: true,
    icon: AlertCircle,
  },
  {
    id: 5,
    title: "System Maintenance",
    message:
      "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.",
    type: "info",
    time: "3 days ago",
    read: true,
    icon: Settings,
  },
  {
    id: 6,
    title: "Welcome!",
    message:
      "Welcome to our platform! Get started by exploring your dashboard and setting up your preferences.",
    type: "info",
    time: "1 week ago",
    read: true,
    icon: Info,
  },
];

const getTypeVariant = (type: string) => {
  switch (type) {
    case "success":
      return "secondary";
    case "warning":
      return "destructive";
    case "info":
      return "outline";
    default:
      return "secondary";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "success":
      return "text-green-600";
    case "warning":
      return "text-orange-600";
    case "info":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

export default function NotificationPage() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Notifications</span>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] overflow-y-auto">
              <div className="space-y-0">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`p-6 transition-colors hover:bg-muted/50 ${
                        !notification.read
                          ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div
                          className={`p-2 rounded-full bg-muted ${getTypeColor(notification.type)}`}
                        >
                          <notification.icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`font-semibold ${
                                !notification.read
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={getTypeVariant(notification.type)}
                                className="text-xs"
                              >
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {notification.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State (hidden when there are notifications) */}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You&apos;re all caught up! We&apos;ll notify you when
                there&apos;s something new to see.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
