"use client";

import { words } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";

// Hooks
import useCurrencyFactor from "@/hooks/summary/useCurrencyFactor";
import useGetChannel from "@/hooks/summary/useGetChannel";
import useGetDivision from "@/hooks/summary/useGetDivision";
import useSummaryDefault from "@/hooks/summary/useSummaryDefault";
import useSummaryForm from "@/hooks/summary/useSummaryForm";
import useSummarySubmission from "@/hooks/summary/useSummarySubmission";
import { useCart } from "@/hooks/useCart/useCart";
import useCashDiscountHandlers from "@/hooks/useCashDiscountHandlers/useCashDiscountHandlers";
import { useCurrentUser } from "@/hooks/useCurrentUser/useCurrentUser";
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms";
import useModuleSettings from "@/hooks/useModuleSettings/useModuleSettings";

// Components
import {
  SalesHeader,
  SPRForm,
  SummaryActions,
  SummaryAdditionalInfo,
  SummaryAddressSection,
  SummaryNameCard,
  SummaryPriceDetails,
  SummaryProductsTable,
  SummaryTermsSection,
} from "@/components";
import CashDiscountCard from "@/components/sales/CashDiscountCard";
import ApplyVolumeDiscountBtn from "@/components/summary/ApplyVolumeDiscountBtn";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Quote Summary Page Component
 * Migrated from buyer-fe/src/components/Summary/QuoteSummary/QuoteSummary.js
 */
