"use client";

import { useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { words } from "lodash";
import { toast } from "sonner";

// Hooks
import useSummaryDefault from "@/hooks/summary/useSummaryDefault";
import useSummaryForm from "@/hooks/summary/useSummaryForm";
import useSummarySubmission from "@/hooks/summary/useSummarySubmission";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useModuleSettings from "@/hooks/useModuleSettings";
import useCurrencyFactor from "@/hooks/summary/useCurrencyFactor";
import useGetDivision from "@/hooks/summary/useGetDivision";
import useGetChannel from "@/hooks/summary/useGetChannel";
import { useCart } from "@/hooks/useCart";

// Components
import { SalesHeader } from "@/components/sales";
import {
  SummaryNameCard,
  SummaryProductsTable,
  SummaryAddressSection,
  SummaryTermsSection,
  SummaryAdditionalInfo,
  SummaryPriceDetails,
  SummaryActions,
} from "@/components/summary";
import ApplyVolumeDiscountBtn from "@/components/summary/ApplyVolumeDiscountBtn";
import CashDiscountCard from "@/components/sales/CashDiscountCard";
import useCashDiscountHandlers from "@/hooks/useCashDiscountHandlers/useCashDiscountHandlers";
import useGetLatestPaymentTerms from "@/hooks/useGetLatestPaymentTerms/useGetLatestPaymentTerms";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Order Summary Page Component
 * Migrated from buyer-fe/src/components/Summary/OrderSummary/orderSummary.js
 */
export default function OrderSummaryContent() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { emptyCart, emptyCartBySeller } = useCart();
  const { quoteSettings } = useModuleSettings(user);

  const isSummary = true;
  const { initialValues, isLoading } = useSummaryDefault(true, isSummary);

  // Form management
  const formMethods = useSummaryForm(initialValues, isLoading, {
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const {
    watch,
    getValues,
    setValue,
  } = formMethods;

  // Get form values
  const products = watch("products") || [];
  const preferences = watch("preferences") || {};
  useGetDivision(products);
  useGetChannel();
  const { CurrencyFactor } = useCurrencyFactor(user?.companyId);

  // Cash discount logic
  const paymentTermsId = preferences?.paymentTermsId;
  const cashDiscountTerm = preferences?.cashDiscountTerm;
  const cashdiscount = watch("cashdiscount" as any);
  
  // Determine cash discount value
  const cashDiscountValue =
    paymentTermsId?.cashdiscountValue ||
    cashDiscountTerm?.cashdiscountValue ||
    0;
  
  const isCashDiscountApplied = Boolean(cashdiscount || paymentTermsId?.cashdiscount);
  
  // Get latest payment terms if default cash discount is not enabled
  const isDefaultCashDiscountEnabled = Boolean(paymentTermsId?.cashdiscountValue);
  const { latestPaymentTerms, latestPaymentTermsLoading } = useGetLatestPaymentTerms(
    !isDefaultCashDiscountEnabled
  );
  
  // Cash discount handlers
  const { handleCDApply: handleCDApplyBase, handleRemoveCD: handleRemoveCDBase } = useCashDiscountHandlers({
    products,
    setProducts: (updatedProducts: any[]) => {
      setValue("products", updatedProducts);
    },
    isOrder: true,
  });
  
  // Wrapper functions that update form state
  const handleCDApply = (
    cashDiscountValue: number,
    islatestTermAvailable: boolean,
    latestpaymentTerms?: any
  ) => {
    handleCDApplyBase(cashDiscountValue, islatestTermAvailable, latestpaymentTerms);
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

  // Order name state
  const [orderName, setOrderName] = useState(
    user?.displayName ? words(user.displayName)[0] + "'s Order" : "Order"
  );

  // Update order name when display name changes
  useEffect(() => {
    if (user?.displayName) {
      setOrderName(words(user.displayName)[0] + "'s Order");
    }
  }, [user?.displayName]);

  // Submission handler
  const { submitOrder, isSubmitting } = useSummarySubmission(
    true, // isOrder
    getValues,
    formMethods.trigger,
    user?.userId,
    user?.companyId,
    CurrencyFactor || 1
  );

  // Handle order name change
  const handleNameChange = (newName: string) => {
    setOrderName(newName);
    setValue("orderName" as any, newName);
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


  // Handle order submission
  const handlePlaceOrder = async () => {
    // Set order name in form
    setValue("orderName" as any, orderName);

    // Validate form
    const isValid = await formMethods.trigger();
    if (!isValid) {
      toast.error("Please fix the validation errors before proceeding");
      return;
    }

    // Check for empty products
    if (!products || products.length === 0) {
      toast.error("Add line items to place order");
      return;
    }

    // Check for negative prices
    const hasNegativePrice = products.some(
      (product: any) => (product.totalPrice || 0) < 0
    );
    if (hasNegativePrice) {
      toast.error("Some products have negative prices. Please check your cart.");
      return;
    }

    // Submit order
    const orderIdentifier = await submitOrder();
    if (orderIdentifier) {
      // Clear cart for selected seller
      const selectedSellerId = getValues("selectedSellerId");
      if (selectedSellerId) {
        emptyCartBySeller(selectedSellerId);
      } else {
        emptyCart();
      }

      // Redirect to order details or success page
      router.push(`/orders/${orderIdentifier}`);
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
          title={orderName}
          identifier=""
        buttons={[
          {
            label: "CANCEL",
            variant: "outline",
              onClick: handleCancel,
          },
          {
            label: "PLACE ORDER",
            variant: "default",
            onClick: handlePlaceOrder,
              disabled: isSubmitting,
          },
        ]}
      />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Order Name Card */}
          <SummaryNameCard
            name={orderName}
            onNameChange={handleNameChange}
            title="Order Name"
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
              <SummaryTermsSection isOrder={true} />
              <SummaryAdditionalInfo
                isOrder={true}
                showCustomerInfo={true}
                showComments={true}
                showAttachments={true}
                isCustomerDateRequired={quoteSettings?.isCustomerDateRequired}
                requiredIncDate={quoteSettings?.requiredIncDate || 0}
              />
            </div>

            {/* Right Column - Price Details */}
            <div className="lg:col-span-1 space-y-4">
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
                  islatestTermAvailable={!!latestPaymentTerms && !latestPaymentTermsLoading}
                  prevPaymentTerms={paymentTermsId}
                  isOrder={true}
                />
              )}
              <SummaryPriceDetails />
            </div>
          </div>
        </div>

        {/* Mobile Actions - Fixed Bottom */}
        <div className="lg:hidden">
          <SummaryActions
            isOrder={true}
            isSubmitting={isSubmitting}
            onSubmit={handlePlaceOrder}
            onCancel={handleCancel}
          />
        </div>
    </div>
    </FormProvider>
  );
}
