"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import PricingFormat from "@/components/PricingFormat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useProductAssets from "@/hooks/useProductAssets";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ProductSearchResult } from "./ProductSearchInput";
import ProductSearchInput from "./ProductSearchInput";

export interface ProductItem {
  itemNo?: number;
  productShortDescription?: string;
  brandProductId?: string;
  itemCode?: string;
  orderName?: string;
  orderIdentifier?: string;
  itemTaxableAmount?: number;
  basePrice?: number;
  discount?: number;
  discountPercentage?: number;
  unitPrice?: number;
  unitListPrice?: number;
  usc?: number;
  unitQuantity?: number;
  quantity?: number;
  invoiceQuantity?: number;
  invoicedQty?: number;
  totalPrice?: number;
  amount?: number;
  tax?: number;
  igst?: number;
  igstPercentage?: number;
  productTaxes?: Array<{
    compound?: boolean;
    taxName?: string;
    taxPercentage?: number;
  }>;
  [key: string]: unknown;
}

export interface OrderProductsTableProps {
  products?: ProductItem[];
  totalCount?: number;
  onExport?: () => void;
  className?: string;
  itemsPerPage?: number;
  isEditable?: boolean;
  onQuantityChange?: (productId: string, quantity: number) => void;
  editedQuantities?: Record<string, number>;
  onProductAdd?: (product: ProductSearchResult) => void;
  elasticIndex?: string | undefined;
  showInvoicedQty?: boolean;
}

