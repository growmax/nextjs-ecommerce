"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PaymentTerm } from "@/lib/api";

interface CashDiscountCardProps {
  handleCDApply: (
    cashDiscountValue: number,
    islatestTermAvailable: boolean,
    latestpaymentTerms?: PaymentTerm
  ) => void;
  handleRemoveCD: (prevTerms?: PaymentTerm) => void;
  latestpaymentTerms?: PaymentTerm;
  isCashDiscountApplied: boolean;
  isSummaryPage?: boolean;
  isEdit?: boolean;
  cashDiscountValue: number;
  islatestTermAvailable: boolean;
  prevPaymentTerms?: PaymentTerm;
  isOrder?: boolean;
  isQuoteToOrder?: boolean;
  cashdiscount?: boolean;
}

export default function CashDiscountCard({
  handleCDApply,
  handleRemoveCD,
  latestpaymentTerms,
  isCashDiscountApplied,
  isSummaryPage = false,
  isEdit = false,
  cashDiscountValue,
  islatestTermAvailable,
  prevPaymentTerms,
  isOrder: _isOrder = true,
  isQuoteToOrder = false,
  cashdiscount: _cashdiscount,
}: CashDiscountCardProps) {
  const t = useTranslations("components");
  const isContentPage = !isEdit && !isSummaryPage;

  // Only show if there's a cash discount value or in edit/summary mode
  if (!cashDiscountValue && !isEdit && !isSummaryPage) {
    return null;
  }

  // Don't show in quote-to-order if no previous terms
  if (isQuoteToOrder && !prevPaymentTerms?.cashdiscountValue) {
    return null;
  }

  const getTitle = () => {
    if (isContentPage) {
      return t("congratulations");
    }
    if (isCashDiscountApplied) {
      return t("thankYou");
    }
    return t("payNowAndSave");
  };

  const getMessage = () => {
    if (isContentPage) {
      return t("cashDiscountApplied", { value: cashDiscountValue });
    }
    if (!isCashDiscountApplied) {
      return t("getCashDiscount", { value: cashDiscountValue });
    }
    return t("cashDiscountApplied", { value: cashDiscountValue });
  };

  return (
    <Card className="rounded-lg bg-green-100 border-green-200 mt-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">
              {getTitle()}
            </h4>
            <p className="text-xs text-gray-600">{getMessage()}</p>
          </div>

          {!isQuoteToOrder && (
            <div className="flex items-center justify-center ml-2">
              {!isContentPage && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    !isCashDiscountApplied
                      ? handleCDApply(
                          cashDiscountValue,
                          islatestTermAvailable,
                          latestpaymentTerms
                        )
                      : handleRemoveCD(prevPaymentTerms)
                  }
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isCashDiscountApplied ? t("remove") : t("apply")}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
