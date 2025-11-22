"use client";

import PricingFormat from "@/components/PricingFormat";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Subtitle, TypographyMuted } from "@/components/ui/typography";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTranslations } from "next-intl";

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
  currencyCode: _currencyCode = "INR",
  currencySymbol: _currencySymbol = "₹",
  isPricingLoading = false,
}: PriceDetailsProps) {
  const { user } = useCurrentUser();
  const currency = user?.currency;
  const t = useTranslations("cart");

  // Calculate discount (following reference logic)
  const DISCOUNT =
    typeof cartValue?.totalBasicDiscount === "number"
      ? cartValue.totalBasicDiscount
      : (cartValue?.totalLP || 0) - (cartValue?.totalValue || 0);

  const showListPrice =
    !cartValue?.hideListPricePublic && (cartValue?.totalLP || 0) > 0;
  const showDiscount = showListPrice && DISCOUNT > 0;

  return (
    <Card className="shadow-lg bg-white gap-2">
      <CardHeader>
        <Subtitle>{t("priceDetails")}</Subtitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Total Items */}
        <div className="flex justify-between items-center">
          <TypographyMuted>{t("totalItems")}</TypographyMuted>
          {isPricingLoading ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <TypographyMuted>{cartValue?.totalItems || 0}</TypographyMuted>
          )}
        </div>

        {/* Total LP (List Price) - Optional */}
        {showListPrice && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("totalLP")}</span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm font-medium">
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={cartValue?.totalLP || 0}
                />
              </span>
            )}
          </div>
        )}

        {/* Discount - Optional */}
        {showDiscount && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">{t("discount")}</span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm font-medium text-green-600">
                -
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={DISCOUNT}
                />
              </span>
            )}
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-black">
            {t("subtotal")}
          </span>
          {isPricingLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <span className="text-sm font-semibold text-black">
              <PricingFormat
                {...(currency && { buyerCurrency: currency })}
                value={cartValue?.totalValue || 0}
              />
            </span>
          )}
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center">
          <TypographyMuted>{t("tax")}</TypographyMuted>

          {isPricingLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <TypographyMuted>
              <PricingFormat
                {...(currency && { buyerCurrency: currency })}
                value={cartValue?.totalTax || 0}
              />
            </TypographyMuted>
          )}
        </div>

        <Separator className="my-2" />

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-base font-bold text-black">{t("total")}</span>
          {isPricingLoading ? (
            <Skeleton className="h-5 w-28" />
          ) : (
            <span className="text-base font-bold text-black">
              <PricingFormat
                {...(currency && { buyerCurrency: currency })}
                value={cartValue?.grandTotal || 0}
              />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
