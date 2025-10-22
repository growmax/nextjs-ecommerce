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
  // Financial data
  total?: number;
  paid?: number;
  toPay?: number;
  lastDateToPay?: string;
  currencySymbol?: string;
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
  INVOICED: 6,
  "INVOICED PARTIALLY": 6,
  SHIPPED: 7,
  "PARTIALLY SHIPPED": 7,
};

export default function OrderStatusTracker({
  currentStatus,
  orderId,
  createdDate,
  className,
  total,
  paid,
  toPay,
  lastDateToPay,
  currencySymbol = "INR ₹",
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

  // Format currency value
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "0.00";
    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format due date
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return "No due";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "No due";
    }
  };

  return (
    <Card className={cn("p-4 sm:p-6", className)}>
      {/* Order ID and Date at top left, Financial Summary at top right */}
      <div className="flex justify-between items-start mb-4">
        {(orderId || createdDate) && (
          <div>
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

        {/* Financial Summary - Right side */}
        {(total !== undefined || paid !== undefined || toPay !== undefined) && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 text-xs sm:text-sm">
            {total !== undefined && (
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">TOTAL:</span>
                <span className="text-gray-900 font-semibold">
                  {currencySymbol} {formatCurrency(total)}
                </span>
              </div>
            )}
            {paid !== undefined && (
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">PAID:</span>
                <span className="text-gray-900 font-semibold">
                  {currencySymbol} {formatCurrency(paid)}
                </span>
              </div>
            )}
            {toPay !== undefined && (
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">TO PAY:</span>
                <span className="text-red-600 font-semibold">
                  {currencySymbol} {formatCurrency(toPay)}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">
                LAST DATE TO PAY:
              </span>
              <span className="text-red-600 font-semibold">
                {formatDueDate(lastDateToPay)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Steps Container */}
      <div className="flex items-center gap-0 overflow-hidden rounded-lg shadow-sm">
        {ORDER_STATUS_STEPS.map((step, index) => {
          const isActive = currentStepOrder >= step.order;
          const isLast = index === ORDER_STATUS_STEPS.length - 1;

          return (
            <div
              key={step.key}
              className={cn(
                "flex-1 h-8 sm:h-7 flex items-center justify-center font-medium transition-all duration-300 ease-in-out relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                // First item - rounded left
                index === 0 && "rounded-l-lg",
                // Last item - rounded right
                isLast && "rounded-r-lg",
                // Add subtle border between items
                !isLast && "border-r border-gray-300/50"
              )}
            >
              <span className="text-xs sm:text-sm px-2 sm:px-3 text-center font-semibold tracking-wide">
                {step.label}
              </span>
              {/* Add a subtle inner shadow for depth */}
              {isActive && (
                <div className="absolute inset-0 rounded-inherit bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
