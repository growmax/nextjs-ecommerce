"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

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

interface WarehouseAddressDetails {
  addressLine?: string;
  district?: string;
  city?: string;
  state?: string;
  pinCodeId?: string;
  country?: string;
}

interface OrderContactDetailsProps {
  billingAddress?: AddressDetails;
  shippingAddress?: AddressDetails;
  registerAddress?: AddressDetails;
  sellerAddress?: AddressDetails;
  buyerCompanyName?: string;
  buyerBranchName?: string;
  warehouseName?: string | undefined;
  warehouseAddress?: WarehouseAddressDetails;
  salesBranch?: string | undefined;
  requiredDate?: string | undefined;
  referenceNumber?: string | undefined;
  isEditable?: boolean;
  onRequiredDateChange?: (date: string) => void;
  onReferenceNumberChange?: (refNumber: string) => void;
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
        <p className="text-sm font-semibold text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );
};

const EditableDateRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | undefined;
  onChange?: ((date: string) => void) | undefined;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 py-1.5">
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div className="relative">
        <Input
          type="date"
          value={value || ""}
          onChange={e => onChange?.(e.target.value)}
          className="text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50"
          placeholder={label}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

const EditableTextRow = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  placeholder?: string | undefined;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 py-1.5">
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div>
        <Input
          type="text"
          value={value || ""}
          onChange={e => onChange?.(e.target.value)}
          className="text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50"
          placeholder={placeholder || label}
        />
      </div>
    </div>
  );
};

const WarehouseRow = ({
  warehouseName,
  warehouseAddress,
}: {
  warehouseName?: string | undefined;
  warehouseAddress?: WarehouseAddressDetails | undefined;
}) => {
  if (!warehouseName) return null;

  const hasAddressDetails =
    warehouseAddress &&
    (warehouseAddress.addressLine ||
      warehouseAddress.district ||
      warehouseAddress.city ||
      warehouseAddress.state ||
      warehouseAddress.pinCodeId ||
      warehouseAddress.country);

  if (!hasAddressDetails) {
    return (
      <div className="grid grid-cols-2 gap-4 py-1.5">
        <div>
          <p className="text-sm font-normal text-gray-900">Warehouse</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{warehouseName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 py-1.5">
      <div>
        <p className="text-sm font-normal text-gray-900">Warehouse</p>
      </div>
      <div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <p className="text-sm font-semibold text-gray-900 cursor-pointer underline">
              {warehouseName}
            </p>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 bg-gray-800 text-white border-gray-700">
            <div className="space-y-1">
              {warehouseAddress.addressLine && (
                <p className="text-xs">{warehouseAddress.addressLine}</p>
              )}
              {warehouseAddress.district && (
                <p className="text-xs">{warehouseAddress.district}</p>
              )}
              {(warehouseAddress.city ||
                warehouseAddress.state ||
                warehouseAddress.pinCodeId) && (
                <p className="text-xs">
                  {[
                    warehouseAddress.city,
                    warehouseAddress.state,
                    warehouseAddress.pinCodeId,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {warehouseAddress.country && (
                <p className="text-xs">{warehouseAddress.country}</p>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

const AddressRow = ({
  label,
  addressName,
  addressDetails,
}: {
  label: string;
  addressName?: string | undefined;
  addressDetails?: AddressDetails | undefined;
}) => {
  if (!addressName) return null;

  const hasAddressDetails =
    addressDetails &&
    (addressDetails.addressLine ||
      addressDetails.city ||
      addressDetails.state ||
      addressDetails.pinCodeId ||
      addressDetails.country ||
      addressDetails.gst);

  if (!hasAddressDetails) {
    return (
      <div className="grid grid-cols-2 gap-4 py-1.5">
        <div>
          <p className="text-sm font-normal text-gray-900">{label}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{addressName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 py-1.5">
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <p className="text-sm font-semibold text-gray-900 cursor-pointer underline">
              {addressName}
            </p>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 bg-gray-800 text-white border-gray-700">
            <div className="space-y-1">
              {addressDetails.branchName && (
                <p className="text-xs font-semibold">
                  {addressDetails.branchName}
                </p>
              )}
              {addressDetails.addressLine && (
                <p className="text-xs">{addressDetails.addressLine}</p>
              )}
              {(addressDetails.city ||
                addressDetails.state ||
                addressDetails.pinCodeId) && (
                <p className="text-xs">
                  {[
                    addressDetails.city,
                    addressDetails.state,
                    addressDetails.pinCodeId,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {addressDetails.country && (
                <p className="text-xs">{addressDetails.country}</p>
              )}
              {addressDetails.gst && (
                <>
                  <p className="text-xs">GST</p>
                  <p className="text-xs">{addressDetails.gst}</p>
                </>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

export default function OrderContactDetails({
  billingAddress,
  shippingAddress,
  sellerAddress,
  warehouseName,
  warehouseAddress,
  salesBranch,
  requiredDate,
  referenceNumber,
  isEditable = false,
  onRequiredDateChange,
  onReferenceNumberChange,
}: OrderContactDetailsProps) {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="px-6 -my-5  bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl font-semibold text-gray-900 m-0!">
          Contact Details
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 ">
        <div className="divide-y divide-gray-100">
          {/* Company */}
          <DetailRow label="Company" value={sellerAddress?.sellerCompanyName} />

          {/* Warehouse */}
          <WarehouseRow
            warehouseName={warehouseName}
            warehouseAddress={warehouseAddress}
          />

          {/* Sales Branch */}
          <DetailRow
            label="Sales Branch"
            value={salesBranch || sellerAddress?.sellerBranchName}
          />

          {/* Bill To */}
          <AddressRow
            label="Bill To"
            addressName={
              billingAddress?.branchName && billingAddress?.billToCode
                ? `${billingAddress.branchName} - ${billingAddress.billToCode}`
                : billingAddress?.branchName || billingAddress?.billToCode
            }
            addressDetails={billingAddress}
          />

          {/* Ship To */}
          <AddressRow
            label="Ship To"
            addressName={
              shippingAddress?.branchName && shippingAddress?.shipToCode
                ? `${shippingAddress.branchName} - ${shippingAddress.shipToCode}`
                : shippingAddress?.branchName || shippingAddress?.shipToCode
            }
            addressDetails={shippingAddress}
          />

          {/* Required Date */}
          {isEditable ? (
            <EditableDateRow
              label="Required Date"
              value={requiredDate}
              onChange={onRequiredDateChange}
            />
          ) : (
            <DetailRow label="Required Date" value={requiredDate} />
          )}

          {/* Reference Number */}
          {isEditable ? (
            <EditableTextRow
              label="Reference Number"
              value={referenceNumber}
              onChange={onReferenceNumberChange}
              placeholder="Reference Number"
            />
          ) : (
            <DetailRow
              label="Reference Number"
              value={referenceNumber}
              showEmpty={true}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
