import ImageWithFallback from "@/components/ImageWithFallback";
import CartPriceDetails from "@/components/sales/CartPriceDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Title } from "@/components/ui/typography";
import { EllipsisVertical, Minus, Plus, School, Trash } from "lucide-react";
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
  onItemDelete: (productId: number, itemNo: string, sellerId?: string | number) => void;
  onClearCart: () => void;
  handleOrder: () => void;
  handleQuote: () => void;
  currency?: CurrencyObj | undefined;
  sellerCarts: Record<string, SellerCart>;
  sellerIds: string[];
  onAddProduct: (product: unknown) => Promise<void>;
}

export default function SellerCard({
  totalCart,
  user: _user,
  selectedSellerId,
  onSellerSelect,
  selectedSellerPricing,
  isPricingLoading,
  isLoading,
  onItemUpdate,
  onItemDelete,
  onClearCart,
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
    <div className="flex flex-col md:flex-row gap-4 mt-6 px-4 md:px-8 min-h-[calc(100vh-100px)] md:h-[calc(100vh-100px)]">
      {/* Left side - Cart Items (Scrollable) */}
      <div className="w-full md:w-3/5 flex-shrink-0 flex flex-col md:h-full">
        <Card className="shadow-lg flex flex-col md:h-full">
          <CardHeader className="text-base md:text-lg font-semibold flex flex-col md:flex-row justify-between md:items-center gap-2 flex-shrink-0">
            <Title>My Cart ({totalCart})</Title>
            {/* <div className="w-full md:w-96">
              <AddMoreProducts />
            </div> */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <EllipsisVertical className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <Button
                  variant="ghost"
                  className="text-black-600 hover:text-black-700"
                  onClick={onClearCart}
                >
                  Clear Cart
                </Button>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent className="flex-1 md:overflow-y-auto space-y-4 pb-0">
            {sellerIds.map((sellerId: string) => {
              const sellerCart = sellerCarts[sellerId];
              const items = sellerCart?.items || [];
              const sellerName = sellerCart?.seller?.name || "Unknown Seller";
              const sellerPricing = sellerCart?.pricing;

              return (
                <div key={sellerId} className="mb-4">
                  <div
                    className={`p-1.5 md:p-2 border-2 rounded-lg transition duration-200 cursor-pointer ${
                      selectedSellerId === sellerId
                        ? "border-black shadow-md bg-blue-50"
                        : "hover:border-black hover:shadow-md"
                    }`}
                    onClick={() => onSellerSelect(sellerId)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-2 md:p-4">
                        <p className="text-sm md:text-base font-semibold">
                          {selectedSellerId === sellerId
                            ? "✓ Selected for Checkout"
                            : "Select for Checkout"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end p-2 md:p-4">
                        <p className="text-xs md:text-sm">
                          {items.length} items
                        </p>
                        {isPricingLoading ? (
                          <div className="h-5 md:h-6 w-20 md:w-24 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <p className="text-sm md:text-base font-semibold">
                            {currency?.currencyCode === "INR"
                              ? "₹"
                              : currency?.currencyCode || "₹"}
                            {sellerPricing?.grandTotal
                              ? sellerPricing.grandTotal.toFixed(2)
                              : items
                                  .reduce(
                                    (sum: number, item: CartProduct) =>
                                      sum +
                                      (item.unitPrice ||
                                        item.unitListPrice ||
                                        0) *
                                        item.quantity,
                                    0
                                  )
                                  .toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Separator />

                    <div>
                      <div className="flex justify-between items-start">
                        <div className="p-2 md:p-4 flex gap-1">
                          <School size={16} className="md:w-5 md:h-5" />
                          <p className="font-medium text-xs md:text-sm">
                            {sellerName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end p-2 md:p-4">
                          <p className="text-xs md:text-sm">
                            {items.length} items
                          </p>
                          {isPricingLoading ? (
                            <div className="h-4 md:h-5 w-16 md:w-20 bg-gray-200 animate-pulse rounded"></div>
                          ) : (
                            <p className="text-xs md:text-sm font-medium">
                              {currency?.currencyCode === "INR"
                                ? "₹"
                                : currency?.currencyCode || "₹"}
                              {items
                                .reduce(
                                  (sum: number, item: CartProduct) =>
                                    sum +
                                    (item.unitPrice ||
                                      item.unitListPrice ||
                                      0) *
                                      item.quantity,
                                  0
                                )
                                .toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Separator />
                      <div className="p-2 md:p-4">
                        <p className="font-medium text-xs md:text-sm mb-2 md:mb-4">
                          Items ({items.length})
                        </p>

                        {/* Product List for this Seller */}
                        {items.map((product: CartProduct, index: number) => (
                          <div
                            key={product.productId || index}
                            className="flex flex-col sm:flex-row border p-2 md:p-4 justify-between items-start mb-2 last:mb-0 rounded-md hover:border-gray-400 gap-2 md:gap-4"
                          >
                            {/* Product Image */}
                            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                              <ImageWithFallback
                                src={product.img}
                                alt={
                                  product.productName ||
                                  product.shortDescription ||
                                  "Product"
                                }
                                width={80}
                                height={80}
                                objectFit="cover"
                              />
                            </div>

                            {/* Left Section */}
                            <div className="flex flex-col flex-1">
                              <div className="text-sm md:text-base font-medium">
                                {product.shortDescription ||
                                  product.productName}
                              </div>
                              <div className="text-xs md:text-sm text-gray-600">
                                Brand: {product.brandName}
                              </div>
                              {product.hsnCode && (
                                <div className="text-xs md:text-sm text-gray-600">
                                  HSN: {product.hsnCode}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {isPricingLoading ? (
                                  <div className="h-5 md:h-6 w-14 md:w-16 bg-gray-200 animate-pulse rounded"></div>
                                ) : (
                                  <>
                                    <span className="font-semibold text-sm md:text-base text-primary">
                                      {currency?.currencyCode === "INR"
                                        ? "₹"
                                        : currency?.currencyCode || "₹"}
                                      {product.unitPrice?.toFixed(2) ||
                                        product.unitListPrice?.toFixed(2)}
                                    </span>
                                    {(product.unitListPrice ?? 0) >
                                      (product.unitPrice ?? 0) && (
                                      <>
                                        <span className="text-xs md:text-sm text-gray-500 line-through">
                                          {currency?.currencyCode === "INR"
                                            ? "₹"
                                            : currency?.currencyCode || "₹"}
                                          {product.unitListPrice?.toFixed(2)}
                                        </span>
                                        <span className="text-xs md:text-sm text-green-600 font-medium">
                                          {(product.discount ?? 0) > 0 ||
                                          (product.discountPercentage ?? 0) > 0
                                            ? `${((product.discount || product.discountPercentage) ?? 0).toFixed(0)}% OFF`
                                            : ""}
                                        </span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-gray-700 text-xs md:text-sm">
                                  Quantity:
                                </span>

                                <Button
                                  className="h-5 md:h-6 w-5 md:w-6 min-w-0 p-0 flex items-center justify-center bg-white text-black
                      hover:bg-gray-100 border border-gray-300 rounded"
                                  onClick={() =>
                                    onItemUpdate(
                                      product,
                                      Math.max(1, product.quantity - 1)
                                    )
                                  }
                                  disabled={isLoading || product.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>

                                <Input
                                  className="w-8 md:w-10 h-5 md:h-6 text-xs md:text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-0"
                                  value={product.quantity}
                                  readOnly
                                />

                                <Button
                                  className="h-5 md:h-6 w-5 md:w-6 min-w-0 p-0 flex items-center justify-center bg-white text-black
                      hover:bg-gray-100 border border-gray-300 rounded"
                                  onClick={() =>
                                    onItemUpdate(product, product.quantity + 1)
                                  }
                                  disabled={isLoading}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Additional Product Info */}
                              {(product.packagingQuantity ||
                                product.minOrderQuantity) && (
                                <div className="flex gap-3 mt-2 pt-2 border-t border-gray-200">
                                  {product.packagingQuantity && (
                                    <span className="text-xs text-gray-600">
                                      Packaging Qty: {product.packagingQuantity}
                                    </span>
                                  )}
                                  {product.minOrderQuantity && (
                                    <span className="text-xs text-gray-600">
                                      Min Order Qty: {product.minOrderQuantity}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right Section */}
                            <div className="flex flex-row sm:flex-col items-center justify-between gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              <Button
                                className="h-8 w-8 min-w-0 p-0 flex items-center justify-center bg-white text-red-500 hover:bg-red-50 border border-red-500 rounded flex-shrink-0 ml-6"
                                onClick={() =>
                                  onItemDelete(
                                    product.productId,
                                    product.itemNo,
                                    product.sellerId
                                  )
                                }
                                disabled={isLoading}
                              >
                                <Trash className="h-4 w-4 sm:h-3 sm:w-3" />
                              </Button>

                              <div className="flex flex-col gap-1 items-end">
                                <span className="text-xs md:text-sm text-gray-600">
                                  Total
                                </span>
                                {isPricingLoading ? (
                                  <div className="h-5 md:h-6 w-14 md:w-16 bg-gray-200 animate-pulse rounded"></div>
                                ) : (
                                  <span className="text-sm md:text-base font-semibold whitespace-nowrap">
                                    {currency?.currencyCode === "INR"
                                      ? "₹"
                                      : currency?.currencyCode || "₹"}
                                    {(
                                      (product.unitPrice ||
                                        product.unitListPrice ||
                                        0) * product.quantity
                                    ).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Right side - Price Details and Actions (Fixed, Non-scrollable) */}
      <div className="w-full md:w-2/5 flex-shrink-0 flex flex-col md:h-full space-y-4">
        {/* Price Details */}
        {selectedSellerPricing && (
          <CartPriceDetails
            cartValue={selectedSellerPricing}
            {...(currency && { currency })}
            isPricingLoading={isPricingLoading}
          />
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-black hover:bg-black text-white py-4 md:py-6 text-sm md:text-base font-medium"
            onClick={handleOrder}
            disabled={isPricingLoading || !selectedSellerId}
          >
            CREATE ORDER
          </Button>
          <Button
            className="w-full bg-white hover:bg-gray-50 text-black border border-black py-4 md:py-6 text-sm md:text-base font-medium"
            onClick={handleQuote}
            disabled={isPricingLoading || !selectedSellerId}
          >
            REQUEST QUOTE
          </Button>
        </div>
      </div>
    </div>
  );
}
