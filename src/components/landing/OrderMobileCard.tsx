"use client";

import { Card } from "@/components/ui/card";
import PricingFormat from "@/components/PricingFormat";
import { statusColor } from "@/components/custom/statuscolors";
import type { Order } from "@/types/dashboard/DasbordOrderstable/DashboardOrdersTable";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";

interface OrderMobileCardProps {
  order: Order;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export function OrderMobileCard({
  order,
  onClick,
  className,
  loading
}: OrderMobileCardProps) {
  const status = order.updatedBuyerStatus || "";
  const statusColorValue = statusColor(status.toUpperCase());

  // Format date and time
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy hh:mm a");
    } catch {
      return dateString;
    }
  };

  // Format status text (title case)
  const formatStatus = (statusText: string): string => {
    return statusText
      .split(" ")
      .map(
        word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  // Format item count
  const formatItemCount = (count: number | undefined): string => {
    if (!count || count === 0) return "0 Items";
    return count === 1 ? "1 Item" : `${count} Items`;
  };

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-shadow hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="px-4 py-0.5">
        {/* Header: Order Name + Status Badge */}
        <div className="flex items-start justify-between">
          {loading ? (
            <Skeleton className="w-full h-4" />
          ) : (
            <>
              <h3 className="text-base font-semibold text-foreground flex-1 pr-2 line-clamp-2">
                {order.orderName || "-"}
              </h3>

              <span
                className="px-2 py-1 rounded-full text-xs font-medium text-primary-foreground whitespace-nowrap border border-border/30 flex-shrink-0"
                style={{ backgroundColor: statusColorValue }}
              >
                {formatStatus(status)}
              </span>
            </>
          )}
        </div>

        {/* Order ID */}
        <div>
          {loading ? (
            <Skeleton className="w-full h-4" />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {order.orderIdentifier || "-"}
              </p>
            </>
          )}
        </div>

        {/* Date and Time */}
        <div className="mb-2">
          {loading ? (<Skeleton className="w-full h-4" />) : (<>
            <p className="text-xs text-muted-foreground">
              {formatDate(order.lastUpdatedDate || order.createdDate)}
            </p>
          </>)}
        </div>

        {/* Amount */}
        <div className="flex gap-2">
          {loading ? (<Skeleton className="w-full h-4" />) : (<>
            <p className="text-base font-medium text-foreground">
              <PricingFormat
                {...(order.currencySymbol && {
                  buyerCurrency: order.currencySymbol,
                })}
                value={order.grandTotal || 0}
              />
            </p>
            <p className="text-sm text-muted-foreground">
              {formatItemCount(order.itemcount)}
            </p>
          </>)}
        </div>
        <div>
          {!loading && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {order.sellerCompanyName && `sold by : ${order.sellerCompanyName}`}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

