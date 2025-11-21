"use client";

import { useMemo, useState } from "react";
import { map } from "lodash";
import { useSearchParams } from "next/navigation";
import { useCart as useCartContext } from "@/contexts/CartContext";
import useUser from "@/hooks/useUser";
import { useCart } from "@/hooks/useCart";
import useBilling from "@/hooks/useBilling";
import useCurrentShippingAddress from "@/hooks/useCurrentShippingAddress/useCurrentShippingAddress";
import useSelectedSellerCart from "@/hooks/useSelectedSellerCart";
import useCheckVolumeDiscountEnabled from "@/hooks/useCheckVolumeDiscountEnabled/useCheckVolumeDiscountEnabled";
import useModuleSettings from "@/hooks/useModuleSettings";
import useDefaultPreference from "./useDefaultPreference";
import useDefaultWarehouse from "./useDefaultWarehouse";
import useDefaultAccSupportOwner from "./useDefaultAccSupportOwner";
import useTaxBreakup from "./useTaxBreakup";
import useMultipleDiscount from "./useMultipleDiscount";
import useDefaultSellerAddress from "./useDefaultSellerAddress";
import useRegisterAddress from "./useRegisterAddress";
import useGetDefaultBusinessUnit from "./useGetDefaultBusinessUnit";

/**
 * Main hook that orchestrates all summary page data fetching and calculations
 * Migrated from buyer-fe/src/components/Summary/hooks/useSummaryDefault.js
 *
 * @param isOrder - Whether this is an order summary (true) or quote summary (false)
 * @param isSummary - Whether this is a summary page (affects preference endpoint)
 * @returns Complete initial values and loading state for summary forms
 */
