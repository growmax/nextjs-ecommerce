"use client";

import { useEffect, useCallback } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { BuyerQuoteSummaryValidations } from "@/utils/summary/validation";
import { isEmpty } from "lodash";
import { toast } from "sonner";

/**
 * Hook to manage summary form state and validation
 * Wraps react-hook-form with yup validation schema
 *
 * @param initialValues - Initial form values from useSummaryDefault
 * @param isLoading - Loading state from useSummaryDefault
 * @param options - Optional form configuration
 * @returns Form methods and utilities
 */
export default function useSummaryForm<T extends Record<string, any>>(
  initialValues: T,
  isLoading: boolean,
  options?: {
    mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
    reValidateMode?: "onChange" | "onBlur" | "onSubmit";
  }
) {
  const methods = useForm<T>({
    defaultValues: { ...initialValues, loading: true } as any,
    resolver: yupResolver(BuyerQuoteSummaryValidations) as any,
    mode: options?.mode || "onChange",
    reValidateMode: options?.reValidateMode || "onChange",
  });

  const {
    watch,
    getValues,
    reset,
    setValue,
    handleSubmit,
    formState,
    trigger,
  } = methods;

  // Reset form when initial values are loaded
  useEffect(() => {
    if (!isLoading && initialValues) {
      reset({ ...initialValues, loading: false } as T);
    }
  }, [isLoading, initialValues, reset]);

  /**
   * Scroll to error field helper
   */
  const scrollToErrorField = useCallback((fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  /**
   * Check for form errors and display appropriate messages
   */
  const handleFormErrors = useCallback(
    (errors: any, getValuesFn: UseFormReturn<T>["getValues"]) => {
      if (errors.customerRequiredDate) {
        scrollToErrorField("endCustomerInfo");
        toast.error("Provide Required Delivery Date");
        return;
      }

      if (errors.buyerReferenceNumber) {
        scrollToErrorField("endCustomerInfo");
        toast.error(
          errors.buyerReferenceNumber?.message || "Invalid reference number"
        );
        return;
      }

      if (errors.comment) {
        toast.error(errors.comment?.message || "Invalid comment");
        return;
      }

      if (errors.sprDetails) {
        const sprErrors = errors.sprDetails;
        if (sprErrors.companyName) {
          toast.error(sprErrors.companyName?.message || "Invalid company name");
          return;
        }
        if (sprErrors.projectName) {
          toast.error(sprErrors.projectName?.message || "Invalid project name");
          return;
        }
        if (sprErrors.priceJustification) {
          toast.error(
            sprErrors.priceJustification?.message ||
              "Invalid price justification"
          );
          return;
        }
        if (sprErrors.competitorNames) {
          toast.error(
            sprErrors.competitorNames?.message || "Invalid competitor names"
          );
          return;
        }
      }

      if (errors.products) {
        const products = getValuesFn("products" as any);
        if (Array.isArray(errors.products) && products) {
          errors.products.forEach((item: any, i: number) => {
            if (item) {
              const errorMessages = Object.values(item);
              if (errorMessages.length > 0) {
                const productName =
                  products[i]?.brandProductId ||
                  products[i]?.productName ||
                  `Product ${i + 1}`;
                toast.error(`${errorMessages[0]} for ${productName}`);
              }
            }
          });
        }
        return;
      }
    },
    [scrollToErrorField]
  );

  // Handle form errors
  useEffect(() => {
    if (!isEmpty(formState.errors)) {
      handleFormErrors(formState.errors, getValues);
    }
  }, [formState.errors, getValues, handleFormErrors]);

  return {
    ...methods,
    watch,
    getValues,
    reset,
    setValue,
    handleSubmit,
    formState,
    trigger,
    scrollToErrorField,
  };
}
