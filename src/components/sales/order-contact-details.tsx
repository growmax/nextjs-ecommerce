"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AddressDetails {
  addressLine?: string;
  branchName?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCodeId?: string;
  pincode?: string;
  gst?: string;
  district?: string;
  locality?: string;
  mobileNo?: string;
  phone?: string;
  email?: string;
  billToCode?: string;
  shipToCode?: string;
  soldToCode?: string;
  sellerCompanyName?: string;
  sellerBranchName?: string;
}

interface OrderContactDetailsProps {
  billingAddress?: AddressDetails;
  shippingAddress?: AddressDetails;
  registerAddress?: AddressDetails;
  sellerAddress?: AddressDetails;
  buyerCompanyName?: string;
  buyerBranchName?: string;
  warehouseName?: string | undefined;
  salesBranch?: string | undefined;
  requiredDate?: string | undefined;
  referenceNumber?: string | undefined;
}

const DetailRow = ({
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

export default function OrderContactDetails({
  billingAddress,
  shippingAddress,
  sellerAddress,
  warehouseName,
  salesBranch,
  requiredDate,
  referenceNumber,
}: OrderContactDetailsProps) {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="px-6 -my-5 py-2 bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl font-semibold text-gray-900 !m-0">
          Contact Details
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 py-2">
        <div className="divide-y divide-gray-100">
          {/* Company */}
          <DetailRow
            label="Company"
            value={sellerAddress?.sellerCompanyName}
          />

          {/* Warehouse */}
          <DetailRow label="Warehouse" value={warehouseName} />

          {/* Sales Branch */}
          <DetailRow
            label="Sales Branch"
            value={salesBranch || sellerAddress?.sellerBranchName}
          />

          {/* Bill To */}
          <DetailRow
            label="Bill To"
            value={
              billingAddress?.branchName && billingAddress?.billToCode
                ? `${billingAddress.branchName} - ${billingAddress.billToCode}`
                : billingAddress?.branchName || billingAddress?.billToCode
            }
          />

          {/* Ship To */}
          <DetailRow
            label="Ship To"
            value={
              shippingAddress?.branchName && shippingAddress?.shipToCode
                ? `${shippingAddress.branchName} - ${shippingAddress.shipToCode}`
                : shippingAddress?.branchName || shippingAddress?.shipToCode
            }
          />

          {/* Required Date */}
          <DetailRow label="Required Date" value={requiredDate} />

          {/* Reference Number */}
          <DetailRow
            label="Reference Number"
            value={referenceNumber}
            showEmpty={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