export default function useSummaryDefault(
  isOrder: boolean = false,
  isSummary: boolean = false
) {
  const { companydata } = useUser();
  const userId = (companydata as { userId?: number })?.userId;
  const companyId = (companydata as { companyId?: number })?.companyId;
  const userData = (companydata as { userData?: unknown })?.userData;
  const taxExempted = (companydata as { taxExempted?: boolean })?.taxExempted;
  const taxExemptionId = (companydata as { taxExemptionId?: number })
    ?.taxExemptionId;
  const currency = (companydata as { currency?: unknown })?.currency;

  const searchParams = useSearchParams();
  const selectedSellerIdFromQuery = searchParams?.get("sellerId");

  const { cartComment, cartAttachments } = useCart();
  const { cart } = useCartContext();

  // Use the same multi-seller cart logic as the cart page
  const {
    selectedSellerItems,
    selectedSellerPricing,
    hasMultipleSellers,
    selectedSellerId: currentSelectedSellerId,
  } = useSelectedSellerCart(cart, selectedSellerIdFromQuery);

  // Use the current selected seller ID (which might be auto-selected if not in query)
  const selectedSellerId = currentSelectedSellerId || selectedSellerIdFromQuery;

  // For compatibility, use filtered cart for product IDs and other operations
  const filteredCart = useMemo(
    () => selectedSellerItems || cart || [],
    [selectedSellerItems, cart]
  );
  const PrdId = map(filteredCart, o => o.productId);

  // Extract seller company ID from cart items
  const sellerCompanyId = useMemo((): number | string | null | undefined => {
    if (selectedSellerId && filteredCart && filteredCart.length > 0) {
      // Try to find seller company ID from cart items
      const firstItem = filteredCart[0];
      const extractedId =
        (firstItem as any).sellerCompanyId ||
        (firstItem as any).partnerCompanyId ||
        (firstItem as any).vendorCompanyId ||
        (firstItem as any).partnerId ||
        (firstItem as any).vendorId ||
        selectedSellerId;
      return extractedId as number | string | null | undefined;
    }
    return selectedSellerId as number | string | null | undefined;
  }, [selectedSellerId, filteredCart]);

  const {
    billingDatas: billingAddressData,
    loading: billingAddressDataLoading,
  } = useBilling(userId && companyId ? { userId, companyId } : null);
  const buyerbranchId = billingAddressData[0]?.id as
    | number
    | string
    | null
    | undefined;

  const { defaultSellerAddress, defaultSellerAddressLoading } =
    useDefaultSellerAddress(PrdId, buyerbranchId, sellerCompanyId);

  const { defaultWarehouseAddress, defaultWarehouseAddressLoading } =
    useDefaultWarehouse((defaultSellerAddress[0]?.id as number) || null);

  const { quoteSettings } = useModuleSettings(userData as any);
  const {
    showPfRate,
    isCustomerDateRequired,
    showInsuranceCharges,
    showCashDiscount,
  } = quoteSettings || {};

  const { defaultAccSupportOwner } = useDefaultAccSupportOwner();

  const { SelectedShippingAddressData } = useCurrentShippingAddress(
    userId && companyId ? { userId, companyId } : null
  );

  // Use timestamp as trigger to force refresh on each page load/mount
  const [trigger] = useState(() => Date.now());

  const { defaultpreference, defaultpreferenceLoading } = useDefaultPreference(
    trigger,
    selectedSellerId,
    isSummary
  );
  const defaultpref = defaultpreference as any;
  const pfRate = showPfRate ? defaultpref?.pkgFwdId?.pfPercentage : 0;
  const isBeforeTax = defaultpref?.freightId?.beforeTax;

  const { VDapplied, VolumeDiscountAvailable, ShowVDButton, vdLoading } =
    useCheckVolumeDiscountEnabled(companyId);

  // Pass filtered cart to ensure calculations are for selected seller only
  const cartForCalculations = useMemo(() => {
    // If we have multiple sellers but no selected seller yet, return empty array
    if (hasMultipleSellers && !selectedSellerId) {
      return [];
    }

    // If we have a selected seller, filter the cart
    if (selectedSellerId && cart && cart.length > 0) {
      return cart.filter(
        item =>
          String(
            (item as any).sellerId ||
              (item as any).vendorId ||
              (item as any).partnerId
          ) === String(selectedSellerId)
      );
    }

    // If no selected seller but we have selectedSellerItems from the hook, use those
    if (selectedSellerItems && selectedSellerItems.length > 0) {
      return selectedSellerItems;
    }

    // For single seller scenario, return the full cart
    return cart || [];
  }, [cart, selectedSellerId, selectedSellerItems, hasMultipleSellers]);

  const { productDetails, getBreakup, isInter } = useTaxBreakup(
    cartForCalculations,
    billingAddressData[0],
    defaultWarehouseAddress,
    0,
    isBeforeTax,
    defaultpref?.freightId?.beforeTaxPercentage,
    defaultpref,
    quoteSettings
  );

  const {
    ApprovalRequired,
    isLoading: multipleDiscountLoading,
    cart: products,
    cartValue: fullCartValue,
  } = useMultipleDiscount(
    productDetails,
    pfRate,
    isInter,
    defaultpreference,
    selectedSellerId
  );

  // For summary pages, we should use fullCartValue directly as it already has
  // the correct calculations including cash discount
  const cartValue = useMemo(() => {
    return fullCartValue || {};
  }, [fullCartValue]);

  // Get future stock setting (if available)
  const futureStock = false; // TODO: Get from theme data if needed

  const { registerAddressData } = useRegisterAddress();

  const { defaultBusinessUnit } = useGetDefaultBusinessUnit(
    defaultSellerAddress[0]?.id as string | number | null | undefined,
    productDetails
  );

  // Filter products for the selected seller
  const filteredProducts = useMemo(() => {
    if (selectedSellerId && products) {
      return products.filter(
        item => String((item as any).sellerId) === String(selectedSellerId)
      );
    }
    return products || [];
  }, [selectedSellerId, products]);

  return useMemo(
    () => ({
      initialValues: {
        additionalTerms: isOrder
          ? ""
          : showCashDiscount
            ? `Cash discount ${defaultpref?.cashDiscountTerm?.cashdiscountValue} % is available`
            : "",
        reOrder: false,
        reorderValidityFrom: null,
        reorderValidityTill: null,
        sprDetails: {
          spr: false,
          companyName: "",
          projectName: "",
          priceJustification: "",
          competitorNames: [],
          sprRequestedDiscount: 0,
        },
        isCustomerDateRequired: isCustomerDateRequired || false,
        preferences: {
          ...defaultpref,
          insuranceId: {
            ...defaultpref?.insuranceId,
            insurancePercentage: showInsuranceCharges
              ? defaultpref?.insuranceId?.insurancePercentage
              : null,
            insuranceValue: showInsuranceCharges
              ? defaultpref?.insuranceId?.insuranceValue
              : null,
          },
        },
        defaultpreferenceLoading: defaultpreferenceLoading,
        isPaymentRequired: defaultpref?.paymentTermsId?.mandatory || false,
        pfRate: pfRate || 0,
        isBeforeTax: isBeforeTax || false,
        isInter: isInter || false,
        taxExempted: taxExempted || false,
        taxExemptionId: taxExemptionId || null,
        currency: currency || null,
        futureStock: futureStock,
        userData: userData || null,
        userId: userId || null,
        branchBusinessUnit: defaultBusinessUnit || null,
        companyId: companyId || null,
        products: filteredProducts || [],
        setSellerAddress: defaultSellerAddress[0] || null,
        isSellerInfoLoading: defaultSellerAddressLoading,
        setShippingAddress: SelectedShippingAddressData || null,
        setBillingAddress: billingAddressData[0] || null,
        setRegisterAddress: registerAddressData || null,
        isAddressInfoLoading:
          billingAddressDataLoading || !SelectedShippingAddressData,
        AccOwners: defaultAccSupportOwner || [],
        setWarehouseAddress: defaultWarehouseAddress || null,
        buyerReferenceNumber: null,
        customerRequiredDate: null,
        cartValue: cartValue || {},
        cartValueLoading: multipleDiscountLoading,
        ApprovalRequired: ApprovalRequired || false,
        overallShipping: 0,
        comment: cartComment || null,
        uploadedDocumentDetails: cartAttachments || [],
        getBreakup: getBreakup || [],
        deliveryPlace: defaultWarehouseAddress
          ? (defaultWarehouseAddress as any)?.addressId?.city
          : null,
        VDapplied: VDapplied || false,
        VolumeDiscountAvailable: VolumeDiscountAvailable || false,
        ShowVDButton: ShowVDButton || false,
        vdLoading: vdLoading || false,
        selectedSellerId: selectedSellerId || null,
        selectedSellerPricing: selectedSellerPricing || null,
        isSPRRequested: false,
      },
      isLoading:
        billingAddressDataLoading ||
        defaultSellerAddressLoading ||
        defaultWarehouseAddressLoading ||
        defaultpreferenceLoading ||
        (isOrder ? vdLoading : false) ||
        multipleDiscountLoading,
    }),
    [
      isOrder,
      showCashDiscount,
      defaultpref,
      defaultpreferenceLoading,
      showInsuranceCharges,
      pfRate,
      isBeforeTax,
      isInter,
      taxExempted,
      taxExemptionId,
      currency,
      futureStock,
      userData,
      userId,
      defaultBusinessUnit,
      companyId,
      filteredProducts,
      defaultSellerAddress,
      defaultSellerAddressLoading,
      SelectedShippingAddressData,
      billingAddressData,
      registerAddressData,
      billingAddressDataLoading,
      defaultAccSupportOwner,
      defaultWarehouseAddress,
      cartValue,
      multipleDiscountLoading,
      ApprovalRequired,
      cartComment,
      cartAttachments,
      getBreakup,
      VDapplied,
      VolumeDiscountAvailable,
      ShowVDButton,
      vdLoading,
      selectedSellerId,
      selectedSellerPricing,
      isCustomerDateRequired,
      defaultWarehouseAddressLoading,
    ]
  );
}
