"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface OrderStatusStep {
  key: string;
  label: string;
  order: number;
}

export interface OrderStatusTrackerProps {
  currentStatus?: string | undefined;
  orderId?: string | undefined;
  createdDate?: string | undefined;
  className?: string | undefined;
}

// Define the order status flow
const ORDER_STATUS_STEPS: OrderStatusStep[] = [
  { key: "ORDER SENT", label: "Sent", order: 1 },
  { key: "ORDER ACKNOWLEDGED", label: "Acknowledged", order: 2 },
  { key: "REQUESTED EDIT", label: "Edit", order: 3 },
  { key: "ORDER ACCEPTED", label: "Accepted", order: 4 },
  { key: "ORDER BOOKED", label: "Booked", order: 5 },
  { key: "INVOICED", label: "Invoiced", order: 6 },
  { key: "SHIPPED", label: "Shipped", order: 7 },
];

// Map status to step order for determining progress
const STATUS_ORDER_MAP: Record<string, number> = {
  "ORDER SENT": 1,
  "ORDER RECEIVED": 1,
  "ORDER ACKNOWLEDGED": 2,
  "REQUESTED EDIT": 3,
  "EDIT IN PROGRESS": 3,
  "EDIT ENABLED": 3,
  "ORDER ACCEPTED": 4,
  "ORDER BOOKED": 5,
  "INVOICED": 6,
  "INVOICED PARTIALLY": 6,
  "SHIPPED": 7,
  "PARTIALLY SHIPPED": 7,
};

export default function OrderStatusTracker({
  currentStatus,
  orderId,
  createdDate,
  className,
}: OrderStatusTrackerProps) {
  // Get the current step order from the status
  const currentStepOrder = currentStatus
    ? STATUS_ORDER_MAP[currentStatus.toUpperCase()] || 0
    : 0;

  // Format date to match the image format (DD/MM/YYYY HH:MM AM/PM)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      
      // Get date parts
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      
      // Get time parts
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert to 12-hour format
      const hoursStr = String(hours).padStart(2, "0");
      
      return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={cn("p-4 sm:p-6", className)}>
      {/* Order ID and Date at top left */}
      {(orderId || createdDate) && (
        <div className="mb-4">
          {orderId && (
            <p className="text-sm font-semibold text-gray-900">{orderId}</p>
          )}
          {createdDate && (
            <p className="text-xs text-gray-600 mt-1">
              {formatDate(createdDate)}
            </p>
          )}
        </div>
      )}

      {/* Steps Container */}
      <div className="flex items-center gap-0">
        {ORDER_STATUS_STEPS.map((step, index) => {
          const isActive = currentStepOrder >= step.order;
          const isLast = index === ORDER_STATUS_STEPS.length - 1;

          return (
            <div
              key={step.key}
              className={cn(
                "flex-1 h-10 sm:h-11 flex items-center justify-center font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 text-gray-500",
                // First item - rounded left
                index === 0 && "rounded-l",
                // Last item - rounded right
                isLast && "rounded-r",
                // Add subtle border between items
                !isLast && "border-r border-white/20"
              )}
            >
              <span className="text-xs sm:text-sm px-1 sm:px-2 text-center">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

