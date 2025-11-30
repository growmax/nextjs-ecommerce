"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import useModuleSettings from "@/hooks/useModuleSettings";

interface EndCustomerInfoProps {
  isSummaryPage?: boolean;
  isOrder?: boolean;
  showHeader?: boolean;
  isEdit?: boolean;
  isLoading?: boolean;
}

/**
 * EndCustomerInfo component for Required Date and Buyer Reference Number
 * Migrated from buyer-fe/src/components/Summary/Components/EndCustomerInfo/EndCustomerInfo.js
 * 
 * Displays Required Date and Buyer Reference Number fields
 */
export default function EndCustomerInfo({
  isSummaryPage = true,
  isOrder = false,
  showHeader = true,
  isEdit = true,
  isLoading = false,
}: EndCustomerInfoProps) {
  const { quoteSettings } = useModuleSettings();
  const {
    register,
    setValue,
    trigger,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useFormContext();

  const customerRequiredDateFieldName = isSummaryPage
    ? "customerRequiredDate"
    : isOrder
    ? "orderDetails[0].customerRequiredDate"
    : "quotationDetails[0].customerRequiredDate";

  const buyerReferenceNumberFieldName = isSummaryPage
    ? "buyerReferenceNumber"
    : isOrder
    ? "orderDetails[0].buyerReferenceNumber"
    : "quotationDetails[0].buyerReferenceNumber";

  const customerRequiredDate = watch(customerRequiredDateFieldName);
  const buyerReferenceNumber = watch(buyerReferenceNumberFieldName);

  const REQ_INC_DATE = quoteSettings?.requiredIncDate || 0;
  const minDate = addDays(new Date(), REQ_INC_DATE);
  const isCustomerDateRequired = quoteSettings?.isCustomerDateRequired || false;

  // Handle customer required date change
  const handleCustomerReqDate = (date: Date | undefined) => {
    if (date) {
      // Validate the date is not before minimum date
      if (date < minDate) {
        setError(customerRequiredDateFieldName as any, {
          type: "manual",
          message: `Date must be at least ${REQ_INC_DATE} days from today`,
        });
        toast.error(
          `Date must be at least ${REQ_INC_DATE} days from today`
        );
        return;
      } else {
        clearErrors(customerRequiredDateFieldName as any);
      }
    }
    setValue(customerRequiredDateFieldName as any, date);
    trigger(customerRequiredDateFieldName as any);
  };

  // Handle buyer reference number change with XSS validation
  const handleBuyerRefChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    // Check for XSS content and show snackbar + set manual error
    if (value && containsXSS(value)) {
      toast.error("Invalid content detected");
      setError(buyerReferenceNumberFieldName as any, {
        type: "manual",
        message: "Invalid content",
      });
    } else {
      clearErrors(buyerReferenceNumberFieldName as any);
    }

    setValue(buyerReferenceNumberFieldName as any, value);
    await trigger(buyerReferenceNumberFieldName as any);
  };

  const customerDateError = isSummaryPage
    ? errors?.customerRequiredDate
    : isOrder
    ? (errors?.orderDetails as any)?.[0]?.customerRequiredDate
    : (errors?.quotationDetails as any)?.[0]?.customerRequiredDate;

  const buyerRefError = isSummaryPage
    ? errors?.buyerReferenceNumber
    : isOrder
    ? (errors?.orderDetails as any)?.[0]?.buyerReferenceNumber
    : (errors?.quotationDetails as any)?.[0]?.buyerReferenceNumber;

  return (
    <Card className="shadow-sm mt-4" id="endCustomerInfo">
      {showHeader && (
        <>
          <CardHeader className="px-6 py-4 bg-gray-50 rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Customer Information
            </CardTitle>
          </CardHeader>
        </>
      )}
      <CardContent className="px-6 py-4 space-y-4">
        {/* Required Date */}
        <div className="space-y-2">
          <Label
            htmlFor="customerRequiredDate"
            className="text-sm font-medium"
          >
            Required Date {isCustomerDateRequired && isEdit ? "*" : ""}
          </Label>
          {isLoading ? (
            <div className="h-10 bg-gray-200 animate-pulse rounded-md" />
          ) : isEdit ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !customerRequiredDate && "text-muted-foreground",
                    customerDateError && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customerRequiredDate ? (
                    format(new Date(customerRequiredDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    customerRequiredDate
                      ? new Date(customerRequiredDate)
                      : undefined
                  }
                  onSelect={handleCustomerReqDate}
                  disabled={(date) => date < minDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <div className="text-sm font-semibold text-gray-900">
              {customerRequiredDate
                ? format(new Date(customerRequiredDate), "PPP")
                : "-"}
            </div>
          )}
          {customerDateError && (
            <p className="text-sm text-red-500">
              {customerDateError.message as string}
            </p>
          )}
        </div>

        {/* Buyer Reference Number */}
        <div className="space-y-2">
          <Label
            htmlFor="buyerReferenceNumber"
            className="text-sm font-medium"
          >
            Reference Number
          </Label>
          {isLoading ? (
            <div className="h-10 bg-gray-200 animate-pulse rounded-md" />
          ) : isEdit ? (
            <Input
              id="buyerReferenceNumber"
              {...register(buyerReferenceNumberFieldName as any, {
                onChange: handleBuyerRefChange,
              })}
              placeholder="Enter reference number"
              maxLength={35}
              className={cn(buyerRefError && "border-red-500")}
            />
          ) : (
            <div className="text-sm font-semibold text-gray-900">
              {buyerReferenceNumber || "-"}
            </div>
          )}
          {buyerRefError && (
            <p className="text-sm text-red-500">
              {buyerRefError.message as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

