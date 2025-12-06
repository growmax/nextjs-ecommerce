"use client";

import PricingFormat from "@/components/PricingFormat";
import SectionCardDetail, {
  InfoRow,
  SkeletonRow,
} from "@/components/custom/SectionCardDetail";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
    <SectionCardDetail
      title={t("priceDetails")}
      headerColor="muted"
      shadow="sm"
      contentClassName="px-6 space-y-3 pt-2"
    >
      {/* Total Items */}
      {isPricingLoading ? (
        <SkeletonRow />
      ) : (
        <InfoRow
          label={t("totalItems")}
          value={String(cartValue?.totalItems || 0)}
        />
      )}

      {/* Total LP (List Price) - Optional */}
      {showListPrice &&
        (isPricingLoading ? (
          <SkeletonRow />
        ) : (
          <InfoRow
            label={t("totalLP")}
            value={
              <PricingFormat
                {...(currency && { buyerCurrency: currency })}
                value={cartValue?.totalLP || 0}
              />
            }
          />
        ))}

      {/* Discount - Optional */}
      {showDiscount &&
        (isPricingLoading ? (
          <SkeletonRow />
        ) : (
          <div className="grid grid-cols-2 gap-4 py-1.5">
            <div>
              <p className="text-sm font-normal text-green-600">
                {t("discount")}
              </p>
            </div>
            <div>
              <span className="text-sm font-semibold text-green-600">
                -
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={DISCOUNT}
                />
              </span>
            </div>
          </div>
        ))}

      {/* Subtotal */}
      {isPricingLoading ? (
        <SkeletonRow />
      ) : (
        <InfoRow
          label={t("subtotal")}
          value={
            <PricingFormat
              {...(currency && { buyerCurrency: currency })}
              value={cartValue?.totalValue || 0}
            />
          }
        />
      )}

      {/* Tax */}
      {isPricingLoading ? (
        <SkeletonRow />
      ) : (
        <InfoRow
          label={t("tax")}
          value={
            <PricingFormat
              {...(currency && { buyerCurrency: currency })}
              value={cartValue?.totalTax || 0}
            />
          }
        />
      )}

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
    </SectionCardDetail>
  );
}
