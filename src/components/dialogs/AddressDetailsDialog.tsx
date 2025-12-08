"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BillingBranchService, type BillingAddress } from "@/lib/api";
import ShippingBranchService from "@/lib/api/services/ShippingBranchService/ShippingBranchService";
import type { BaseDialogProps } from "@/types/dialog";
import { Loader2, MapPin } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export interface AddressDetailsDialogProps
  extends Omit<BaseDialogProps, "title" | "description"> {
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
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
 
  const { user } = useCurrentUser();

  // Derived selected ID that handles all cases
  const effectiveSelectedId = React.useMemo(() => {
    // Priority 1: User's current selection (if any)
    if (selectedAddressId) return selectedAddressId;
    
    // Priority 2: Provided currentAddress that exists in fetched addresses
    if (addresses.length > 0 && currentAddress?.id) {
      const addressExists = addresses.some(addr => addr.id === currentAddress.id);
      if (addressExists) return currentAddress.id;
    }
    
    // Priority 3: First address if available
    return addresses[0]?.id || null;
  }, [selectedAddressId, addresses, currentAddress?.id]);

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
      let fetchedAddresses: BillingAddress[] = [];
      
      if (mode === "shipping") {
        fetchedAddresses =
          (await ShippingBranchService.getShippingAddresses(
            user.userId.toString(),
            user.companyId.toString()
          )) as unknown as BillingAddress[];
      } else {
        fetchedAddresses = await BillingBranchService.getBillingAddresses(
          user.userId.toString(),
          user.companyId.toString()
        );
      }
      
      setAddresses(fetchedAddresses);
      
      // If we have addresses but no selection yet, auto-select based on priority
      if (fetchedAddresses.length > 0 && !selectedAddressId) {
        // Check if currentAddress exists in fetched addresses
        if (currentAddress?.id) {
          const exists = fetchedAddresses.some(addr => addr.id === currentAddress.id);
          if (exists) {
            setSelectedAddressId(currentAddress.id);
          } else {
            // Current address not found, select first one
            setSelectedAddressId(fetchedAddresses[0]?.id || null);
          }
        } else {
          // No currentAddress provided, select first one
          setSelectedAddressId(fetchedAddresses[0]?.id || null);
        }
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
  }, [user?.userId, user?.companyId, mode, selectedAddressId, currentAddress?.id]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setAddresses([]);
      setError(null);
      setLoading(false);
      // Keep selectedAddressId so it persists when dialog reopens
    }
  }, [open]);

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

  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          size="lg"
          className="max-h-[80vh] flex flex-col"
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              {mode === "shipping" ? "Shipping Address" : "Billing Address"}
            </DialogTitle>
            <DialogDescription>
              Select an address from the list below
            </DialogDescription>
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
                <RadioGroup
                  value={effectiveSelectedId || ""}
                  onValueChange={(value) => {
                    const selected = addresses.find((a) => a.id === value);
                    if (selected) {
                      setSelectedAddressId(selected.id);
                      onAddressSelect(selected);
                      onOpenChange(false);
                    }
                  }}
                  className="space-y-2"
                >
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      
                          "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedAddressId(address.id);
                        onAddressSelect(address);
                        onOpenChange(false);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem
                          value={address.id}
                          id={`radio-${address.id}`}
                          className="mt-1"
                        />
                
                        <label htmlFor={`radio-${address.id}`} className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">
                            {address.name}
                          </div>
                
                          {formatAddress(address).map((line, index) => (
                            <div key={index} className="text-sm text-gray-700 mb-1">
                              {line}
                            </div>
                          ))}
                
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
                        </label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        showCloseButton={true}
        className="max-h-[90vh] flex flex-col"
      >
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-xl font-semibold">
            <MapPin className="h-5 w-5 text-primary" />
            {mode === "shipping" ? "Shipping Address" : "Billing Address"}
          </DrawerTitle>
          <DrawerDescription>
            Select an address from the list below
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 flex flex-col min-h-0 px-4">
          {/* Address List */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pb-4">
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
              <RadioGroup
              value={effectiveSelectedId || ""}
              onValueChange={(value) => {
                const selected = addresses.find((a) => a.id === value);
                if (selected) {
                  setSelectedAddressId(selected.id);
                  onAddressSelect(selected);
                  onOpenChange(false);
                }
              }}
              className="space-y-2"
            >
              {addresses.map(address => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    effectiveSelectedId === address.id
                      ? "bg-primary/5 border-primary/20"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedAddressId(address.id);
                    onAddressSelect(address);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {/* Radio Button */}
                    <RadioGroupItem
                          value={address.id}
                          id={`radio-${address.id}`}
                          className="mt-1"
                        />

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
              ))}
              </RadioGroup>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}