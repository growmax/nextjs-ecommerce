"use client";

import PricingFormat from "@/components/PricingFormat";
import { statusColor } from "@/components/custom/statuscolors";
import { Card } from "@/components/ui/card";
import type { QuoteItem } from "@/lib/api/services/QuotesService/QuotesService";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface QuoteMobileCardProps {
  quote: QuoteItem;
  onClick?: () => void;
  className?: string;
}

export function QuoteMobileCard({
  quote,
  onClick,
  className,
}: QuoteMobileCardProps) {
  const status = quote.updatedBuyerStatus || "";
  const statusColorValue = statusColor(status.toUpperCase());

  // Format date and time
  const formatDate = (dateString: string | undefined): string => {
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
        {/* Header: Quote Name + Status Badge */}
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-foreground flex-1 pr-2 line-clamp-2">
            {quote.quoteName || "-"}
          </h3>
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-primary-foreground whitespace-nowrap border border-border/30 flex-shrink-0"
            style={{ backgroundColor: statusColorValue }}
          >
            {formatStatus(status)}
          </span>
        </div>

        {/* Quote ID */}
        <div>
          <p className="text-sm text-muted-foreground">
            {quote.quotationIdentifier || "-"}
          </p>
        </div>

        {/* Date and Time */}
        <div className="mb-2">
          <p className="text-xs text-muted-foreground">
            {formatDate(quote.lastUpdatedDate || quote.createdDate)}
          </p>
        </div>

        {/* Amount */}
        <div className= "flex gap-2">
          <p className="text-base font-medium text-foreground">
            <PricingFormat
              {...(quote.curencySymbol && {
                buyerCurrency: quote.curencySymbol,
              })}
              value={quote.grandTotal || quote.calculatedTotal || 0}
            />
          </p>
          <p className="text-sm text-muted-foreground">
              {formatItemCount(quote.itemCount)}
            </p>
        </div>
        <div>
        <p className="text-sm text-muted-foreground line-clamp-1">
              {quote.sellerCompanyName && `sold by : ${quote.sellerCompanyName}`}
            </p>
        </div>
        {/* Divider */}
       
      </div>
    </Card>
  );
}

