import ImageWithFallback from "@/components/ImageWithFallback";
import CartPriceDetails from "@/components/sales/CartPriceDetails";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TypographyMuted } from "@/utils/Typo";
import { Minus, Plus, Trash } from "lucide-react";
import CartSkeleton from "../CartSkeleton";
interface CartProduct {
  productId: number;
  quantity: number;
  productName?: string;
  shortDescription?: string;
  brandName?: string;
  unitPrice?: number;
  unitListPrice?: number;
  discount?: number;
  discountPercentage?: number;
  itemNo: string;
  sellerId?: string;
  img?: string;
  hsnCode?: string;
  packagingQuantity?: number;
  minOrderQuantity?: number;
}

interface SellerPricing {
  grandTotal: number;
  totalValue: number;
  totalTax: number;
  totalLP?: number;
  totalBasicDiscount?: number;
  [key: string]: unknown;
}

interface SellerInfo {
  name: string;
  [key: string]: unknown;
}

interface SellerCart {
  items: CartProduct[];
  seller?: SellerInfo;
  pricing?: SellerPricing;
}

interface CurrencyObj {
  currencyCode: string;
  decimal: string;
  description: string;
  id: number;
  precision: number;
  symbol: string;
  tenantId: number;
  thousand: string;
}
interface CurrentUser {
  currency: CurrencyObj;
  userId: number;
  companyId: number;
  displayName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}
interface SellerCardProps {
  totalCart: number;
  user: CurrentUser[];
  cart: CartProduct[];
  selectedSellerId: string | null;
  onSellerSelect: (sellerId: string) => void;
  selectedSellerPricing: SellerPricing | undefined;
  selectedSellerCart: SellerCart | undefined;
  selectedSellerItems: CartProduct[];
  hasMultipleSellers: boolean;
  isPricingLoading: boolean;
  isLoading: boolean;
  onItemUpdate: (item: CartProduct, quantity: number) => void;
  onItemDelete: (productId: number, itemNo: string, sellerId?: string) => void;
  onClearCart: () => void;
  handleOrder: () => void;
  handleQuote: () => void;
  currency?: CurrencyObj;
  sellerCarts: Record<string, SellerCart>;
  sellerIds: string[];
  onAddProduct: (product: unknown) => Promise<void>;
}

