"use client";

import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zoneDateTimeCalculator } from "@/utils/date-format";
import { Info } from "lucide-react";
import PricingFormat from "../PricingFormat";

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
  paymentHistory?: PaymentHistoryItem[];
}

type PaymentHistoryItem = {
  amountReceived: number;
  gatewayName?: string | null;
  invoiceIdentifier?: string | null;
  orderIdentifier?: string | null;
  paymentDate?: string | null;
  paymentMode?: string | null;
  referenceNumber?: string | null;
};

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
  currencySymbol: _currencySymbol = "INR ₹",
  paymentHistory,
}: OrderStatusTrackerProps) {
  // Get the current step order from the status
  const currentStepOrder = currentStatus
    ? STATUS_ORDER_MAP[currentStatus.toUpperCase()] || 0
    : 0;

  // Compute toPay dynamically when total and paid are provided
  const computedToPay =
    total !== undefined && paid !== undefined
      ? Math.max((total || 0) - (paid || 0), 0)
      : toPay;

  // Get user preferences for date/time formatting
  const getUserPreferences = () => {
    try {
      const savedPrefs = localStorage.getItem("userPreferences");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        return {
          timeZone: prefs.timeZone || "Asia/Kolkata",
          dateFormat: prefs.dateFormat || "dd/MM/yyyy",
          timeFormat: prefs.timeFormat || "hh:mm a",
        };
      }
    } catch {
      // Fallback to defaults
    }
    return {
      timeZone: "Asia/Kolkata",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "hh:mm a",
    };
  };

  const preferences = getUserPreferences();

  return (
    <Card className={cn("p-4 sm:p-6 mt-[50px]", className)}>
      {/* Order ID and Date at top left, Financial Summary at top right */}
      <div className="flex justify-between items-start mb-4">
        {(orderId || createdDate) && (
          <div className="mt-15 sm:mt-0">
            {orderId && (
              <p className="text-sm font-semibold text-gray-900">{orderId}</p>
            )}
            {createdDate && (
              <p className="text-xs text-gray-600 mt-1">
                {zoneDateTimeCalculator(
                  createdDate,
                  preferences.timeZone,
                  preferences.dateFormat,
                  preferences.timeFormat,
                  true
                ) || ""}
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
                  <PricingFormat value={total} />
                </span>
              </div>
            )}
            {paid !== undefined && (
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium inline-flex items-center gap-1">
                  PAID:
                  <Popover>
                    <PopoverTrigger asChild>
                      <Info
                        className="h-3.5 w-3.5 text-gray-400 cursor-pointer"
                        aria-hidden="true"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px] p-4">
                      <div className="text-base font-semibold mb-2">
                        Payment Details
                      </div>
                      {Array.isArray(paymentHistory) &&
                      paymentHistory.length > 0 ? (
                        <div className="space-y-3 max-h-56 overflow-auto pr-1">
                          {paymentHistory.map(
                            (p: PaymentHistoryItem, idx: number) => (
                              <div
                                key={idx}
                                className="grid grid-cols-[140px_1fr] gap-x-3 text-sm"
                              >
                                <div className="text-gray-600">Amount:</div>
                                <div className="text-gray-900 font-medium">
                                  <PricingFormat
                                    value={p.amountReceived || 0}
                                  />
                                </div>

                                <div className="text-gray-600">Gateway:</div>
                                <div className="text-gray-900">
                                  {p.gatewayName || "-"}
                                </div>

                                <div className="text-gray-600">Method:</div>
                                <div className="text-gray-900">
                                  {p.paymentMode || "-"}
                                </div>

                                <div className="text-gray-600">Date:</div>
                                <div className="text-gray-900">
                                  {p.paymentDate
                                    ? zoneDateTimeCalculator(
                                        p.paymentDate,
                                        preferences.timeZone,
                                        preferences.dateFormat,
                                        preferences.timeFormat,
                                        true
                                      ) || "-"
                                    : "-"}
                                </div>

                                <div className="text-gray-600">
                                  Reference Id:
                                </div>
                                <div className="text-gray-900 break-all">
                                  {p.referenceNumber || "-"}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          No payments yet
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </span>
                <span className="text-gray-900 font-semibold">
                  <PricingFormat value={paid} />
                </span>
              </div>
            )}
            {computedToPay !== undefined && (
              <div className="flex flex-col">
                <span className="text-gray-600 font-medium">TO PAY:</span>
                <span className="text-red-600 font-semibold">
                  <PricingFormat value={computedToPay || 0} />
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">
                LAST DATE TO PAY:
              </span>
              <span className="text-red-600 font-semibold">
                {lastDateToPay
                  ? // Check if the string is already formatted (contains "Overdue" or starts with "-")
                    lastDateToPay.startsWith("Overdue") ||
                    lastDateToPay.startsWith("-")
                    ? lastDateToPay
                    : zoneDateTimeCalculator(
                        lastDateToPay,
                        preferences.timeZone,
                        preferences.dateFormat,
                        preferences.timeFormat,
                        false
                      ) || "No due"
                  : "No due"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Steps Container */}
      <div className="hidden sm:flex items-center gap-0 overflow-hidden rounded-lg shadow-sm">
        {ORDER_STATUS_STEPS.map((step, index) => {
          const isActive = currentStepOrder >= step.order;
          const isLast = index === ORDER_STATUS_STEPS.length - 1;

          return (
            <HoverCard key={step.key}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    "flex-1 h-8 sm:h-7 flex items-center justify-center font-medium transition-all duration-300 ease-in-out relative cursor-pointer group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm hover:scale-[1.02] hover:text-gray-800",
                    // First item - rounded left
                    index === 0 && "rounded-l-lg",
                    // Last item - rounded right
                    isLast && "rounded-r-lg",
                    // Add subtle border between items
                    !isLast && "border-r border-gray-300/50"
                  )}
                >
                  <span className="text-xs sm:text-sm px-2 sm:px-3 text-center font-semibold tracking-wide transition-all duration-300 ease-in-out group-hover:scale-105">
                    {step.label}
                  </span>
                  {/* Add a subtle inner shadow for depth */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-inherit bg-linear-to-b from-white/10 to-transparent pointer-events-none group-hover:from-white/20" />
                  )}
                  {/* Add hover effect for inactive states */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-inherit bg-linear-to-b from-white/0 to-white/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-2">
                <div className="text-sm font-medium text-center">
                  {step.label}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    </Card>
  );
}
