"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser/useCurrentUser";
import { BillingBranchService, type BillingAddress } from "@/lib/api";
import ShippingBranchService from "@/lib/api/services/ShippingBranchService/ShippingBranchService";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface AddressDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelect: (address: BillingAddress) => void;
  currentAddress?: BillingAddress | undefined;
  mode?: "billing" | "shipping";
}

export function AddressDetailsDialog({
  open,
  onOpenChange,
  onAddressSelect,
  currentAddress,
  mode = "billing",
}: AddressDetailsDialogProps) {
  const [addresses, setAddresses] = React.useState<BillingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<
    string | null
  >(currentAddress?.id || null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { user } = useCurrentUser();

  const fetchAddresses = React.useCallback(async () => {
    if (!user?.userId) {
      setError("User ID not available");
      return;
    }

    if (!user?.companyId) {
      setError("Company ID not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "shipping") {
        const shippingAddresses =
          (await ShippingBranchService.getShippingAddresses(
            user.userId.toString(),
            user.companyId.toString()
          )) as unknown as BillingAddress[];
        setAddresses(shippingAddresses);
      } else {
        const billingAddresses = await BillingBranchService.getBillingAddresses(
          user.userId.toString(),
          user.companyId.toString()
        );
        setAddresses(billingAddresses);
      }
    } catch (err) {
      setError(
        `Failed to load ${mode === "shipping" ? "shipping" : "billing"} addresses: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      toast.error(
        `Failed to load ${mode === "shipping" ? "shipping" : "billing"} addresses`
      );
    } finally {
      setLoading(false);
    }
  }, [user?.userId, user?.companyId, mode]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setAddresses([]);
      setSelectedAddressId(currentAddress?.id || null);
      setError(null);
      setLoading(false);
    }
  }, [open, currentAddress?.id]);

  // Fetch addresses when dialog opens
  React.useEffect(() => {
    if (open) {
      if (user?.userId && user?.companyId) {
        fetchAddresses();
      } else {
        setError("User ID or Company ID not available");
        setLoading(false);
      }
    }
  }, [open, user?.userId, user?.companyId, fetchAddresses]);

  const handleAddressSelect = (address: BillingAddress) => {
    setSelectedAddressId(address.id);
    onAddressSelect(address);
    onOpenChange(false);
  };

  const formatAddress = (address: BillingAddress) => {
    const { addressId } = address;
    const parts = [];

    // First line: Address line
    if (addressId.addressLine) parts.push(addressId.addressLine);

    // Second line: City, State, Postal Code
    const cityStateParts = [];
    if (addressId.city) cityStateParts.push(addressId.city);
    if (addressId.state) cityStateParts.push(addressId.state);
    if (addressId.pinCodeId) cityStateParts.push(addressId.pinCodeId);

    if (cityStateParts.length > 0) {
      parts.push(cityStateParts.join(", "));
    }

    // Third line: Country (in uppercase)
    if (addressId.country) parts.push(addressId.country.toUpperCase());

    return parts;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "shipping" ? "Shipping Address" : "Billing Address"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Address List */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading addresses...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-red-500">
                <span>{error}</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <span>No addresses found</span>
              </div>
            ) : (
              addresses.map(address => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? "bg-primary/5 border-primary/20"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Radio Button */}
                    <div className="shrink-0 mt-1">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedAddressId === address.id
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAddressId === address.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="flex-1 min-w-0">
                      {/* Branch Name - Main Title */}
                      <div className="font-semibold text-gray-900 mb-1">
                        {address.name}
                      </div>

                      {/* Address Details - Multi-line format */}
                      {(() => {
                        const addressLines = formatAddress(address);
                        return addressLines.map((line, index) => (
                          <div
                            key={`${address.id}-${line.substring(0, 10)}-${index}`}
                            className="text-sm text-gray-700 mb-1"
                          >
                            {line}
                          </div>
                        ));
                      })()}

                      {/* Code - BillTo or ShipTo depending on mode */}
                      {mode === "shipping" && address.addressId.shipToCode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ship to Code: {address.addressId.shipToCode}
                        </div>
                      )}
                      {mode !== "shipping" && address.addressId.billToCode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Bill to Code: {address.addressId.billToCode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
