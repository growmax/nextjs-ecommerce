"use client";

import { Button } from "@/components/ui/button";
import { useCalculation } from "@/hooks/useCalculation/useCalculation";
import { useCurrentUser } from "@/hooks/useCurrentUser/useCurrentUser";
import useModuleSettings from "@/hooks/useModuleSettings/useModuleSettings";
import { DiscountService, VolumeDiscountRequestItem } from "@/lib/api";
import { calculate_volume_discount } from "@/utils/calculation/cartCalculation";
import { each, find, map, some } from "lodash";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

interface ApplyVolumeDiscountBtnProps {
  uploading?: boolean;
  isSummary?: boolean;
  isQuoteToOrder?: boolean;
  isLoading?: boolean;
}

/**
 * Volume Discount Button Component
 * Migrated from buyer-fe/src/components/Summary/Components/VolumeDiscountButton/ApplyVolumeDiscountBtn.jsx
 *
 * Applies volume discount to products based on category and order value
 */
export default function ApplyVolumeDiscountBtn({
  uploading = false,
  isSummary = true,
  isQuoteToOrder = false,
  isLoading = false,
}: ApplyVolumeDiscountBtnProps) {
  const { getValues, watch, setValue } = useFormContext();
  const { user } = useCurrentUser();
  const { quoteSettings } = useModuleSettings(user);
  const { globalCalc } = useCalculation();

  // Watch form values
  const products = watch(
    isSummary
      ? "products"
      : isQuoteToOrder
        ? "quotationDetails[0].dbProductDetails"
        : "orderDetails[0].dbProductDetails"
  );
  const cartValue = watch(
    isSummary
      ? "cartValue"
      : isQuoteToOrder
        ? "quotationDetails[0].cartValue"
        : "orderDetails[0].cartValue"
  );
  const getBreakup = watch(
    isSummary
      ? "getBreakup"
      : isQuoteToOrder
        ? "quotationDetails[0].breakup"
        : "orderDetails[0].breakup"
  );
  const isInter = watch(
    isSummary
      ? "isInter"
      : isQuoteToOrder
        ? "quotationDetails[0].isInter"
        : "orderDetails[0].isInter"
  );
  const ShowVDButton = watch(
    isSummary
      ? "ShowVDButton"
      : isQuoteToOrder
        ? "quotationDetails[0].ShowVDButton"
        : "orderDetails[0].ShowVDButton"
  );
  const VolumeDiscountAvailable = watch(
    isSummary
      ? "VolumeDiscountAvailable"
      : isQuoteToOrder
        ? "quotationDetails[0].VolumeDiscountAvailable"
        : "orderDetails[0].VolumeDiscountAvailable"
  );

  // Get values for calculation
  const beforeTax = isSummary
    ? getValues("preferences")?.freightId?.beforeTax
    : getValues(
        isQuoteToOrder
          ? "quotationDetails[0].quoteTerms"
          : "orderDetails[0].orderTerms"
      )?.beforeTax;
  const beforeTaxPercentage = isSummary
    ? getValues("preferences")?.freightId?.beforeTaxPercentage
    : getValues(
        isQuoteToOrder
          ? "quotationDetails[0].quoteTerms"
          : "orderDetails[0].orderTerms"
      )?.beforeTaxPercentage;
  const overallShipping = isSummary
    ? getValues("overallShipping")
    : getValues(
        isQuoteToOrder
          ? "quotationDetails[0].overallShipping"
          : "orderDetails[0].overallShipping"
      );

  const subTotal = cartValue?.totalValue || 0;
  const insuranceCharges = cartValue?.insuranceCharges || 0;
  const companyId = user?.companyId;

  const [isVDLoading, setIsVDLoading] = useState(false);

  /**
   * Create payload for volume discount API
   * Maps products to volume discount request format
   */
  const create_GetVolumeDiscount_Payload = (products: any[]) => {
    return map(products, prd => {
      try {
        let unitListPrice = prd?.unitListPrice || 0;
        if (prd.taxInclusive) {
          unitListPrice = unitListPrice / (1 + (prd?.tax || 0) / 100);
        }
        return {
          ProdutId: prd.productId,
          DiscountPercentage: prd.discount || 0,
          Qty: prd.askedQuantity || prd.quantity || 0,
          UnitLp: unitListPrice,
          CategoryId: prd?.primary_products_categoryObjects?.categoryId,
        };
      } catch (error: any) {
        console.error("Error creating VD payload:", error);
        return {};
      }
    });
  };

  /**
   * Handle volume discount click
   */
  const onVolumeDiscountClick = async () => {
    try {
      setIsVDLoading(true);

      // Check if there are line items
      if (!products || products.length <= 0) {
        toast.info("Add line items to apply volume discount");
        setIsVDLoading(false);
        return;
      }

      if (!companyId) {
        toast.error("Company ID is required");
        setIsVDLoading(false);
        return;
      }

      // Create payload
      const rawPayload = create_GetVolumeDiscount_Payload(products);

      // Transform payload to match VolumeDiscountRequestItem type
      const payload: VolumeDiscountRequestItem[] = rawPayload
        .filter((item: any) => item.ProdutId) // Filter out empty objects
        .map((item: any) => ({
          productId: item.ProdutId,
          quantity: item.Qty,
          defaultDiscount: item.DiscountPercentage,
        }));

      // Call volume discount service
      const api_response = await DiscountService.checkVolumeDiscount({
        companyId: companyId as number,
        body: payload,
      });

      // Check if product has VD and assign the VD percentage to products
      const VdData = products.map((prd: any) => {
        const is_VolumeDiscount_Applied_obj = find(
          (api_response?.data as any)?.data || [],
          (vd: any) =>
            vd.CategoryId === prd?.primary_products_categoryObjects?.categoryId
        );
        prd.volume_discount_obj = is_VolumeDiscount_Applied_obj?.DiscountId
          ? is_VolumeDiscount_Applied_obj
          : null;
        return prd;
      });

      // Calculate data based on VD with products
      const calculated_Vd_response = calculate_volume_discount(
        isInter,
        VdData,
        subTotal,
        insuranceCharges,
        beforeTax,
        beforeTaxPercentage,
        overallShipping,
        quoteSettings || {},
        2 // precision
      );

      // Update cart value with VD data
      const updatedCartValue = { ...cartValue };
      updatedCartValue.pfRate = calculated_Vd_response?.pfRate || 0;

      // Update tax breakup totals
      if (getBreakup && Array.isArray(getBreakup)) {
        each(getBreakup, (breakup: any) => {
          updatedCartValue[`${breakup.taxName}Total`] =
            calculated_Vd_response.vdDetails[`${breakup.taxName}Total`] || 0;
        });
      }

      // Update form values
      setValue(
        isSummary
          ? "ShowVDButton"
          : isQuoteToOrder
            ? "quotationDetails.0.ShowVDButton"
            : "orderDetails.0.ShowVDButton",
        false
      );
      setValue(
        isSummary
          ? "VDapplied"
          : isQuoteToOrder
            ? "quotationDetails.0.VDapplied"
            : "orderDetails.0.VDapplied",
        true
      );
      setValue(
        isSummary
          ? "VDDetails"
          : isQuoteToOrder
            ? "quotationDetails.0.VDDetails"
            : "orderDetails.0.VDDetails",
        calculated_Vd_response?.vdDetails
      );

      // Recalculate using globalCalc (similar to costingCalculation in buyer-fe)
      const calcResult = globalCalc({
        products: calculated_Vd_response?.products || [],
        isInter: isInter,
        taxExemption: false,
        insuranceCharges: insuranceCharges,
        precision: 2,
        Settings: quoteSettings || {},
        isSeller: false,
        overallShipping: overallShipping || 0,
        isBeforeTax: beforeTax || false,
      });

      // Update products
      setValue(
        isSummary
          ? "products"
          : isQuoteToOrder
            ? "quotationDetails.0.dbProductDetails"
            : "orderDetails[0].dbProductDetails",
        calcResult?.products || calculated_Vd_response?.products || []
      );

      // Update GMDetails if available (from calcResult or calculated_Vd_response)
      const gmDetails =
        (calcResult as any)?.GMDetails ||
        (calculated_Vd_response as any)?.GMDetails;
      if (gmDetails) {
        setValue(
          isSummary
            ? "GMDetails"
            : isQuoteToOrder
              ? "quotationDetails[0].GMDetails"
              : "orderDetails[0].GMDetails",
          gmDetails
        );
      }

      // Update cart value
      setValue(
        isSummary
          ? "cartValue"
          : isQuoteToOrder
            ? "quotationDetails[0].cartValue"
            : "orderDetails[0].cartValue",
        {
          ...updatedCartValue,
          ...calcResult?.cartValue,
        }
      );

      // Check if VD was applied to any products
      const is_vd_applied_to_products = some(
        calculated_Vd_response?.products || [],
        ["volumeDiscountApplied", true]
      );

      const snackbar_text = is_vd_applied_to_products
        ? "Volume discount applied successfully"
        : "Selected products don't meet VD criteria";

      if (is_vd_applied_to_products) {
        toast.success(snackbar_text);
      } else {
        toast.info(snackbar_text);
      }

      setIsVDLoading(false);
    } catch (err: any) {
      console.error("Volume discount error:", err);
      toast.error(err?.message || "Failed to apply volume discount");
      setIsVDLoading(false);
    }
  };

  // Show button only when conditions are met
  if (!ShowVDButton || !VolumeDiscountAvailable) {
    return null;
  }

  return (
    <Button
      onClick={onVolumeDiscountClick}
      disabled={uploading || isLoading || isVDLoading}
      className="w-full"
      variant="default"
    >
      {isVDLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Applying...
        </>
      ) : (
        "Apply Volume Discount"
      )}
    </Button>
  );
}
