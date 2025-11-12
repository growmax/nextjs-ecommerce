import {
  SellerWarehouseService,
  type FindSellerBranchRequest,
  type SellerBranch,
  type SellerWarehouse,
} from "@/lib/api";
import getProductIds from "@/utils/getProductIds";
// no React hooks imports needed
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useCurrentUser } from "./useCurrentUser";

interface BillingAddressValue {
  id: number;
  branchName: string;
  vendorID?: number;
  // Add other fields as needed
}

interface DbProductDetail {
  wareHouse?: SellerWarehouse | null;
  [key: string]: unknown;
}

interface OrderDetailsFormValues {
  orderDetails: Array<{
    billingAddressDetails?: BillingAddressValue;
    buyerBranchId?: number;
    buyerBranchName?: string;
    vendorID?: number;
    sellerBranchId?: number;
    sellerBranchName?: string;
    sellerCompanyId?: number;
    sellerCompanyName?: string;
    salesBranchCode?: string;
    dbProductDetails?: DbProductDetail[];
    orderTerms?: {
      deliveryTermsCode2?: string;
    };
    [key: string]: unknown;
  }>;
}

export function useUpdateSellerAndWarehouse(
  setValue: UseFormSetValue<OrderDetailsFormValues>,
  watch: UseFormWatch<OrderDetailsFormValues>
) {
  const { user } = useCurrentUser();
  const userId = user?.userId;
  const companyId = user?.companyId;

  // Use shared util to get product ids
  // getProductIds(products?: DbProductDetail[]): number[]

  /**
   * Update seller branch and warehouse when billing address changes
   */
  async function updateSellerAndWarehouse(
    billingAddressValue: BillingAddressValue
  ): Promise<{
    sellerBranch: SellerBranch | null;
    warehouse: SellerWarehouse | null;
  }> {
    try {
      // Get current product IDs
      const dbProductDetails = watch("orderDetails.0.dbProductDetails");
      const productIds = getProductIds(
        dbProductDetails as DbProductDetail[] | undefined
      );

      // Prepare request payload
      const request: FindSellerBranchRequest = {
        userId: Number(userId),
        buyerBranchId: billingAddressValue.id,
        buyerCompanyId: Number(companyId),
        productIds,
        sellerCompanyId: billingAddressValue.vendorID || 0,
      };

      // Call the service to get seller branch and warehouse
      const { sellerBranch, warehouse } =
        await SellerWarehouseService.getSellerBranchAndWarehouse(
          String(userId),
          String(companyId),
          request
        );

      if (sellerBranch) {
        // Update seller branch details
        setValue("orderDetails.0.sellerBranchId", sellerBranch.id);
        setValue("orderDetails.0.sellerBranchName", sellerBranch.name);
        setValue("orderDetails.0.sellerCompanyId", sellerBranch.companyId);

        // Note: You may need to fetch company name separately if not in response
        // setValue("orderDetails.0.sellerCompanyName", sellerBranch.companyName);
      }

      if (warehouse) {
        // Update warehouse in all product details
        const updatedProducts = dbProductDetails?.map(product => ({
          ...product,
          wareHouse: warehouse,
        }));

        if (updatedProducts) {
          setValue("orderDetails.0.dbProductDetails", updatedProducts);
        }

        // Note: Update delivery terms if your warehouse object has city info
        // setValue("orderDetails.0.orderTerms.deliveryTermsCode2", warehouse.city);
      }

      return { sellerBranch, warehouse };
    } catch (error) {
      console.error("Failed to update seller/warehouse details", error);
      return { sellerBranch: null, warehouse: null };
    }
  }

  /**
   * Handle billing address change
   * Updates billing address and triggers seller/warehouse update
   */
  async function handleBillingAddressChange(newValue: BillingAddressValue) {
    // Update billing address fields
    setValue("orderDetails.0.billingAddressDetails", newValue);
    setValue("orderDetails.0.buyerBranchId", newValue.id);
    setValue("orderDetails.0.buyerBranchName", newValue.branchName);
    if (newValue.vendorID) {
      setValue("orderDetails.0.vendorID", newValue.vendorID);
    }

    // Update seller and warehouse
    await updateSellerAndWarehouse(newValue);
  }

  return {
    handleBillingAddressChange,
    updateSellerAndWarehouse,
  };
}
