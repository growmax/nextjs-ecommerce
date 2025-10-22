"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div>
        <p className="text-sm text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );
};

export default function OrderTermsCard({
  orderTerms,
}: OrderTermsCardProps) {
  if (!orderTerms) return null;

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="px-6 -my-5 py-2 bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl font-semibold text-gray-900 !m-0">
          Terms
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 py-2">
        <div className="divide-y divide-gray-100">
          {/* Delivery Place */}
          <TermRow
            label="Delivery Place"
            value={orderTerms.deliveryTermsCode2}
          />

          {/* Payment Terms */}
          <TermRow
            label="Payment Terms"
            value={
              orderTerms.paymentTerms && orderTerms.paymentTermsCode
                ? `${orderTerms.paymentTerms} - (${orderTerms.paymentTermsCode})`
                : orderTerms.paymentTerms
            }
          />

          {/* Packing & Forwarding */}
          <TermRow
            label="Packing & Forwarding"
            value={
              orderTerms.packageForwarding && orderTerms.packageForwardingCode
                ? `${orderTerms.packageForwarding} - (${orderTerms.packageForwardingCode})`
                : orderTerms.packageForwarding
            }
          />

          {/* Mode of Dispatch */}
          <TermRow
            label="Mode of Dispatch"
            value={
              orderTerms.dispatchInstructions && orderTerms.dispatchInstructionsCode
                ? `${orderTerms.dispatchInstructions} - (${orderTerms.dispatchInstructionsCode})`
                : orderTerms.dispatchInstructions
            }
          />

          {/* Freight */}
          <TermRow label="Freight" value={orderTerms.freight} />

          {/* Insurance */}
          <TermRow label="Insurance" value={orderTerms.insurance} />

          {/* Additional Terms */}
          <TermRow
            label="Additional Terms"
            value={orderTerms.additionalTerms}
            showEmpty={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}

