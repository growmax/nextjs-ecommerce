"use client";

import { AddressDetailsDialog } from "@/components/dialogs/AddressDetailsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
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
} from "@/lib/api/services/SellerWarehouseService/SellerWarehouseService";
import { zoneDateTimeCalculator } from "@/utils/date-format/date-format";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
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
    <div className="grid grid-cols-2 gap-4 py-1.5 items-center">
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div className="relative">
        <Input
          type="date"
          value={value || ""}
          onChange={e => onChange?.(e.target.value)}
          className="text-sm h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 pr-10"
        />
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
    <div className="grid grid-cols-2 gap-4 py-1.5 items-center">
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div>
        <Input
          type="text"
          value={value || ""}
          onChange={e => onChange?.(e.target.value)}
          className="text-sm h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50"
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
  const t = useTranslations("components");
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
          <p className="text-sm font-normal text-gray-900">{t("warehouse")}</p>
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
        <p className="text-sm font-normal text-gray-900">{t("warehouse")}</p>
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
  const t = useTranslations("components");
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);

  // Memoize current billing address to prevent unnecessary recreations
  const currentBillingAddress = useMemo(() => {
    if (!billingAddress) return undefined;
    return {
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
    } as BillingAddress;
  }, [billingAddress]);

  // Memoize current shipping address to prevent unnecessary recreations
  const currentShippingAddress = useMemo(() => {
    if (!shippingAddress) return undefined;
    return {
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
    } as BillingAddress;
  }, [shippingAddress]);

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
    // Use the selected address's branch ID
    // address.id is typically the branch ID (string), but we need to check the actual structure
    // For billing addresses, the branch ID might be in address.id or we need to extract it from the address
    // Try to parse address.id as number, or use address.addressId.id as fallback
    let selectedBranchId: number | undefined = undefined;

    if (address.id) {
      // address.id is a string, try to parse it as number
      const parsedId = parseInt(address.id.toString(), 10);
      if (!isNaN(parsedId)) {
        selectedBranchId = parsedId;
      }
    }

    // If address.id couldn't be parsed, try address.addressId.id
    if (!selectedBranchId && address.addressId?.id) {
      const addressIdValue = address.addressId.id;
      selectedBranchId =
        typeof addressIdValue === "number"
          ? addressIdValue
          : parseInt(String(addressIdValue), 10);
    }

    // Fallback to buyerBranchId if we couldn't extract branch ID from address
    if (!selectedBranchId) {
      selectedBranchId = buyerBranchId;
    }

    if (
      userId &&
      selectedBranchId &&
      buyerCompanyId &&
      productIds &&
      productIds.length > 0 &&
      sellerCompanyId
    ) {
      // Call API immediately in background with the selected address's branch ID
      SellerWarehouseService.getSellerBranchAndWarehouse(
        userId,
        buyerCompanyId.toString(),
        {
          userId: parseInt(userId),
          buyerBranchId: selectedBranchId,
          buyerCompanyId,
          productIds,
          sellerCompanyId,
        }
      )
        .then(({ sellerBranch, warehouse }) => {
          // Update seller branch in UI immediately
          if (onSellerBranchChange) {
            onSellerBranchChange(sellerBranch);
          }

          // Update warehouse in UI immediately
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
        });
    } else {
      // Debug: Show what's missing
      const missing = [];
      if (!userId) missing.push("userId");
      if (!selectedBranchId) missing.push("selectedBranchId");
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

    // Call APIs to update seller branch and warehouse immediately
    // Use the selected address's branch ID
    // address.id is typically the branch ID (string), but we need to check the actual structure
    // For shipping addresses, the branch ID might be in address.id or we need to extract it from the address
    // Try to parse address.id as number, or use address.addressId.id as fallback
    let selectedBranchId: number | undefined = undefined;

    if (address.id) {
      // address.id is a string, try to parse it as number
      const parsedId = parseInt(address.id.toString(), 10);
      if (!isNaN(parsedId)) {
        selectedBranchId = parsedId;
      }
    }

    // If address.id couldn't be parsed, try address.addressId.id
    if (!selectedBranchId && address.addressId?.id) {
      const addressIdValue = address.addressId.id;
      selectedBranchId =
        typeof addressIdValue === "number"
          ? addressIdValue
          : parseInt(String(addressIdValue), 10);
    }

    // Fallback to buyerBranchId if we couldn't extract branch ID from address
    if (!selectedBranchId) {
      selectedBranchId = buyerBranchId;
    }

    if (
      userId &&
      selectedBranchId &&
      buyerCompanyId &&
      productIds &&
      productIds.length > 0 &&
      sellerCompanyId
    ) {
      // Call API immediately in background with the selected address's branch ID
      SellerWarehouseService.getSellerBranchAndWarehouse(
        userId,
        buyerCompanyId.toString(),
        {
          userId: parseInt(userId),
          buyerBranchId: selectedBranchId,
          buyerCompanyId,
          productIds,
          sellerCompanyId,
        }
      )
        .then(({ sellerBranch, warehouse }) => {
          // Update seller branch in UI immediately
          if (onSellerBranchChange) {
            onSellerBranchChange(sellerBranch);
          }

          // Update warehouse in UI immediately
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
        });
    } else {
      // Debug: Show what's missing
      const missing = [];
      if (!userId) missing.push("userId");
      if (!selectedBranchId) missing.push("selectedBranchId");
      if (!buyerCompanyId) missing.push("buyerCompanyId");
      if (!productIds || productIds.length === 0) missing.push("productIds");
      if (!sellerCompanyId) missing.push("sellerCompanyId");

      if (process.env.NODE_ENV === "development") {
        toast.error(`Missing required data: ${missing.join(", ")}`);
      }
    }
  };
  return (
    <Card className="shadow-sm pb-0">
      <CardHeader className="px-6 -my-5  bg-gray-50 rounded-t-lg items-end gap-0">
        <CardTitle className="text-xl font-semibold text-gray-900 m-0!">
          {t("contactDetails")}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 pt-2 pb-0 gap-0 -mt-5">
        <div className="divide-y divide-gray-100 [&>div]:py-1.5 [&>div:last-child]:pb-0">
          {/* Company */}
          <DetailRow
            label={t("company")}
            value={sellerAddress?.sellerCompanyName}
          />

          {/* Warehouse */}
          <WarehouseRow
            warehouseName={warehouseName}
            warehouseAddress={warehouseAddress}
          />

          {/* Sales Branch */}
          <DetailRow
            label={t("salesBranch")}
            value={salesBranch || sellerAddress?.sellerBranchName}
          />

          {/* Bill To */}
          <AddressRow
            label={t("billTo")}
            addressName={
              billingAddress?.branchName && billingAddress?.billToCode
                ? `${billingAddress.branchName} - ${billingAddress.billToCode}`
                : billingAddress?.branchName || billingAddress?.billToCode
            }
            addressDetails={billingAddress}
            isEditable={isEditable}
            onEditClick={() => {
              setBillingDialogOpen(true);
            }}
          />

          {/* Ship To */}
          <AddressRow
            label={t("shipTo")}
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
              label={t("requiredDate")}
              value={requiredDate}
              onChange={onRequiredDateChange}
            />
          ) : (
            <DetailRow
              label={t("requiredDate")}
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
              label={t("referenceNumber")}
              value={referenceNumber}
              onChange={onReferenceNumberChange}
              placeholder={t("referenceNumber")}
            />
          ) : (
            <DetailRow
              label={t("referenceNumber")}
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
        currentAddress={currentBillingAddress}
      />

      {/* Shipping Address Dialog */}
      <AddressDetailsDialog
        open={shippingDialogOpen}
        onOpenChange={setShippingDialogOpen}
        onAddressSelect={handleShippingAddressSelect}
        mode="shipping"
        currentAddress={currentShippingAddress}
      />
    </Card>
  );
}
