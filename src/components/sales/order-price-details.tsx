"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TypographyMuted } from "@/utils/Typo";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface TaxDetail {
  name: string;
  value: number;
}

interface OrderPriceDetailsProps {
  totalItems?: number;
  totalLP?: number;
  discount?: number;
  subtotal?: number;
  taxableAmount?: number;
  tax?: number;
  taxDetails?: TaxDetail[];
  total?: number;
  currency?: string;
}

export default function OrderPriceDetails({
  totalItems = 0,
  totalLP = 0,
  discount = 0,
  subtotal = 0,
  taxableAmount = 0,
  tax = 0,
  taxDetails = [],
  total = 0,
  currency = "INR ₹",
}: OrderPriceDetailsProps) {
  const hasDiscount = discount > 0;
  const [taxExpanded, setTaxExpanded] = useState(false);

  return (
    <Card className="shadow-sm bg-white p-0! m-0!">
      <CardHeader className="px-4 py-2 bg-green-50 rounded-t-lg">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Price Details
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-2 space-y-3 pt-0! pb-4">
        {/* Total Items */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <TypographyMuted>Total Items</TypographyMuted>
          </div>
          <div className="text-right">
            <TypographyMuted>{totalItems}</TypographyMuted>
          </div>
        </div>

        {/* Total LP */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <TypographyMuted>Total LP</TypographyMuted>
          </div>
          <div className="text-right">
            <TypographyMuted>
              {currency}
              {totalLP.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TypographyMuted>
          </div>
        </div>

        {/* Discount - only show if there's a discount */}
        {hasDiscount && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h5 className="text-sm font-normal text-green-600">Discount</h5>
            </div>
            <div className="text-right">
              <h5 className="text-sm font-normal text-green-600">
                -{currency}
                {discount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h5>
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <h6 className="text-sm font-semibold text-gray-800">Subtotal</h6>
          </div>
          <div className="text-right">
            <h6 className="text-sm font-semibold text-gray-800">
              {currency}
              {hasDiscount
                ? (totalLP - discount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : subtotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </h6>
          </div>
        </div>

        <Separator />

        {/* Taxable Amount */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <h6 className="text-sm font-semibold text-gray-800">
              Taxable Amount
            </h6>
          </div>
          <div className="text-right">
            <h6 className="text-sm font-semibold text-gray-800">
              {currency}
              {taxableAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h6>
          </div>
        </div>

        {/* Tax + expand button */}
        <div className="grid grid-cols-2 gap-2 items-center">
          <div className="flex items-center gap-1">
            <TypographyMuted>Tax</TypographyMuted>
            {taxDetails.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => setTaxExpanded(!taxExpanded)}
                aria-expanded={taxExpanded}
                aria-label="show more"
              >
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    taxExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}
          </div>
          <div className="text-right">
            <TypographyMuted>
              {currency}
              {tax.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </TypographyMuted>
          </div>
        </div>

        {/* Collapsible Tax Breakdown */}
        {taxExpanded && taxDetails.length > 0 && (
          <div className="ml-4 mt-2 space-y-1">
            {taxDetails.map((taxDetail, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <TypographyMuted>{taxDetail.name}</TypographyMuted>
                <div className="text-right">
                  <TypographyMuted>
                    {currency}
                    {taxDetail.value.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TypographyMuted>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <h4 className="text-lg font-bold text-gray-800">Total</h4>
          </div>
          <div className="text-right">
            <h4 className="text-lg font-bold text-gray-800">
              {currency}
              {total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
