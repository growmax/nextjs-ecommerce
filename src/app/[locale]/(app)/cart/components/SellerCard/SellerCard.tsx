import CartProductCard from "@/components/cart/CartProductCard";
import CartPriceDetails from "@/components/sales/CartPriceDetails";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Package,
} from "lucide-react";
import type { CartItem } from "@/types/calculation/cart";
import CartSkeleton from "../CartSkeleton";
interface CartProduct {
  productId: number;
  quantity: number;
  replacement?: boolean;
  showPrice?: boolean;
  inventoryResponse?: {
    inStock: boolean;
  };
  productName?: string;
  shortDescription?: string;
  brandName?: string;
  unitPrice?: number;
  unitListPrice?: number;
  discount?: number;
  discountPercentage?: number;
  itemNo: string;
  sellerId?: string | number;
  img?: string;
  hsnCode?: string;
  packagingQuantity?: number;
  minOrderQuantity?: number;
  _updated?: number;
  [key: string]: unknown;
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
  description?: string;
  id?: number;
  precision: number;
  symbol: string;
  tenantId?: number;
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
  user: CurrentUser | null;
  cart: CartProduct[];
  selectedSellerId: string | null;
  onSellerSelect: (sellerId: string) => void;
  selectedSellerPricing: SellerPricing | undefined;
  selectedSellerCart: SellerCart | undefined;
  selectedSellerItems: CartProduct[];
  hasMultipleSellers: boolean;
  isPricingLoading: boolean;
  isLoading: boolean;
  onItemUpdate: (item: CartProduct, quantity: number) => Promise<void>;
  onItemDelete: (
    productId: number,
    itemNo: string,
    sellerId?: string | number,
    productName?: string
  ) => void;
  onClearCart: () => void;
  handleOrder: (sellerId: string | number) => void;
  handleQuote: (sellerId: string | number) => void;
  currency?: CurrencyObj | undefined;
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
      <div className="flex flex-col items-center justify-center mt-6 px-4 md:px-8 min-h-[400px]">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-12 pb-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Package className="h-16 w-16 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500">
                Add products to your cart to get started
              </p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header with breadcrumb and continue shopping */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {sellerIds.reduce(
              (total, sellerId) =>
                total + (sellerCarts[sellerId]?.items?.length || 0),
              0
            )}{" "}
            items in your cart
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Button>
      </div>

      <Accordion
        type="single"
        collapsible
        {...(sellerIds[0] && { defaultValue: sellerIds[0] })}
        className="space-y-4"
      >
        {sellerIds.map((sellerId: string) => {
          const sellerCart = sellerCarts[sellerId];
          const items = sellerCart?.items || [];
          const sellerName = sellerCart?.seller?.name || "Unknown Seller";
          const sellerLocation =
            String(items[0]?.sellerLocation || sellerCart?.seller?.location || "");
          const sellerPricing = sellerCart?.pricing;
          return (
            <div
              key={sellerId}
              className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionItem value={sellerId} className="border-none">
                <AccordionTrigger
                  className="hover:no-underline px-6 py-4"
                  onClick={() => onSellerSelect(sellerId)}
                >
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <div className="flex items-center gap-2 md:gap-3 flex-nowrap">
                      <Package className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <span className="font-semibold text-sm lg:text-lg text-gray-900 truncate">
                        {sellerName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="whitespace-nowrap flex-shrink-0"
                      >
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </Badge>
                    </div>
                    {sellerLocation &&
                    sellerLocation !== "Location not specified" ? (
                      <span className="text-sm text-gray-500 ml-2">
                        {sellerLocation}
                      </span>
                    ) : null}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 px-4 md:px-4 lg:px-6 pb-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left side - Product List */}
                    <div className="flex-1 space-y-4">
                      {items.map((product: CartProduct, index: number) => {
                        // Convert CartProduct to CartItem format
                        const cartItem: CartItem = {
                          productId: String(product.productId),
                          itemNo: product.itemNo,
                          quantity: product.quantity,
                          unitPrice: product.unitPrice || 0,
                          totalPrice: (product.unitPrice || 0) * product.quantity,
                          unitListPrice: product.unitListPrice,
                          discountPercentage: product.discountPercentage || product.discount,
                          productName: product.productName,
                          shortDescription: product.shortDescription,
                          sellerId: product.sellerId,
                          sellerName: sellerName,
                          sellerLocation: sellerLocation,
                          img: product.img,
                          showPrice: product.showPrice,
                          priceNotAvailable: !product.showPrice,
                          packagingQuantity: product.packagingQuantity,
                          minOrderQuantity: product.minOrderQuantity,
                          replacement: product.replacement,
                        } as CartItem;

                        return (
                          <div key={product.productId || index} className="relative">
                            {/* Inventory Badge */}
                            {product?.inventoryResponse?.inStock !== false ? (
                              <Badge className="absolute top-2 left-2 z-10 bg-green-500 hover:bg-green-600 text-[8px] px-1.5 py-0.5">
                                In Stock
                              </Badge>
                            ) : (
                              <Badge className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600 text-[8px] px-1.5 py-0.5">
                                Out of Stock
                              </Badge>
                            )}
                            <CartProductCard
                              item={cartItem}
                              isPricingLoading={isPricingLoading}
                              onUpdate={async (quantity) => {
                                await onItemUpdate(product, quantity);
                              }}
                              onDelete={async () => {
                                onItemDelete(
                                  product.productId,
                                  product.itemNo,
                                  product.sellerId
                                );
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Right side - Price Details and Actions */}
                    <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
                      {/* Price Details */}
                      {sellerPricing && (
                        <CartPriceDetails
                          cartValue={sellerPricing}
                          {...(currency && { currency })}
                          isPricingLoading={isPricingLoading}
                        />
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-4">
                        <Button
                          size="lg"
                          className="w-full bg-black hover:bg-gray-900 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                          onClick={() => {
                            onSellerSelect(sellerId);
                            handleOrder(sellerId);
                          }}
                          disabled={isPricingLoading}
                          aria-label="Proceed to create order"
                        >
                          {isPricingLoading ? "Loading..." : "CREATE ORDER"}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 py-6 text-base font-medium hover:border-gray-400 active:scale-[0.98] transition-all"
                          onClick={() => {
                            onSellerSelect(sellerId);
                            handleQuote(sellerId);
                          }}
                          disabled={isPricingLoading}
                          aria-label="Request a quote"
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
