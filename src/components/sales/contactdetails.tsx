"use client";

import { AddressDetailsDialog } from "@/components/dialogs/AddressDetailsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { type BillingAddress } from "@/lib/api";
import SellerWarehouseService, {
  type SellerBranch,
  type Warehouse,
} from "@/lib/api/services/SellerWarehouseService";
import { zoneDateTimeCalculator } from "@/utils/dateformat";
import { Calendar, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddressDetails {
  addressLine?: string | undefined;
  branchName?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  pinCodeId?: string | undefined;
  pincode?: string | undefined;
  gst?: string | undefined;
  district?: string | undefined;
  locality?: string | undefined;
  mobileNo?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  billToCode?: string | undefined;
  shipToCode?: string | undefined;
  soldToCode?: string | undefined;
  sellerCompanyName?: string | undefined;
  sellerBranchName?: string | undefined;
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
  userId?: string | undefined;
  buyerBranchId?: number | undefined;
  buyerCompanyId?: number | undefined;
  productIds?: number[] | undefined;
  sellerCompanyId?: number | undefined;
  onRequiredDateChange?: (date: string) => void;
  onReferenceNumberChange?: (refNumber: string) => void;
  onBillingAddressChange?: (address: AddressDetails) => void;
  onShippingAddressChange?: (address: AddressDetails) => void;
  onSellerBranchChange?: (sellerBranch: SellerBranch | null) => void;
  onWarehouseChange?: (warehouse: Warehouse | null) => void;
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
  isEditable = false,
  onEditClick,
}: {
  label: string;
  addressName?: string | undefined;
  addressDetails?: AddressDetails | undefined;
  isEditable?: boolean;
  onEditClick?: () => void;
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
      <div className="grid grid-cols-2 gap-4 py-1.5 group">
        <div>
          <p className="text-sm font-normal text-gray-900">{label}</p>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <p
            className={`${isEditable ? "text-xs" : "text-sm"} font-semibold text-gray-900 truncate`}
          >
            {addressName}
          </p>
          {isEditable && (
            <Pencil
              className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 cursor-pointer hover:text-gray-600"
              onClick={e => {
                e.stopPropagation();
                if (process.env.NODE_ENV === "development") {
                  // eslint-disable-next-line no-console
                  console.log("Edit icon clicked for Bill To");
                }
                onEditClick?.();
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 py-1.5 group">
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <HoverCard>
          <HoverCardTrigger asChild>
            <p
              className={`${isEditable ? "text-xs" : "text-sm"} font-semibold text-gray-900 cursor-pointer underline truncate`}
            >
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
        {isEditable && (
          <Pencil
            className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 cursor-pointer hover:text-gray-600"
            onClick={e => {
              e.stopPropagation();
              onEditClick?.();
            }}
          />
        )}
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
  userId,
  buyerBranchId,
  buyerCompanyId,
  productIds,
  sellerCompanyId,
  onRequiredDateChange,
  onReferenceNumberChange,
  onBillingAddressChange,
  onShippingAddressChange,
  onSellerBranchChange,
  onWarehouseChange,
}: OrderContactDetailsProps) {
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);

  // Get user preferences for date/time formatting
  const getUserPreferences = () => {
    try {
      const savedPrefs = localStorage.getItem("userPreferences");
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        return {
          timeZone: prefs.timeZone || "Asia/Kolkata",
          dateFormat: prefs.dateFormat || "dd/MM/yyyy",
          timeFormat: prefs.timeFormat || "hh:mm a",
        };
      }
    } catch {
      // Fallback to defaults
    }
    return {
      timeZone: "Asia/Kolkata",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "hh:mm a",
    };
  };

  const preferences = getUserPreferences();

  const handleBillingAddressSelect = (address: BillingAddress) => {
    // Convert BillingAddress to AddressDetails format
    const updatedBillingAddress: AddressDetails = {
      branchName: address.addressId.branchName,
      addressLine: address.addressId.addressLine || undefined,
      city: address.addressId.city || undefined,
      state: address.addressId.state || undefined,
      country: address.addressId.country || undefined,
      pincode: address.addressId.pinCodeId || undefined,
      billToCode: address.addressId.billToCode || undefined,
      gst: address.addressId.gst || undefined,
      mobileNo: address.addressId.mobileNo || undefined,
      phone: address.addressId.phone || undefined,
      email: address.addressId.email || undefined,
    };

    // Update UI immediately
    if (onBillingAddressChange) {
      onBillingAddressChange(updatedBillingAddress);
    }

    // Show success message
    toast.success("Billing address updated successfully");

    // Call APIs to update seller branch and warehouse immediately
    // Use buyerBranchId from order details (it represents the buyer's branch)
    if (
      userId &&
      buyerBranchId &&
      buyerCompanyId &&
      productIds &&
      productIds.length > 0 &&
      sellerCompanyId
    ) {
      // Call API immediately in background
      SellerWarehouseService.getSellerBranchAndWarehouse(
        userId,
        buyerCompanyId.toString(),
        {
          userId: parseInt(userId),
          buyerBranchId,
          buyerCompanyId,
          productIds,
          sellerCompanyId,
        }
      )
        .then(({ sellerBranch, warehouse }) => {
          // Update seller branch immediately (call even if null to clear previous state)
          if (onSellerBranchChange) {
            onSellerBranchChange(sellerBranch);
          }

          // Update warehouse immediately (call even if null to clear previous state)
          if (onWarehouseChange) {
            onWarehouseChange(warehouse);
          }

          // Show appropriate success message
          if (sellerBranch && warehouse) {
            toast.success("Seller branch and warehouse updated successfully");
          } else if (sellerBranch) {
            toast.success("Seller branch updated successfully");
          } else if (warehouse) {
            toast.success("Warehouse updated successfully");
          } else {
            toast.error("No seller branch or warehouse found");
          }
        })
        .catch(() => {
          // Show error message
          toast.error("Failed to sync seller branch and warehouse with server");
          // Still try to update seller branch if it was partially successful
          // This ensures UI updates even on partial failures
        });
    } else {
      // Debug: Show what's missing
      const missing = [];
      if (!userId) missing.push("userId");
      if (!buyerBranchId) missing.push("buyerBranchId");
      if (!buyerCompanyId) missing.push("buyerCompanyId");
      if (!productIds || productIds.length === 0) missing.push("productIds");
      if (!sellerCompanyId) missing.push("sellerCompanyId");

      if (process.env.NODE_ENV === "development") {
        toast.error(`Missing required data: ${missing.join(", ")}`);
      }
    }
  };

  const handleShippingAddressSelect = (address: BillingAddress) => {
    // Convert BillingAddress to AddressDetails format
    const updatedShippingAddress: AddressDetails = {
      branchName: address.addressId.branchName,
      addressLine: address.addressId.addressLine || undefined,
      city: address.addressId.city || undefined,
      state: address.addressId.state || undefined,
      country: address.addressId.country || undefined,
      pincode: address.addressId.pinCodeId || undefined,
      shipToCode: address.addressId.shipToCode || undefined,
      gst: address.addressId.gst || undefined,
      mobileNo: address.addressId.mobileNo || undefined,
      phone: address.addressId.phone || undefined,
      email: address.addressId.email || undefined,
    };

    // Update UI immediately
    if (onShippingAddressChange) {
      onShippingAddressChange(updatedShippingAddress);
    }

    // Show success message
    toast.success("Shipping address updated successfully");
  };
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
            isEditable={isEditable}
            onEditClick={() => {
              if (process.env.NODE_ENV === "development") {
                // eslint-disable-next-line no-console
                console.log("Setting billing dialog open to true");
              }
              setBillingDialogOpen(true);
            }}
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
            isEditable={isEditable}
            onEditClick={() => setShippingDialogOpen(true)}
          />

          {/* Required Date */}
          {isEditable ? (
            <EditableDateRow
              label="Required Date"
              value={requiredDate}
              onChange={onRequiredDateChange}
            />
          ) : (
            <DetailRow
              label="Required Date"
              value={
                requiredDate
                  ? zoneDateTimeCalculator(
                      requiredDate,
                      preferences.timeZone,
                      preferences.dateFormat,
                      preferences.timeFormat,
                      false
                    ) || "-"
                  : "-"
              }
            />
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

      {/* Billing Address Dialog */}
      <AddressDetailsDialog
        open={billingDialogOpen}
        onOpenChange={setBillingDialogOpen}
        onAddressSelect={handleBillingAddressSelect}
        mode="billing"
        currentAddress={
          billingAddress
            ? ({
                id: billingAddress.billToCode || "",
                name: billingAddress.branchName || "",
                addressId: {
                  addressLine: billingAddress.addressLine || "",
                  billToCode: billingAddress.billToCode || null,
                  branchName: billingAddress.branchName || "",
                  city: billingAddress.city || "",
                  country: billingAddress.country || "",
                  countryCode: "",
                  district: "",
                  email: billingAddress.email || null,
                  gst: billingAddress.gst || "",
                  id: 0,
                  isBilling: true,
                  isCustAddress: false,
                  isShipping: false,
                  lattitude: "",
                  locality: "",
                  locationUrl: null,
                  longitude: "",
                  mobileNo: billingAddress.mobileNo || "",
                  nationalMobileNum: "",
                  phone: billingAddress.phone || "",
                  pinCodeId: billingAddress.pincode || "",
                  primaryContact: "",
                  regAddress: false,
                  shipToCode: null,
                  soldToCode: null,
                  state: billingAddress.state || "",
                  tenantId: 0,
                  vendorID: null,
                  vendorId: null,
                  wareHouse: false,
                },
                companyId: {
                  id: 0,
                  name: "",
                },
              } as BillingAddress)
            : undefined
        }
      />

      {/* Shipping Address Dialog */}
      <AddressDetailsDialog
        open={shippingDialogOpen}
        onOpenChange={setShippingDialogOpen}
        onAddressSelect={handleShippingAddressSelect}
        mode="shipping"
        currentAddress={
          shippingAddress
            ? ({
                id: shippingAddress.shipToCode || "",
                name: shippingAddress.branchName || "",
                addressId: {
                  addressLine: shippingAddress.addressLine || "",
                  billToCode: null,
                  branchName: shippingAddress.branchName || "",
                  city: shippingAddress.city || "",
                  country: shippingAddress.country || "",
                  countryCode: "",
                  district: "",
                  email: shippingAddress.email || null,
                  gst: shippingAddress.gst || "",
                  id: 0,
                  isBilling: false,
                  isCustAddress: false,
                  isShipping: true,
                  lattitude: "",
                  locality: "",
                  locationUrl: null,
                  longitude: "",
                  mobileNo: shippingAddress.mobileNo || "",
                  nationalMobileNum: "",
                  phone: shippingAddress.phone || "",
                  pinCodeId: shippingAddress.pincode || "",
                  primaryContact: "",
                  regAddress: false,
                  shipToCode: shippingAddress.shipToCode || null,
                  soldToCode: null,
                  state: shippingAddress.state || "",
                  tenantId: 0,
                  vendorID: null,
                  vendorId: null,
                  wareHouse: false,
                },
                companyId: {
                  id: 0,
                  name: "",
                },
              } as BillingAddress)
            : undefined
        }
      />
    </Card>
  );
}
