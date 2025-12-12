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
import { zoneDateTimeCalculator } from "@/utils/date-format/date-format";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import PricingFormat from "../PricingFormat";
import { Skeleton } from "../ui/skeleton";

export interface OrderStatusStep {
  key: string;
  label: string;
  order: number;
}

interface OrderStatusStepConfig {
  key: string;
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
  loading?:boolean;
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

// Define the order status flow - labels will be translated in the component
const ORDER_STATUS_STEPS: OrderStatusStepConfig[] = [
  { key: "ORDER SENT", order: 1 },
  { key: "ORDER ACKNOWLEDGED", order: 2 },
  { key: "REQUESTED EDIT", order: 3 },
  { key: "ORDER ACCEPTED", order: 4 },
  { key: "ORDER BOOKED", order: 5 },
  { key: "INVOICED", order: 6 },
  { key: "SHIPPED", order: 7 },
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
  loading,
}: OrderStatusTrackerProps) {
  const t = useTranslations("components");

  // Get translated status labels
  const getStatusLabel = (key: string): string => {
    switch (key) {
      case "ORDER SENT":
        return t("statusSent");
      case "ORDER ACKNOWLEDGED":
        return t("statusAcknowledged");
      case "REQUESTED EDIT":
        return t("statusEdit");
      case "ORDER ACCEPTED":
        return t("statusAccepted");
      case "ORDER BOOKED":
        return t("statusBooked");
      case "INVOICED":
        return t("statusInvoiced");
      case "SHIPPED":
        return t("statusShipped");
      default:
        return key;
    }
  };

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
    <Card className={cn("p-3 sm:p-4", className)}>
      {/* Order ID and Date at top left, Financial Summary at top right */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
        {loading ? (
          <div className="flex-shrink-0">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
        ) :(orderId || createdDate) && (
          <div className="flex-shrink-0">
            {orderId && (
              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                {orderId}
              </p>
            )}
            {createdDate && (
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
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
        {loading ? (
          <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs">
            <div className="flex flex-col min-w-[70px]">
              <Skeleton className="h-3 w-10 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex flex-col min-w-[70px]">
              <Skeleton className="h-3 w-10 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex flex-col min-w-[70px]">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex flex-col min-w-[90px]">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : (total !== undefined || paid !== undefined || toPay !== undefined) && (
          <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs">
            {total !== undefined && (
              <div className="flex flex-col min-w-[70px]">
                <span className="text-gray-600 font-medium">{t("total")}</span>
                <span className="text-gray-900 font-semibold">
                  <PricingFormat value={total} />
                </span>
              </div>
            )}
            {paid !== undefined && (
              <div className="flex flex-col min-w-[70px]">
                <span className="text-gray-600 font-medium inline-flex items-center gap-1">
                  {t("paid")}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Info
                        className="h-3 w-3 text-gray-400 cursor-pointer"
                        aria-hidden="true"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] sm:w-[360px] p-3">
                      <div className="text-sm font-semibold mb-2">
                        {t("paymentDetails")}
                      </div>
                      {Array.isArray(paymentHistory) &&
                      paymentHistory.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-auto pr-1">
                          {paymentHistory.map(
                            (p: PaymentHistoryItem, idx: number) => (
                              <div
                                key={`payment-${p.referenceNumber || p.paymentDate || idx}`}
                                className="grid grid-cols-[100px_1fr] gap-x-2 text-xs"
                              >
                                <div className="text-gray-600">
                                  {t("amount")}
                                </div>
                                <div className="text-gray-900 font-medium">
                                  <PricingFormat
                                    value={p.amountReceived || 0}
                                  />
                                </div>
    
                                <div className="text-gray-600">
                                  {t("gateway")}
                                </div>
                                <div className="text-gray-900">
                                  {p.gatewayName || "-"}
                                </div>
    
                                <div className="text-gray-600">
                                  {t("method")}
                                </div>
                                <div className="text-gray-900">
                                  {p.paymentMode || "-"}
                                </div>
    
                                <div className="text-gray-600">{t("date")}</div>
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
                                  {t("referenceId")}
                                </div>
                                <div className="text-gray-900 break-all">
                                  {p.referenceNumber || "-"}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600">
                          {t("noPaymentsYet")}
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
              <div className="flex flex-col min-w-[70px]">
                <span className="text-gray-600 font-medium">
                  {t("toPay")}
                </span>
                <span className="text-red-600 font-semibold">
                  <PricingFormat value={computedToPay || 0} />
                </span>
              </div>
            )}
            <div className="flex flex-col min-w-[90px]">
              <span className="text-gray-600 font-medium whitespace-nowrap">
                {t("lastDate")}
              </span>
              <span className="text-red-600 font-semibold text-[10px] sm:text-xs">
                {lastDateToPay ? (
                  // Check if string is already formatted
                  lastDateToPay.startsWith("Overdue") || lastDateToPay.startsWith("-") ? (
                    lastDateToPay
                  ) : (
                    zoneDateTimeCalculator(
                      lastDateToPay,
                      preferences.timeZone,
                      preferences.dateFormat,
                      preferences.timeFormat,
                      false
                    ) || t("noDue")
                  )
                ) : (
                  t("noDue")
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Steps Container */}
      <div className="hidden sm:flex items-center gap-0 overflow-hidden rounded-lg shadow-sm">
        {loading ? (
          <>
            {Array.from({ length: ORDER_STATUS_STEPS.length }).map((_, index) => (
              <div
                key={`skeleton-step-${index}`}
                className={cn(
                  "flex-1 h-7 sm:h-8 flex items-center justify-center bg-gray-100",
                  index === 0 && "rounded-l-lg",
                  index === ORDER_STATUS_STEPS.length - 1 && "rounded-r-lg",
                  index < ORDER_STATUS_STEPS.length - 1 && "border-r border-gray-300/50"
                )}
              >
                <Skeleton className="h-3 w-12 sm:w-16" />
              </div>
            ))}
          </>
        ) : (
          ORDER_STATUS_STEPS.map((step, index) => {
            const isActive = currentStepOrder >= step.order;
            const isLast = index === ORDER_STATUS_STEPS.length - 1;
            const label = getStatusLabel(step.key);

            return (
              <HoverCard key={step.key}>
                <HoverCardTrigger asChild>
                  <div
                    className={cn(
                      "flex-1 h-7 sm:h-8 flex items-center justify-center font-medium transition-all duration-300 ease-in-out relative cursor-pointer group",
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
                    <span className="text-[10px] sm:text-xs px-1 sm:px-2 text-center font-semibold tracking-wide transition-all duration-300 ease-in-out group-hover:scale-105">
                      {label}
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
                  <div className="text-sm font-medium text-center">{label}</div>
                </HoverCardContent>
              </HoverCard>
            );
          })
        )}
      </div>
    </Card>
  );
}
