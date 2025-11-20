"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
// cspell:ignore tabler
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import PricingFormat from "../PricingFormat";

interface SellerPricing {
  totalItems?: number;
  totalLP?: number;
  totalBasicDiscount?: number;
  totalCashDiscount?: number;
  cashDiscountValue?: number;
  totalValue?: number;
  totalTax?: number;
  totalShipping?: number;
  pfRate?: number;
  insuranceCharges?: number;
  grandTotal?: number;
  calculatedTotal?: number;
  roundingAdjustment?: number;
  alreadyPaid?: number;
  hideListPricePublic?: boolean;
  [key: string]: unknown;
}

interface CurrencyProps {
  currencyCode: string;
  decimal: string;
  description?: string;
  id?: number;
  symbol: string;
  tenantId?: number;
  thousand: string;
  precision: number;
}

interface VolumeDiscountDetails {
  subTotal?: number;
  volumeDiscountApplied?: number;
  subTotalVolume?: number;
  overallTax?: number;
  grandTotal?: number;
  calculatedTotal?: number;
  roundingAdjustment?: number;
}

interface TaxBreakup {
  taxName: string;
  [key: string]: unknown;
}

interface PriceDetailsProps {
  cartValue: SellerPricing;
  currencyCode?: string;
  currencySymbol?: string;
  isPricingLoading?: boolean;
  currency?: CurrencyProps;
  isCart?: boolean;
  taxExempted?: boolean;
  isBeforeTax?: boolean;
  getBreakup?: TaxBreakup[];
  VolumeDiscountAvailable?: boolean;
  VDapplied?: boolean;
  VDDetails?: VolumeDiscountDetails;
  roundingAdjustmentEnabled?: boolean;
}

