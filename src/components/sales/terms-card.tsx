"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

interface OrderTerms {
  paymentTerms?: string;
  paymentTermsCode?: string;
  deliveryTerms?: string;
  deliveryTermsCode?: string;
  deliveryTermsCode2?: string;
  freight?: string;
  freightCode?: string;
  freightValue?: number;
  freightPercentage?: number;
  frByPercentage?: boolean;
  frHeader?: boolean;
  insurance?: string;
  insuranceCode?: string;
  insuranceValue?: number;
  insurancePercentage?: number;
  insByPercentage?: boolean;
  insHeader?: boolean;
  packageForwarding?: string;
  packageForwardingCode?: string;
  pfValue?: number;
  pfPercentage?: number;
  pfByPercentage?: boolean;
  pfHeader?: boolean;
  warranty?: string;
  warrantyCode?: string;
  warrantyValue?: number;
  dispatchInstructions?: string;
  dispatchInstructionsCode?: string;
  cashdiscount?: boolean;
  cashdiscountValue?: number;
  beforeTax?: boolean;
  beforeTaxPercentage?: number;
  payOnDelivery?: boolean;
  bnplEnabled?: boolean;
  additionalTerms?: string;
  loading?: boolean;
}

interface OrderTermsCardProps {
  orderTerms?: OrderTerms;
}

const TermRow = ({
  label,
  value,
  showEmpty = false,
}: {
  label: string;
  value?: string | undefined;
  showEmpty?: boolean;
}) => {
  if (!value && !showEmpty) return null;

  return (
    <div className="grid grid-cols-2 gap-4 py-1.5">
      <p className="text-sm font-normal text-gray-900">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || "-"}</p>
    </div>
  );
};

// 👉 Skeleton Row Component
const SkeletonRow = () => (
  <div className="grid grid-cols-2 gap-4 py-1.5">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-48" />
  </div>
);

export default function OrderTermsCard({ orderTerms }: OrderTermsCardProps) {
  const t = useTranslations("components");

  if (!orderTerms) return null;

  const isLoading = orderTerms.loading;

  return (
    <Card className="shadow-sm pb-0 py-0 gap-0">
      <CardHeader className="px-6 py-2 bg-muted rounded-t-lg items-end gap-0">
        <CardTitle className="text-xl font-semibold text-gray-900 m-0!">
          {t("terms")}
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="px-6 pt-2 gap-0">
        <div className="divide-y divide-gray-100 [&>div:last-child]:pb-4">
          {isLoading ? (
            // ⭐ Show 7 skeleton rows ⭐
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : (
            <>
              <TermRow
                label={t("deliveryPlace")}
                value={orderTerms.deliveryTermsCode2}
                showEmpty={true}
              />

              <TermRow
                label={t("paymentTerms")}
                value={
                  orderTerms.paymentTerms && orderTerms.paymentTermsCode
                    ? `${orderTerms.paymentTerms} - (${orderTerms.paymentTermsCode})`
                    : orderTerms.paymentTerms
                }
                showEmpty={true}
              />

              <TermRow
                label={t("packingForwarding")}
                value={
                  orderTerms.packageForwarding &&
                  orderTerms.packageForwardingCode
                    ? `${orderTerms.packageForwarding} - (${orderTerms.packageForwardingCode})`
                    : orderTerms.packageForwarding
                }
                showEmpty={true}
              />

              <TermRow
                label={t("modeOfDispatch")}
                value={
                  orderTerms.dispatchInstructions &&
                  orderTerms.dispatchInstructionsCode
                    ? `${orderTerms.dispatchInstructions} - (${orderTerms.dispatchInstructionsCode})`
                    : orderTerms.dispatchInstructions
                }
                showEmpty={true}
              />

              <TermRow
                label={t("freight")}
                value={
                  orderTerms.freight && orderTerms.freightCode
                    ? `${orderTerms.freight} - (${orderTerms.freightCode})`
                    : orderTerms.freight
                }
                showEmpty={true}
              />

              <TermRow
                label={t("insurance")}
                value={
                  orderTerms.insurance && orderTerms.insuranceCode
                    ? `${orderTerms.insurance} - (${orderTerms.insuranceCode})`
                    : orderTerms.insurance
                }
                showEmpty={true}
              />

              <TermRow
                label={t("additionalTerms")}
                value={orderTerms.additionalTerms}
                showEmpty={true}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
