import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface SellerPricing {
  totalItems?: number;
  totalLP?: number;
  totalBasicDiscount?: number;
  totalValue?: number;
  totalTax?: number;
  grandTotal?: number;
  hideListPricePublic?: boolean;
  [key: string]: unknown;
}

interface PriceDetailsProps {
  cartValue: SellerPricing;
  currencyCode?: string;
  currencySymbol?: string;
  isPricingLoading?: boolean;
}

export default function PriceDetails({
  cartValue,
  currencyCode = "INR",
  currencySymbol = "₹",
  isPricingLoading = false,
}: PriceDetailsProps) {
  const formatCurrency = (value: number) => {
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  // Calculate discount (following reference logic)
  const DISCOUNT =
    typeof cartValue?.totalBasicDiscount === "number"
      ? cartValue.totalBasicDiscount
      : (cartValue?.totalLP || 0) - (cartValue?.totalValue || 0);

  const showListPrice =
    !cartValue?.hideListPricePublic && (cartValue?.totalLP || 0) > 0;
  const showDiscount = showListPrice && DISCOUNT > 0;

  return (
    <Card className="shadow-lg bg-white">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold">Price Details</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Total Items */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 font-normal">Total Items</span>
          {isPricingLoading ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <span className="text-sm font-normal">
              {cartValue?.totalItems || 0}
            </span>
          )}
        </div>

        {/* Total LP (List Price) - Optional */}
        {showListPrice && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total LP</span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm font-medium">
                {formatCurrency(cartValue?.totalLP || 0)}
              </span>
            )}
          </div>
        )}

        {/* Discount - Optional */}
        {showDiscount && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">Discount</span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm font-medium text-green-600">
                -{formatCurrency(DISCOUNT)}
              </span>
            )}
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-black">Subtotal</span>
          {isPricingLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <span className="text-sm font-semibold text-black">
              {currencyCode} {formatCurrency(cartValue?.totalValue || 0)}
            </span>
          )}
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tax</span>
          {isPricingLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <span className="text-sm font-medium text-gray-600">
              {currencyCode} {formatCurrency(cartValue?.totalTax || 0)}
            </span>
          )}
        </div>

        <Separator className="my-2" />

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-base font-bold text-black">Total</span>
          {isPricingLoading ? (
            <Skeleton className="h-5 w-28" />
          ) : (
            <span className="text-base font-bold text-black">
              {currencyCode} {formatCurrency(cartValue?.grandTotal || 0)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
