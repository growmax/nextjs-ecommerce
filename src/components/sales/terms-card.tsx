"use client";

import SectionCardDetail, {
  InfoRow,
  SkeletonRow,
} from "@/components/custom/SectionCardDetail";
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

export default function OrderTermsCard({ orderTerms }: OrderTermsCardProps) {
  const t = useTranslations("components");

  if (!orderTerms) return null;

  const isLoading = orderTerms.loading;

  return (
    <SectionCardDetail
      title={t("terms")}
      headerColor="muted"
      shadow="sm"
      showSeparator={false}
      contentClassName="px-6 pt-2 gap-0"
    >
      <div className="divide-y divide-gray-100 [&>div:last-child]:pb-4">
        {isLoading ? (
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
            <InfoRow
              label={t("deliveryPlace")}
              value={orderTerms.deliveryTermsCode2}
              showEmpty={true}
            />

            <InfoRow
              label={t("paymentTerms")}
              value={
                orderTerms.paymentTerms && orderTerms.paymentTermsCode
                  ? `${orderTerms.paymentTerms} - (${orderTerms.paymentTermsCode})`
                  : orderTerms.paymentTerms
              }
              showEmpty={true}
            />

            <InfoRow
              label={t("packingForwarding")}
              value={
                orderTerms.packageForwarding && orderTerms.packageForwardingCode
                  ? `${orderTerms.packageForwarding} - (${orderTerms.packageForwardingCode})`
                  : orderTerms.packageForwarding
              }
              showEmpty={true}
            />

            <InfoRow
              label={t("modeOfDispatch")}
              value={
                orderTerms.dispatchInstructions &&
                orderTerms.dispatchInstructionsCode
                  ? `${orderTerms.dispatchInstructions} - (${orderTerms.dispatchInstructionsCode})`
                  : orderTerms.dispatchInstructions
              }
              showEmpty={true}
            />

            <InfoRow
              label={t("freight")}
              value={
                orderTerms.freight && orderTerms.freightCode
                  ? `${orderTerms.freight} - (${orderTerms.freightCode})`
                  : orderTerms.freight
              }
              showEmpty={true}
            />

            <InfoRow
              label={t("insurance")}
              value={
                orderTerms.insurance && orderTerms.insuranceCode
                  ? `${orderTerms.insurance} - (${orderTerms.insuranceCode})`
                  : orderTerms.insurance
              }
              showEmpty={true}
            />

            <InfoRow
              label={t("additionalTerms")}
              value={orderTerms.additionalTerms}
              showEmpty={true}
            />
          </>
        )}
      </div>
    </SectionCardDetail>
  );
}
