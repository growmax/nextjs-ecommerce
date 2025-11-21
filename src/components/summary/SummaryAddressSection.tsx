"use client";

import { useFormContext } from "react-hook-form";
import OrderContactDetails from "@/components/sales/contactdetails";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SummaryAddressSectionProps {
  isEditable?: boolean;
  className?: string;
}

/**
 * Address section component for summary pages
 * Wraps OrderContactDetails with form integration
 * 
 * @param isEditable - Whether addresses can be edited
 * @param className - Additional CSS classes
 */
export default function SummaryAddressSection({
  isEditable = true,
  className,
}: SummaryAddressSectionProps) {
  const { watch, setValue } = useFormContext();
  const { user } = useCurrentUser();

  const billingAddress = watch("setBillingAddress");
  const shippingAddress = watch("setShippingAddress");
  const registerAddress = watch("setRegisterAddress");
  const sellerAddress = watch("setSellerAddress");
  const warehouseAddress = watch("setWarehouseAddress");
  const customerRequiredDate = watch("customerRequiredDate");
  const buyerReferenceNumber = watch("buyerReferenceNumber");

  const handleBillingAddressChange = (address: any) => {
    setValue("setBillingAddress", address);
    // Trigger seller address and warehouse update
    // This will be handled by useOnChanges hook
  };

  const handleShippingAddressChange = (address: any) => {
    setValue("setShippingAddress", address);
  };

  const handleRequiredDateChange = (date: string) => {
    setValue("customerRequiredDate", date);
  };

  const handleReferenceNumberChange = (refNumber: string) => {
    setValue("buyerReferenceNumber", refNumber);
  };

  return (
    <div className={className}>
      <OrderContactDetails
        billingAddress={billingAddress}
        shippingAddress={shippingAddress}
        registerAddress={registerAddress}
        sellerAddress={sellerAddress}
        warehouseName={warehouseAddress?.name}
        warehouseAddress={warehouseAddress?.addressId}
        salesBranch={sellerAddress?.name}
        requiredDate={customerRequiredDate}
        referenceNumber={buyerReferenceNumber}
        isEditable={isEditable}
        userId={user?.userId?.toString()}
        buyerBranchId={billingAddress?.id}
        buyerCompanyId={user?.companyId}
        productIds={watch("products")?.map((p: any) => p.productId) || []}
        sellerCompanyId={sellerAddress?.companyId?.id}
        onRequiredDateChange={handleRequiredDateChange}
        onReferenceNumberChange={handleReferenceNumberChange}
        onBillingAddressChange={handleBillingAddressChange}
        onShippingAddressChange={handleShippingAddressChange}
      />
    </div>
  );
}

