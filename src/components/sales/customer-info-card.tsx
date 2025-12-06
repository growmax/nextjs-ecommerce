"use client";

import SectionCardDetail, {
  InfoRow,
  SkeletonRow,
} from "@/components/custom/SectionCardDetail";
import { zoneDateTimeCalculator } from "@/utils/date-format/date-format";
import { getUserPreferences } from "@/utils/details/orderdetails";
import { useTranslations } from "next-intl";

interface CustomerInfoCardProps {
  quoteValidity?: {
    from?: string | undefined;
    till?: string | undefined;
  };
  contractEnabled?: boolean;
  endCustomerName?: string | undefined;
  projectName?: string | undefined;
  competitorNames?: string[];
  priceJustification?: string | undefined;
  loading?: boolean;
}

export default function CustomerInfoCard({
  quoteValidity,
  contractEnabled,
  endCustomerName,
  projectName,
  competitorNames,
  priceJustification,
  loading,
}: CustomerInfoCardProps) {
  const t = useTranslations("components");
  const preferences = getUserPreferences();

  // Format quote validity dates using the date formatter with user preferences
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const formattedDate = zoneDateTimeCalculator(
        dateString,
        preferences.timeZone,
        preferences.dateFormat,
        preferences.timeFormat,
        false // Don't include time for validity dates
      );
      return formattedDate || "-";
    } catch {
      return "-";
    }
  };

  const validityDisplay =
    quoteValidity?.from && quoteValidity?.till
      ? `${formatDate(quoteValidity.from)} - ${formatDate(quoteValidity.till)}`
      : "-";

  const competitorsDisplay =
    competitorNames && competitorNames.length > 0
      ? competitorNames.join(", ")
      : "-";

  return (
    <SectionCardDetail
      title={t("customerInformation")}
      headerColor="muted"
      shadow="sm"
      contentClassName="px-6 pt-2 pb-0"
    >
      <div className="divide-y divide-gray-100">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          <>
            {/* Quote Validity */}
            <InfoRow label={t("quoteValidity")} value={validityDisplay} />

            {/* Contract Enabled */}
            <InfoRow
              label={t("contractEnabled")}
              value={contractEnabled ? t("yesLabel") : t("no")}
            />

            {/* End Customer Name */}
            <InfoRow label={t("endCustomerName")} value={endCustomerName} />

            {/* Project Name */}
            <InfoRow label={t("projectName")} value={projectName} />

            {/* Competitor Names */}
            <InfoRow label={t("competitorNames")} value={competitorsDisplay} />

            {/* Price Justification */}
            <InfoRow
              label={t("priceJustification")}
              value={priceJustification}
            />
          </>
        )}
      </div>
    </SectionCardDetail>
  );
}