export default function QuoteSummaryContent() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { emptyCart, emptyCartBySeller } = useCart();
  const { quoteSettings } = useModuleSettings(user);

  const isSummary = true;
  const { initialValues, isLoading } = useSummaryDefault(false, isSummary);

  // Form management
  const formMethods = useSummaryForm(initialValues, isLoading, {
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { watch, getValues, setValue, trigger } = formMethods;

  // Get form values
  const products = watch("products") || [];
  const preferences = watch("preferences") || {};
  const sprDetails = watch("sprDetails") || {};
  const sprEnabled = sprDetails?.spr;
  const setSellerAddress = watch("setSellerAddress");
  const sellerCompanyId = setSellerAddress?.companyId?.id;
  useGetDivision(products);
  useGetChannel();
  const { CurrencyFactor } = useCurrencyFactor(user?.companyId);
  const { quoteValidity } = quoteSettings || {};

  // Cash discount logic
  const paymentTermsId = preferences?.paymentTermsId;
  const cashDiscountTerm = preferences?.cashDiscountTerm;
  const cashdiscount = watch("cashdiscount" as any);

  // Determine cash discount value
  const cashDiscountValue =
    paymentTermsId?.cashdiscountValue ||
    cashDiscountTerm?.cashdiscountValue ||
    0;

  const isCashDiscountApplied = Boolean(
    cashdiscount || paymentTermsId?.cashdiscount
  );

  // Get latest payment terms if default cash discount is not enabled
  const isDefaultCashDiscountEnabled = Boolean(
    paymentTermsId?.cashdiscountValue
  );
  const { latestPaymentTerms, latestPaymentTermsLoading } =
    useGetLatestPaymentTerms(!isDefaultCashDiscountEnabled);

  // Cash discount handlers
  const {
    handleCDApply: handleCDApplyBase,
    handleRemoveCD: handleRemoveCDBase,
  } = useCashDiscountHandlers({
    products,
    setProducts: (updatedProducts: any[]) => {
      setValue("products", updatedProducts);
    },
    isOrder: false,
  });

  // Wrapper functions that update form state
  const handleCDApply = (
    cashDiscountValue: number,
    islatestTermAvailable: boolean,
    latestpaymentTerms?: any
  ) => {
    handleCDApplyBase(
      cashDiscountValue,
      islatestTermAvailable,
      latestpaymentTerms
    );
    if (islatestTermAvailable && latestpaymentTerms) {
      setValue("preferences.paymentTermsId", latestpaymentTerms);
    }
    setValue("cashdiscount" as any, true);
  };

  const handleRemoveCD = (prevTerms?: any) => {
    handleRemoveCDBase(prevTerms);
    setValue("cashdiscount" as any, false);
    if (prevTerms) {
      setValue("preferences.paymentTermsId", prevTerms);
    }
  };

  // Quote name state
  const [quoteName, setQuoteName] = useState(
    user?.displayName ? words(user.displayName)[0] + "'s Quote" : "Quote"
  );

  // Update quote name when display name changes
  useEffect(() => {
    if (user?.displayName) {
      setQuoteName(words(user.displayName)[0] + "'s Quote");
    }
  }, [user?.displayName]);

  // Trigger validation when SPR status changes
  useEffect(() => {
    if (sprEnabled !== undefined) {
      trigger("sprDetails");
    }
  }, [sprEnabled, trigger]);

  // Submission handler
  const { submitQuote, isSubmitting } = useSummarySubmission(
    false, // isOrder
    getValues,
    trigger,
    user?.userId,
    user?.companyId,
    CurrencyFactor || 1,
    quoteValidity || 30
  );

  // Handle quote name change
  const handleNameChange = (newName: string) => {
    setQuoteName(newName);
    setValue("quoteName" as any, newName);
  };

  // Handle quantity change
  const handleQuantityChange = (productId: string, quantity: number) => {
    const currentProducts = getValues("products") || [];
    const updatedProducts = currentProducts.map((product: any) => {
      if (String(product.productId) === String(productId)) {
        return {
          ...product,
          askedQuantity: quantity,
          quantity: quantity,
        };
      }
      return product;
    });
    setValue("products", updatedProducts);
    // Trigger recalculation - this will be handled by useTaxBreakup/useMultipleDiscount
  };

  // Handle quote submission
  const handleRequestQuote = async () => {
    // Set quote name in form
    setValue("quoteName" as any, quoteName);

    // Validate form
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Please fix the validation errors before proceeding");
      return;
    }

    // Check for empty products
    if (!products || products.length === 0) {
      toast.error("Add line items to create a quote");
      return;
    }

    // Check for negative prices
    const hasNegativePrice = products.some(
      (product: any) => (product.totalPrice || 0) < 0
    );
    if (hasNegativePrice) {
      toast.error(
        "Some products have negative prices. Please check your cart."
      );
      return;
    }

    // Submit quote
    const quoteIdentifier = await submitQuote(quoteName);
    if (quoteIdentifier) {
      // Clear cart for selected seller
      const selectedSellerId = getValues("selectedSellerId");
      if (selectedSellerId) {
        emptyCartBySeller(selectedSellerId);
      } else {
        emptyCart();
      }

      // Redirect to quote details or success page
      router.push(`/quotes/${quoteIdentifier}`);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/cart");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <SalesHeader
          title={quoteName}
          identifier=""
          buttons={[
            {
              label: "CANCEL",
              variant: "outline",
              onClick: handleCancel,
            },
            {
              label: "REQUEST FOR QUOTE",
              variant: "default",
              onClick: handleRequestQuote,
              disabled: isSubmitting,
            },
          ]}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Quote Name Card */}
          <SummaryNameCard
            name={quoteName}
            onNameChange={handleNameChange}
            title="Quote Name"
            loading={isLoading}
          />

          {/* Products Table */}
          <SummaryProductsTable
            products={products}
            isEditable={true}
            onQuantityChange={handleQuantityChange}
            editedQuantities={{}}
          />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Address and Terms */}
            <div className="lg:col-span-2 space-y-6">
              <SummaryAddressSection isEditable={true} />
              <SummaryTermsSection isOrder={false} />
              <SummaryAdditionalInfo
                isOrder={false}
                showCustomerInfo={true}
                showComments={true}
                showAttachments={true}
                isCustomerDateRequired={quoteSettings?.isCustomerDateRequired}
                requiredIncDate={quoteSettings?.requiredIncDate || 0}
              />

              {/* SPR Form Section */}
              {quoteSettings?.showSpr && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spr-toggle"
                      checked={sprEnabled || false}
                      onCheckedChange={checked => {
                        setValue("sprDetails.spr", checked === true);
                        trigger("sprDetails");
                      }}
                    />
                    <Label
                      htmlFor="spr-toggle"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Request Special Price (SPR)
                    </Label>
                  </div>

                  {sprEnabled && (
                    <SPRForm
                      sellerCompanyId={sellerCompanyId}
                      customerName={sprDetails?.companyName || ""}
                      projectName={sprDetails?.projectName || ""}
                      competitors={
                        Array.isArray(sprDetails?.competitorNames)
                          ? (sprDetails.competitorNames as string[])
                          : []
                      }
                      priceJustification={sprDetails?.priceJustification || ""}
                      onCustomerNameChange={value => {
                        setValue("sprDetails.companyName" as any, value);
                        trigger("sprDetails");
                      }}
                      onProjectNameChange={value => {
                        setValue("sprDetails.projectName" as any, value);
                        trigger("sprDetails");
                      }}
                      onCompetitorsChange={value => {
                        setValue("sprDetails.competitorNames" as any, value);
                        trigger("sprDetails");
                      }}
                      onPriceJustificationChange={value => {
                        setValue("sprDetails.priceJustification" as any, value);
                        trigger("sprDetails");
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Price Details */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <ApplyVolumeDiscountBtn
                  uploading={isSubmitting}
                  isSummary={true}
                  isLoading={isLoading}
                />
                {cashDiscountValue > 0 && (
                  <CashDiscountCard
                    handleCDApply={handleCDApply}
                    handleRemoveCD={handleRemoveCD}
                    latestpaymentTerms={latestPaymentTerms}
                    isCashDiscountApplied={isCashDiscountApplied}
                    isSummaryPage={true}
                    cashDiscountValue={cashDiscountValue}
                    islatestTermAvailable={
                      !!latestPaymentTerms && !latestPaymentTermsLoading
                    }
                    prevPaymentTerms={paymentTermsId}
                    isOrder={false}
                  />
                )}
                <SummaryPriceDetails />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Actions - Fixed Bottom */}
        <div className="lg:hidden">
          <SummaryActions
            isOrder={false}
            isSubmitting={isSubmitting}
            onSubmit={handleRequestQuote}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </FormProvider>
  );
}
