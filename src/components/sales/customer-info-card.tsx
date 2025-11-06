"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | React.ReactNode;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
          {value || "-"}
        </p>
      </div>
    </div>
  );
};

export default function CustomerInfoCard({
  quoteValidity,
  endCustomerName,
  projectName,
  competitorNames,
  priceJustification,
}: CustomerInfoCardProps) {
  // Format quote validity dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
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
    <Card className="shadow-sm">
      <CardHeader className="px-6 -my-5 bg-gray-50 rounded-t-lg items-end">
        <CardTitle className="text-xl font-semibold text-gray-900 m-0!">
          Customer Information
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 pt-2 pb-0">
        <div className="divide-y divide-gray-100">
          {/* Quote Validity */}
          <InfoRow label="Quote Validity" value={validityDisplay} />

          {/* Contract Enabled */}
          <InfoRow label="Contract Enabled" value="No" />

          {/* End Customer Name */}
          <InfoRow label="End Customer Name" value={endCustomerName} />

          {/* Project Name */}
          <InfoRow label="Project Name" value={projectName} />

          {/* Competitor Names */}
          <InfoRow label="Competitor Names" value={competitorsDisplay} />

          {/* Price Justification */}
          <InfoRow label="Price Justification" value={priceJustification} />
        </div>
      </CardContent>
    </Card>
  );
}
