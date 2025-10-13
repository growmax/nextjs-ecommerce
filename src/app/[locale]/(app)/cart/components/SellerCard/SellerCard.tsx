import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, School, Trash } from "lucide-react";
import CartSkeleton from "../CartSkeleton";
import PriceDetails from "../PriceDetails";

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

interface Currency {
  currencyCode?: string;
  [key: string]: unknown;
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
  minimumOrderValue?: number;
  minimumQuoteValue?: number;
  currency: Currency;
  sellerCarts: Record<string, SellerCart>;
  sellerIds: string[];
}

export default function SellerCard({
  totalCart,
  user,
  selectedSellerId,
  onSellerSelect,
  selectedSellerPricing,
  isPricingLoading,
  isLoading,
  onItemUpdate,
  onItemDelete,
  handleOrder,
  handleQuote,
  currency,
  sellerCarts,
  sellerIds,
}: SellerCardProps) {
  // Show skeleton while loading or pricing is loading
  if (Boolean(user) === false || isLoading || isPricingLoading) {
    return <CartSkeleton />;
  }
  // Show empty cart message if no sellers or items
  if (!sellerCarts || !sellerIds || sellerIds.length === 0) {
    return (
      <div className="flex flex-start mt-6 px-8">
        <Card className="w-3/5 shadow-lg">
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
    <div className="flex gap-4 mt-6 px-8">
      {/* Left side - Cart Items */}
      <Card className="w-3/5 shadow-lg">
        <CardHeader className="text-lg font-semibold">
          My Cart ({totalCart})
        </CardHeader>
        <CardContent>
          {sellerIds.map((sellerId: string) => {
            const sellerCart = sellerCarts[sellerId];
            const items = sellerCart?.items || [];
            const sellerName = sellerCart?.seller?.name || "Unknown Seller";
            const sellerPricing = sellerCart?.pricing;

            return (
              <div key={sellerId} className="mb-4">
                <div
                  className={`p-2 border-2 rounded-lg transition duration-200 cursor-pointer ${
                    selectedSellerId === sellerId
                      ? "border-black shadow-md bg-blue-50"
                      : "hover:border-black hover:shadow-md"
                  }`}
                  onClick={() => onSellerSelect(sellerId)}
                >
                  <div className="flex justify-between items-start">
                    <div className="p-4">
                      <p className="font-semibold">
                        {selectedSellerId === sellerId
                          ? "✓ Selected for Checkout"
                          : "Select for Checkout"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end p-4">
                      <p className="text-base">{items.length} items</p>
                      <p className="text-base font-semibold">
                        {currency?.currencyCode === "INR"
                          ? "₹"
                          : currency?.currencyCode || "₹"}{" "}
                        {isPricingLoading
                          ? "Loading..."
                          : sellerPricing?.grandTotal
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
                    </div>
                  </div>
                  <Separator />

                  <div>
                    <div className="flex justify-between items-start">
                      <div className="p-4 flex gap-1">
                        <School size={20} />
                        <p className="font-medium text-sm">{sellerName}</p>
                      </div>
                      <div className="flex flex-col items-end p-4">
                        <p className="text-sm">{items.length} items</p>
                        <p className="text-sm font-medium">
                          {currency?.currencyCode === "INR"
                            ? "₹"
                            : currency?.currencyCode || "₹"}
                          {items
                            .reduce(
                              (sum: number, item: CartProduct) =>
                                sum +
                                (item.unitPrice || item.unitListPrice || 0) *
                                  item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="p-4">
                      <p className="font-medium text-sm mb-4">
                        Items ({items.length})
                      </p>

                      {/* Product List for this Seller */}
                      {items.map((product: CartProduct, index: number) => (
                        <div
                          key={product.productId || index}
                          className="flex border p-4 justify-between items-start mb-2 rounded-md hover:border-gray-400"
                        >
                          {/* Left Section */}
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {product.shortDescription || product.productName}
                            </div>
                            <div className="text-sm text-gray-600">
                              Brand: {product.brandName}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-semibold text-base text-primary">
                                {currency?.currencyCode === "INR"
                                  ? "₹"
                                  : currency?.currencyCode || "₹"}
                                {product.unitPrice?.toFixed(2) ||
                                  product.unitListPrice?.toFixed(2)}
                              </span>
                              {(product.unitListPrice ?? 0) >
                                (product.unitPrice ?? 0) && (
                                <>
                                  <span className="text-sm text-gray-500 line-through">
                                    {currency?.currencyCode === "INR"
                                      ? "₹"
                                      : currency?.currencyCode || "₹"}
                                    {product.unitListPrice?.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-green-600 font-medium">
                                    {(product.discount ?? 0) > 0 ||
                                    (product.discountPercentage ?? 0) > 0
                                      ? `${((product.discount || product.discountPercentage) ?? 0).toFixed(0)}% OFF`
                                      : ""}
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-gray-700 text-sm">
                                Quantity:
                              </span>

                              <Button
                                className="h-6 w-6 min-w-0 p-0 flex items-center justify-center bg-white text-black
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
                                className="w-10 h-6 text-center border border-gray-300 rounded focus:outline-none focus:ring-0"
                                value={product.quantity}
                                readOnly
                              />

                              <Button
                                className="h-6 w-6 min-w-0 p-0 flex items-center justify-center bg-white text-black
                      hover:bg-gray-100 border border-gray-300 rounded"
                                onClick={() =>
                                  onItemUpdate(product, product.quantity + 1)
                                }
                                disabled={isLoading}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Right Section */}
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              className="h-6 w-6 min-w-0 p-0 flex items-center justify-center bg-white text-red-500
                    hover:bg-red-50 border border-gray-300 rounded"
                              onClick={() =>
                                onItemDelete(
                                  product.productId,
                                  product.itemNo,
                                  product.sellerId
                                )
                              }
                              disabled={isLoading}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                            <div className="flex flex-col gap-1 items-end">
                              <span className="text-sm text-gray-600">
                                Total
                              </span>
                              <span className="text-base font-semibold">
                                {currency?.currencyCode === "INR"
                                  ? "₹"
                                  : currency?.currencyCode || "₹"}
                                {(
                                  (product.unitPrice ||
                                    product.unitListPrice ||
                                    0) * product.quantity
                                ).toFixed(2)}
                              </span>
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

      {/* Right side - Price Details and Actions */}
      <div className="w-2/5 space-y-4">
        {/* Price Details */}
        {selectedSellerPricing && (
          <PriceDetails
            cartValue={selectedSellerPricing}
            currencyCode={currency?.currencyCode || "INR"}
            currencySymbol={
              currency?.currencyCode === "INR"
                ? "₹"
                : currency?.currencyCode || "₹"
            }
            isPricingLoading={isPricingLoading}
          />
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-black hover:bg-purple-700 text-white py-6 text-base font-medium"
            onClick={handleOrder}
            disabled={isPricingLoading || !selectedSellerId}
          >
            CREATE ORDER
          </Button>
          <Button
            className="w-full bg-white hover:bg-gray-50 text-black border border-black py-6 text-base font-medium"
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