export default function SellerCard({
  totalCart: _totalCart,
  user: _user,
  selectedSellerId: _selectedSellerId,
  onSellerSelect,
  selectedSellerPricing: _selectedSellerPricing,
  isPricingLoading,
  isLoading,
  onItemUpdate,
  onItemDelete,
  onClearCart: _onClearCart,
  handleOrder,
  handleQuote,
  currency,
  sellerCarts,
  sellerIds,
}: SellerCardProps) {
  // Show full skeleton only when cart is initially loading (not when pricing is updating)
  if (isLoading) {
    return <CartSkeleton />;
  }

  // Show empty cart message if no sellers or items
  if (!sellerCarts || !sellerIds || sellerIds.length === 0) {
    return (
      <div className="flex flex-start mt-6 px-4 md:px-8">
        <Card className="w-full md:w-3/5 shadow-lg">
          <CardHeader className="text-lg font-semibold">My Cart (0)</CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Your cart is empty
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Accordion
        type="single"
        collapsible
        {...(sellerIds[0] && { defaultValue: sellerIds[0] })}
        className="space-y-2"
      >
        {sellerIds.map((sellerId: string) => {
          const sellerCart = sellerCarts[sellerId];
          const items = sellerCart?.items || [];
          const sellerName = sellerCart?.seller?.name || "Unknown Seller";
          const sellerPricing = sellerCart?.pricing;

          return (
            <div
              key={sellerId}
              className="border px-4 py-2 rounded-lg bg-white"
            >
              <AccordionItem value={sellerId} className="border-none">
                <AccordionTrigger
                  className="hover:no-underline py-3"
                  onClick={() => onSellerSelect(sellerId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base">{sellerName}</span>
                    <TypographyMuted className="text-sm">
                      ({items.length})
                    </TypographyMuted>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left side - Product List */}
                    <div className="flex-1 space-y-3">
                      {items.map((product: CartProduct, index: number) => (
                        <div
                          key={product.productId || index}
                          className="flex md:flex-row flex-col border rounded-lg overflow-hidden mb-3 bg-white"
                        >
                          {/* Image - full width on mobile, left side on desktop */}
                          <div className="flex-shrink-0 w-full md:w-32 h-48 md:h-auto">
                            <ImageWithFallback
                              src={product.img}
                              alt={
                                product.productName ||
                                product.shortDescription ||
                                "Product"
                              }
                              width={100}
                              height={120}
                              objectFit="cover"
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Content wrapper - below image on mobile, right side on desktop */}
                          <div className="flex-1 flex flex-col md:flex-row min-w-0">
                            {/* Product details section */}
                            <div className="flex-1 flex flex-col justify-between p-3 md:p-4 min-w-0">
                              <div className="flex justify-between gap-2">
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                  <h3 className="font-medium text-sm sm:text-base md:text-sm line-clamp-2 leading-tight">
                                    {product.shortDescription ||
                                      product.productName}
                                  </h3>
                                  <p className="text-xs md:text-sm text-gray-600 truncate">
                                    {product.brandName} • {product.hsnCode}
                                  </p>
                                </div>
                                {/* Delete button - mobile only, shown at top right */}
                                <Button
                                  className="md:hidden h-6 w-6 p-0 flex items-center justify-center bg-transparent text-black hover:bg-gray-100 rounded-lg border-0 flex-shrink-0"
                                  onClick={() =>
                                    onItemDelete(
                                      product.productId,
                                      product.itemNo,
                                      product.sellerId
                                    )
                                  }
                                  disabled={isLoading}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Bottom row: Quantity controls and Price (mobile only) */}
                              <div className="flex items-center justify-between mt-3 md:hidden">
                                {/* Quantity controls */}
                                <div className="flex items-center gap-2.5">
                                  <Button
                                    className="h-8 w-8 p-0 flex items-center justify-center bg-white text-black hover:bg-gray-100 border border-gray-300 rounded-md flex-shrink-0"
                                    onClick={() =>
                                      onItemUpdate(
                                        product,
                                        Math.max(1, product.quantity - 1)
                                      )
                                    }
                                    disabled={
                                      isLoading || product.quantity <= 1
                                    }
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="text-base font-medium min-w-[24px] text-center">
                                    {product.quantity}
                                  </span>
                                  <Button
                                    className="h-8 w-8 p-0 flex items-center justify-center bg-white text-black hover:bg-gray-100 border border-gray-300 rounded-md flex-shrink-0"
                                    onClick={() =>
                                      onItemUpdate(
                                        product,
                                        product.quantity + 1
                                      )
                                    }
                                    disabled={isLoading}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Price - mobile */}
                                {isPricingLoading ? (
                                  <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                                ) : (
                                  <div className="flex flex-col items-end">
                                    <span className="text-[14px] font-semibold text-black whitespace-nowrap">
                                      {currency?.currencyCode === "INR"
                                        ? "₹"
                                        : currency?.currencyCode || "₹"}
                                      {product.unitPrice?.toFixed(2) ||
                                        product.unitListPrice?.toFixed(2)}
                                    </span>
                                    {(product.unitListPrice ?? 0) >
                                      (product.unitPrice ?? 0) && (
                                      <span className="text-[12px] text-gray-400 line-through whitespace-nowrap">
                                        {currency?.currencyCode === "INR"
                                          ? "₹"
                                          : currency?.currencyCode || "₹"}
                                        {product.unitListPrice?.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Quantity controls - desktop only */}
                              <div className="hidden md:flex items-center gap-2 mt-2">
                                <Button
                                  className="h-11 w-11 p-0 flex items-center justify-center bg-white text-black hover:bg-gray-100 border border-gray-300 rounded-lg flex-shrink-0"
                                  onClick={() =>
                                    onItemUpdate(
                                      product,
                                      Math.max(1, product.quantity - 1)
                                    )
                                  }
                                  disabled={isLoading || product.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-base font-medium min-w-[24px] text-center">
                                  {product.quantity}
                                </span>
                                <Button
                                  className="h-11 w-11 p-0 flex items-center justify-center bg-white text-black hover:bg-gray-100 border border-gray-300 rounded-lg flex-shrink-0"
                                  onClick={() =>
                                    onItemUpdate(product, product.quantity + 1)
                                  }
                                  disabled={isLoading}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Right section: Delete button and Price - desktop only */}
                            <div className="hidden md:flex flex-col justify-between items-end p-2.5 sm:p-4 flex-shrink-0">
                              <Button
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0 flex items-center justify-center bg-transparent text-black hover:bg-gray-100 rounded-lg border-0"
                                onClick={() =>
                                  onItemDelete(
                                    product.productId,
                                    product.itemNo,
                                    product.sellerId
                                  )
                                }
                                disabled={isLoading}
                              >
                                <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>

                              {isPricingLoading ? (
                                <div className="h-5 sm:h-7 w-16 sm:w-24 bg-gray-200 animate-pulse rounded"></div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className="text-lg sm:text-base md:text-sm font-semibold text-black whitespace-nowrap">
                                    {currency?.currencyCode === "INR"
                                      ? "₹"
                                      : currency?.currencyCode || "₹"}
                                    {product.unitPrice?.toFixed(2) ||
                                      product.unitListPrice?.toFixed(2)}
                                  </span>
                                  {(product.unitListPrice ?? 0) >
                                    (product.unitPrice ?? 0) && (
                                    <span className="text-lg sm:text-base md:text-sm text-gray-400 line-through whitespace-nowrap mt-0.5">
                                      {currency?.currencyCode === "INR"
                                        ? "₹"
                                        : currency?.currencyCode || "₹"}
                                      {product.unitListPrice?.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right side - Price Details and Actions */}
                    <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
                      {/* Price Details */}
                      {sellerPricing && (
                        <CartPriceDetails
                          cartValue={sellerPricing}
                          {...(currency && { currency })}
                          isPricingLoading={isPricingLoading}
                        />
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          className="w-full bg-black hover:bg-gray-800 text-white py-4 md:py-6 text-sm md:text-base font-medium"
                          onClick={() => {
                            onSellerSelect(sellerId);
                            handleOrder();
                          }}
                          disabled={isPricingLoading}
                        >
                          CREATE ORDER
                        </Button>
                        <Button
                          className="w-full bg-white hover:bg-gray-50 text-black border border-black py-4 md:py-6 text-sm md:text-base font-medium"
                          onClick={() => {
                            onSellerSelect(sellerId);
                            handleQuote();
                          }}
                          disabled={isPricingLoading}
                        >
                          REQUEST QUOTE
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>
    </div>
  );
}