export default function CartPriceDetails({
  cartValue,
  currency,
  isPricingLoading = false,
  isCart = false,
  taxExempted = false,
  isBeforeTax = false,
  getBreakup = [],
  VolumeDiscountAvailable = false,
  VDapplied = false,
  VDDetails = {},
  roundingAdjustmentEnabled = false,
}: PriceDetailsProps) {
  const [taxExpanded, setTaxExpanded] = useState(false);

  // Calculate discount (following reference logic)
  const DISCOUNT =
    typeof cartValue?.totalBasicDiscount === "number"
      ? cartValue.totalBasicDiscount
      : (cartValue?.totalLP || 0) - (cartValue?.totalValue || 0);

  const CASH_DISCOUNT = cartValue?.totalCashDiscount || 0;

  const showListPrice =
    !cartValue?.hideListPricePublic && (cartValue?.totalLP || 0) > 0;
  const showDiscount =
    showListPrice &&
    (VolumeDiscountAvailable && VDapplied
      ? (cartValue?.totalLP || 0) - (VDDetails?.subTotal || 0)
      : DISCOUNT) > 0;

  const shippingCharges = cartValue?.totalShipping || 0;
  const showShippingCharges = !isCart && shippingCharges > 0;

  return (
    <Card className="shadow-lg bg-white gap-0 p-0 w-full">
      <CardHeader className="bg-[#8fbc8f] text-black py-4 px-6 m-0 rounded-t-lg">
        <h2 className="text-lg font-semibold m-0">Price Details</h2>
      </CardHeader>
      <CardContent className="space-y-4 py-6 px-6 overflow-x-auto">
        {/* Total Items */}
        <div className="flex justify-between items-center gap-4 min-w-0">
          <span className="text-sm text-gray-600 flex-shrink-0">
            Total Items
          </span>
          {isPricingLoading ? (
            <Skeleton className="h-5 w-12" />
          ) : (
            <span className="text-sm text-gray-600 flex-shrink-0">
              {cartValue?.totalItems || 0}
            </span>
          )}
        </div>

        {/* Total LP (List Price) - Optional */}
        {showListPrice && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm text-gray-600 flex-shrink-0">
              Total LP
            </span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm flex-shrink-0 break-words text-right">
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={cartValue?.totalLP || 0}
                />
              </span>
            )}
          </div>
        )}

        {/* Discount - Optional */}
        {showDiscount && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm text-green-600 flex-shrink-0">
              Discount
            </span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm text-green-600 flex-shrink-0 break-words text-right">
                -
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={
                    VolumeDiscountAvailable && VDapplied
                      ? (cartValue?.totalLP || 0) - (VDDetails?.subTotal || 0)
                      : DISCOUNT
                  }
                />
              </span>
            )}
          </div>
        )}

        {/* Cash Discount - Optional */}
        {CASH_DISCOUNT > 0 && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm text-green-600 flex-shrink-0">
              Cash Discount{" "}
              {cartValue?.cashDiscountValue
                ? `(${cartValue.cashDiscountValue}%)`
                : ""}
            </span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm text-green-600 flex-shrink-0 break-words text-right">
                -
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={CASH_DISCOUNT}
                />
              </span>
            )}
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between items-center gap-4 min-w-0">
          <span className="text-sm text-gray-600 flex-shrink-0">
            {VolumeDiscountAvailable && VDapplied
              ? "Subtotal (excl. VD)"
              : "Subtotal"}
          </span>
          {isPricingLoading ? (
            <Skeleton className="h-5 w-28" />
          ) : (
            <span className="text-sm flex-shrink-0 break-words text-right">
              <PricingFormat
                {...(currency && { buyerCurrency: currency })}
                value={
                  VDapplied
                    ? VDDetails?.subTotal || 0
                    : cartValue?.totalValue || 0
                }
              />
            </span>
          )}
        </div>

        {/* Volume Discount - Optional */}
        {VolumeDiscountAvailable && VDapplied && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm text-green-600 flex-shrink-0">
              Volume Discount
            </span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm text-green-600 flex-shrink-0 break-words text-right">
                -
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={VDDetails?.volumeDiscountApplied || 0}
                />
              </span>
            )}
          </div>
        )}

        {/* Subtotal (after Volume Discount) */}
        {VolumeDiscountAvailable &&
          VDapplied &&
          (VDDetails?.subTotalVolume || 0) > 0 && (
            <div className="flex justify-between items-center gap-4 min-w-0">
              <span className="text-sm text-black flex-shrink-0">Subtotal</span>
              {isPricingLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="text-sm flex-shrink-0 break-words text-right">
                  <PricingFormat
                    {...(currency && { buyerCurrency: currency })}
                    value={VDDetails?.subTotalVolume || 0}
                  />
                </span>
              )}
            </div>
          )}

        {/* P&F Rate - Optional */}
        {!isCart && (cartValue?.pfRate || 0) > 0 && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm text-gray-600 flex-shrink-0">
              P&F Rate
            </span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm flex-shrink-0 break-words text-right">
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={cartValue?.pfRate || 0}
                />
              </span>
            )}
          </div>
        )}

        {!isCart && <Separator />}

        {/* Shipping Charges (Before Tax) */}
        {isBeforeTax && showShippingCharges && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm text-gray-600 flex-shrink-0">
              Shipping Charges
            </span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm flex-shrink-0 break-words text-right">
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={shippingCharges}
                />
              </span>
            )}
          </div>
        )}

        {/* Taxable Amount - Optional */}
        {/* {!isCart && (
          <div className="flex justify-between items-center">
            <span className="text-lg text-black">Taxable Amount</span>
            {isPricingLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <span className="text-lg">
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={
                    (cartValue?.pfRate || 0) +
                    (VolumeDiscountAvailable && VDapplied
                      ? VDDetails?.subTotalVolume || 0
                      : cartValue?.totalValue || 0) +
                    (isBeforeTax ? shippingCharges : 0)
                  }
                />
              </span>
            )}
          </div>
        )} */}

        {/* Tax with expandable breakdown */}
        <div className="flex justify-between items-center gap-4 min-w-0">
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-sm text-gray-600">Tax</span>
            {!isCart &&
              !taxExempted &&
              getBreakup &&
              getBreakup.length > 0 &&
              !isPricingLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 flex-shrink-0"
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
              )}
          </div>

          {isPricingLoading ? (
            <Skeleton className="h-5 w-28" />
          ) : (
            <span className="text-sm text-gray-600 flex-shrink-0 break-words text-right">
              {taxExempted ? (
                "N/A"
              ) : (
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={
                    VolumeDiscountAvailable && VDapplied
                      ? VDDetails?.overallTax || 0
                      : cartValue?.totalTax || 0
                  }
                />
              )}
            </span>
          )}
        </div>

        {/* Tax Breakdown - Collapsible */}
        {taxExpanded && !taxExempted && getBreakup && getBreakup.length > 0 && (
          <div className="ml-4 space-y-2">
            {getBreakup.map(breakup => (
              <div
                key={`breakup-${breakup.taxName}-${breakup.value}`}
                className="flex justify-between items-center gap-4 min-w-0"
              >
                <span className="text-xs text-gray-600 flex-shrink-0">
                  {breakup.taxName}
                </span>
                {isPricingLoading ? (
                  <Skeleton className="h-3 w-16" />
                ) : (
                  <span className="text-xs text-gray-600 flex-shrink-0 break-words text-right">
                    <PricingFormat
                      {...(currency && { buyerCurrency: currency })}
                      value={
                        (cartValue[`${breakup.taxName}Total`] as number) || 0
                      }
                    />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Shipping Charges (After Tax) */}
        {!isBeforeTax && showShippingCharges && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm text-gray-600 flex-shrink-0">
              Shipping Charges
            </span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm flex-shrink-0 break-words text-right">
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={shippingCharges}
                />
              </span>
            )}
          </div>
        )}

        {/* Insurance Charges - Optional */}
        {!isCart && (cartValue?.insuranceCharges || 0) > 0 && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm text-gray-600 flex-shrink-0">
              Insurance Charges
            </span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm flex-shrink-0 break-words text-right">
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={cartValue?.insuranceCharges || 0}
                />
              </span>
            )}
          </div>
        )}

        <Separator className="my-2" />

        {/* If already paid - show total before deduction */}
        {Boolean(cartValue?.alreadyPaid) && (
          <>
            <div className="flex justify-between items-center gap-4 min-w-0">
              <span className="text-sm flex-shrink-0">Total</span>
              {isPricingLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="text-sm flex-shrink-0 break-words text-right">
                  <PricingFormat
                    {...(currency && { buyerCurrency: currency })}
                    value={
                      (VDapplied
                        ? VDDetails?.grandTotal || 0
                        : cartValue?.grandTotal || 0) +
                      (cartValue?.alreadyPaid || 0)
                    }
                  />
                </span>
              )}
            </div>

            <div className="flex justify-between items-center gap-4 min-w-0">
              <span className="text-sm text-red-600 flex-shrink-0">
                Already Paid
              </span>
              {isPricingLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <span className="text-sm text-red-600 flex-shrink-0 break-words text-right">
                  -
                  <PricingFormat
                    {...(currency && { buyerCurrency: currency })}
                    value={cartValue?.alreadyPaid || 0}
                  />
                </span>
              )}
            </div>
          </>
        )}

        {/* Calculated Total - Optional */}
        {!isCart && roundingAdjustmentEnabled && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm flex-shrink-0">Calculated Total</span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="text-sm flex-shrink-0 break-words text-right">
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={
                    VDapplied
                      ? VDDetails?.calculatedTotal || 0
                      : cartValue?.calculatedTotal || 0
                  }
                />
              </span>
            )}
          </div>
        )}

        {/* Rounding Adjustment - Optional */}
        {!isCart && roundingAdjustmentEnabled && (
          <div className="flex justify-between items-center gap-4 min-w-0">
            <span className="text-sm flex-shrink-0">Rounding Adjustment</span>
            {isPricingLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span
                className={`text-sm flex-shrink-0 break-words text-right ${
                  (VDapplied
                    ? VDDetails?.roundingAdjustment || 0
                    : cartValue?.roundingAdjustment || 0) > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <PricingFormat
                  {...(currency && { buyerCurrency: currency })}
                  value={
                    VDapplied
                      ? VDDetails?.roundingAdjustment || 0
                      : cartValue?.roundingAdjustment || 0
                  }
                />
              </span>
            )}
          </div>
        )}

        {/* Total / To Pay */}
        <div className="flex justify-between items-center pt-2 gap-4 min-w-0">
          <span className="text-base font-semibold text-black flex-shrink-0">
            {cartValue?.alreadyPaid ? "To Pay" : "Total"}
          </span>
          {isPricingLoading ? (
            <Skeleton className="h-7 w-36" />
          ) : (
            <span className="text-base font-semibold text-black flex-shrink-0 break-words text-right">
              <PricingFormat
                {...(currency && { buyerCurrency: currency })}
                value={
                  VDapplied
                    ? VDDetails?.grandTotal || 0
                    : cartValue?.grandTotal || 0
                }
              />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