//
export default function OrderProductsTable({
  products = [],
  totalCount = 0,
  onExport,
  className,
  itemsPerPage = 5,
  isEditable = false,
  onQuantityChange,
  editedQuantities = {},
  onProductAdd,
  elasticIndex,
  showInvoicedQty = true,
}: OrderProductsTableProps) {
  const t = useTranslations("components");
  const [currentPage, setCurrentPage] = useState(1);
  const displayCount = totalCount || products.length;
  const totalPages = Math.ceil(displayCount / itemsPerPage);

  // Fetch product assets
  const { productAssets } = useProductAssets(products);

  // Helper function to get product image from assets
  const getProductImage = (product: ProductItem): string | null => {
    // Try to get productId from the product object
    const productId = (product as { productId?: number }).productId;
    if (!productId) return null;

    // Find assets for this product ID
    // The API returns an array of ProductAsset objects, each with productId.id
    const productAssetsForProduct = productAssets.filter(
      (asset: { productId?: { id?: number } }) =>
        asset.productId?.id === productId
    );

    if (productAssetsForProduct.length > 0) {
      // Find default image (isDefault can be 0 or 1, or boolean)
      const defaultImage = productAssetsForProduct.find(
        (asset: { isDefault?: number | boolean }) => {
          const isDefault = asset.isDefault;
          return isDefault === 1 || isDefault === true;
        }
      );
      // Return default image if found, otherwise return first image
      return defaultImage?.source || productAssetsForProduct[0]?.source || null;
    }

    return null;
  };

  // Sort products by itemNo to ensure correct order
  const sortedProducts = [...products].sort((a, b) => {
    const itemNoA = a.itemNo ?? 0;
    const itemNoB = b.itemNo ?? 0;
    return itemNoA - itemNoB;
  });

  // Get products for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageProducts = sortedProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className={cn("gap-0 py-0", className)}>
      {/* Header */}
      <CardHeader className="pt-2 pb-2 px-4 gap-0 flex flex-row items-center justify-between">
        <div className="flex-1 flex items-center justify-between">
          <CardTitle className="text-base font-semibold py-0 my-0 leading-tight -mt-0.5">
            {t("products")} ({displayCount})
          </CardTitle>
          {/* Show search input in edit mode, export button in view mode */}
          {onProductAdd ? (
            <div className="w-full max-w-[calc(28rem-120px)] ml-4">
              <ProductSearchInput
                onProductSelect={onProductAdd}
                placeholder={t("searchAndAddProducts")}
                elasticIndex={elasticIndex}
              />
            </div>
          ) : (
            onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="h-7 px-3 text-xs font-medium"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {t("export")}
              </Button>
            )
          )}
        </div>
      </CardHeader>

      {/* Products Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="font-medium text-primary sticky left-0 bg-muted z-20 min-w-[150px] sm:min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] py-3 before:absolute before:inset-0 before:bg-muted before:-z-10">
                  <span className="relative z-10">{t("items")}</span>
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[140px] py-3">
                  {t("basePrice")}
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[120px] py-3">
                  {t("discount")}
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[120px] py-3">
                  {t("cashDiscount")}
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[140px] py-3">
                  {t("unitPrice")}
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[120px] py-3">
                  {t("usc")}
                </TableHead>
                <TableHead className="font-medium text-primary text-center min-w-[100px] py-3">
                  {t("quantity")}
                </TableHead>
                {showInvoicedQty && (
                  <TableHead className="font-medium text-primary text-center min-w-[140px] py-3">
                    {t("invoicedQty")}
                  </TableHead>
                )}
                <TableHead className="font-medium text-primary text-right min-w-[150px] py-3">
                  {t("amount")}
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[100px] py-3 pr-5">
                  {t("igst")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="min-h-60">
              {currentPageProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showInvoicedQty ? 10 : 9}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("noProductsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {currentPageProducts.map((product, index) => {
                    // Map API fields to display fields
                    const itemName: string =
                      (product.productShortDescription as string) ||
                      (product.itemName as string) ||
                      (product.orderName as string) ||
                      "-";
                    const itemCode: string =
                      (product.brandProductId as string) ||
                      (product.itemCode as string) ||
                      (product.orderIdentifier as string) ||
                      "";
                    const discountValue =
                      product.discount ?? product.discountPercentage ?? 0;
                    // Get cash discount value from product
                    const cashDiscountValue: number =
                      (product.cashdiscountValue ??
                        product.cashDiscountValue ??
                        0) as number;
                    // Use unitListPrice as primary source for base price, fallback to other fields
                    const basePrice =
                      product.unitListPrice ??
                      product.itemTaxableAmount ??
                      product.unitPrice ??
                      product.basePrice;
                    // Check for valid quantity values, prioritizing askedQuantity first
                    let originalQuantity = 0;
                    if (
                      typeof product.askedQuantity === "number" &&
                      product.askedQuantity > 0
                    ) {
                      originalQuantity = product.askedQuantity;
                    } else if (
                      typeof product.unitQuantity === "number" &&
                      product.unitQuantity > 0
                    ) {
                      originalQuantity = product.unitQuantity;
                    } else if (
                      typeof product.quantity === "number" &&
                      product.quantity > 0
                    ) {
                      originalQuantity = product.quantity;
                    }
                    const productId =
                      product.brandProductId ||
                      product.itemCode ||
                      product.orderIdentifier ||
                      "";
                    const quantity =
                      isEditable && editedQuantities[productId] !== undefined
                        ? editedQuantities[productId]
                        : originalQuantity;
                    const invoicedQty =
                      product.invoiceQuantity ?? product.invoicedQty ?? 0;

                    // Calculate amount: use totalPrice if available, otherwise calculate from unitPrice * quantity
                    const unitPriceForCalc = Number(
                      product.unitPrice ?? product.discountedPrice ?? 0
                    );
                    const quantityNum = Number(quantity) || 0;
                    const amount =
                      product.totalPrice ??
                      product.amount ??
                      unitPriceForCalc * quantityNum;

                    // Extract tax percentage from productTaxes array (from API) or fallback to existing fields
                    let igst = 0;
                    if (
                      product.productTaxes &&
                      Array.isArray(product.productTaxes) &&
                      product.productTaxes.length > 0
                    ) {
                      // Get the first tax percentage from productTaxes array
                      const firstTax = product.productTaxes[0];
                      igst = firstTax?.taxPercentage || 0;
                    } else {
                      // Fallback to existing fields
                      igst =
                        product.tax ??
                        product.igst ??
                        product.igstPercentage ??
                        0;
                    }

                    // Get product image
                    const productImage = getProductImage(product);
                    const firstLetter =
                      itemName && itemName !== "-"
                        ? itemName.charAt(0).toUpperCase()
                        : itemCode
                          ? itemCode.charAt(0).toUpperCase()
                          : "?";

                    return (
                      <TableRow
                        key={product.itemNo || index}
                        className="group hover:bg-muted h-12 border-b"
                      >
                        <TableCell className="sticky left-0 bg-white dark:bg-gray-950 group-hover:bg-muted/30 z-10 min-w-[150px] sm:min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] transition-colors py-3 before:absolute before:inset-0 before:bg-white dark:before:bg-gray-950 before:-z-10">
                          <div className="flex items-center gap-3 relative z-10">
                            {/* Product Image or Placeholder */}
                            {productImage ? (
                              <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                                <ImageWithFallback
                                  src={productImage}
                                  alt={itemName}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {firstLetter}
                                </span>
                              </div>
                            )}
                            {/* Product Name and Code */}
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <span className="font-normal text-sm text-gray-900 truncate">
                                {itemName}
                              </span>
                              {itemCode && (
                                <span className="text-xs text-gray-500 truncate">
                                  {itemCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right min-w-[140px] py-3 font-normal text-sm text-gray-700">
                          <PricingFormat value={basePrice ?? 0} />
                        </TableCell>
                        <TableCell className="text-right min-w-[120px] py-3 font-normal text-sm text-gray-700">
                          {`${discountValue}%`}
                        </TableCell>
                        <TableCell className="text-right min-w-[120px] py-3 font-normal text-sm text-gray-700">
                          {cashDiscountValue > 0
                            ? `${cashDiscountValue}%`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right min-w-[140px] py-3 font-normal text-sm text-gray-700">
                          <PricingFormat value={product.unitPrice ?? 0} />
                        </TableCell>
                        <TableCell className="text-right min-w-[120px] py-3 font-normal text-sm text-gray-700">
                          <PricingFormat value={product.usc ?? 0} />
                        </TableCell>
                        <TableCell className="text-center min-w-[100px] py-3 font-normal text-sm text-gray-700">
                          {isEditable ? (
                            <Input
                              type="number"
                              value={quantity}
                              onChange={e => {
                                const inputValue = e.target.value;
                                // Remove leading zeros and handle empty input
                                let newQuantity = 0;
                                if (inputValue !== "") {
                                  // Remove leading zeros (e.g., "033" becomes "33")
                                  const cleanValue =
                                    inputValue.replace(/^0+/, "") || "0";
                                  newQuantity = parseInt(cleanValue) || 0;
                                }
                                onQuantityChange?.(productId, newQuantity);
                              }}
                              onKeyDown={e => {
                                // If current value is "0" and user presses backspace, clear the field
                                if (
                                  e.key === "Backspace" &&
                                  e.currentTarget.value === "0"
                                ) {
                                  e.currentTarget.value = "";
                                  onQuantityChange?.(productId, 0);
                                }
                                // If user types a number when field shows "0", replace it
                                if (
                                  e.key >= "0" &&
                                  e.key <= "9" &&
                                  e.currentTarget.value === "0"
                                ) {
                                  e.currentTarget.value = "";
                                }
                              }}
                              onWheel={e => {
                                e.preventDefault();
                                e.currentTarget.blur();
                              }}
                              onFocus={e => {
                                e.target.addEventListener(
                                  "wheel",
                                  event => {
                                    event.preventDefault();
                                  },
                                  { passive: false }
                                );
                              }}
                              className={`w-20 h-8 text-center text-sm focus:ring-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                                quantity === 0
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              }`}
                              min="0"
                            />
                          ) : (
                            quantity
                          )}
                        </TableCell>
                        {showInvoicedQty && (
                          <TableCell className="text-center min-w-[140px] py-3 font-normal text-sm text-gray-700">
                            {invoicedQty}
                          </TableCell>
                        )}
                        <TableCell className="text-right min-w-[150px] py-3 font-normal text-sm text-gray-700">
                          <PricingFormat value={amount ?? 0} />
                        </TableCell>
                        <TableCell className="text-right min-w-[100px] py-3 pr-5 font-normal text-sm text-gray-700">
                          {igst}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Add empty rows to maintain consistent height when there are fewer than 5 products */}
                  {Array.from({
                    length: Math.max(
                      0,
                      itemsPerPage - currentPageProducts.length
                    ),
                  }).map((_, index) => (
                    <TableRow
                      key={`empty-row-${currentPage}-${startIndex + index}`}
                      className="h-12 border-b-0 hover:bg-transparent"
                    >
                      <TableCell className="sticky left-0 bg-white dark:bg-gray-950 z-10 min-w-[150px] sm:min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] py-3 before:absolute before:inset-0 before:bg-white dark:before:bg-gray-950 before:-z-10">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[140px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[120px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[120px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[140px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[120px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[100px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      {showInvoicedQty && (
                        <TableCell className="min-w-[140px] py-3">
                          <div className="h-6"></div>
                        </TableCell>
                      )}
                      <TableCell className="min-w-[150px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[100px] py-3 pr-5">
                        <div className="h-6"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center py-1.5  border-t">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </Card>
  );
}
