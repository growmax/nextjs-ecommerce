"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { IconChevronDown, IconShoppingCart } from "@tabler/icons-react";
import { useState } from "react";

interface CartPriceDetailsProps {
  totalItems?: number;
  totalLP?: number;
  discount?: number;
  subtotal?: number;
  taxableAmount?: number;
  tax?: number;
  total?: number;
  currency?: string;
  igst?: number; // added for IGST
}

export default function CartPriceDetails({
  totalItems = 1,
  totalLP = 123456.0,
  discount = 61728.0,
  subtotal = 61728.0,
  taxableAmount = 61728.0,
  tax = 11111.04,
  total = 72839.04,
  currency = "INR ₹",
  igst = 11111.04, // default IGST
}: CartPriceDetailsProps) {
  const [taxExpanded, setTaxExpanded] = useState(false);

  return (
    <div id="CartPriceDetails" className="w-full max-w-sm lg:max-w-full">
      <Card className="shadow-sm !py-0 !gap-0">
        <CardHeader className="px-4 py-2 bg-green-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-800 !m-0">
            <IconShoppingCart className="h-6 w-6" />
            Price Details
          </CardTitle>
        </CardHeader>
        <Separator />

        <CardContent className="pt-4 pb-4 px-4 space-y-3">
          {/* Total Items */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h5 className="text-sm font-medium">Total Items</h5>
            </div>
            <div className="text-right">
              <h5 className="text-sm font-medium">{totalItems}</h5>
            </div>
          </div>

          {/* Total LP */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h5 className="text-sm font-medium text-gray-700">Total LP</h5>
            </div>
            <div className="text-right">
              <h5 className="text-sm font-medium text-gray-700">
                {currency}
                {totalLP.toFixed(2)}
              </h5>
            </div>
          </div>

          {/* Discount */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h5 className="text-sm font-medium text-green-600">Discount</h5>
            </div>
            <div className="text-right">
              <h5 className="text-sm font-medium text-green-600">
                -{currency}
                {discount.toFixed(2)}
              </h5>
            </div>
          </div>

          {/* Subtotal */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h6 className="text-xs font-medium text-gray-600">Subtotal</h6>
            </div>
            <div className="text-right">
              <h6 className="text-xs font-medium text-gray-600">
                {currency}
                {subtotal.toFixed(2)}
              </h6>
            </div>
          </div>

          <Separator />

          {/* Taxable Amount */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h6 className="text-xs font-medium text-gray-800">
                Taxable Amount
              </h6>
            </div>
            <div className="text-right">
              <h6 className="text-xs font-medium text-gray-800">
                {currency}
                {taxableAmount.toFixed(2)}
              </h6>
            </div>
          </div>

          {/* Tax + expand button */}
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-700">Tax</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => setTaxExpanded(!taxExpanded)}
                aria-expanded={taxExpanded}
                aria-label="show more"
              >
                <IconChevronDown
                  className={`h-3 w-3 transition-transform ${
                    taxExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-700">
                {currency}
                {tax.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Collapsible Tax Breakdown */}
          {taxExpanded && (
            <div className="ml-4 mt-2 space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-xs text-gray-600">IGST</p>
                <p className="text-xs text-right text-gray-600">
                  {currency}
                  {igst.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <Separator className="border-gray-300" />

          {/* Total */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h4 className="text-base font-bold">Total</h4>
            </div>
            <div className="text-right">
              <h4 className="text-base font-semibold">
                {currency}
                {total.toFixed(2)}
              </h4>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
