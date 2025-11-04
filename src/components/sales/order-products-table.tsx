"use client";

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
import { useState } from "react";
import ImageWithFallback from "../ImageWithFallback";
import PricingFormat from "../PricingFormat";
import type { ProductSearchResult } from "./ProductSearchInput";
import ProductSearchInput from "./ProductSearchInput";

export interface ProductItem {
  itemNo?: number;
  productShortDescription?: string;
  brandProductId?: string;
  itemName?: string;
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
}: OrderProductsTableProps) {
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
    <Card className={cn("", className)}>
      {/* Header */}
      <CardHeader className="py-0 px-4 -my-1 flex flex-row items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-between">
          <CardTitle className="text-base font-semibold py-0 my-0 leading-none -mt-1 -mb-1">
            Products ({displayCount})
          </CardTitle>
          {/* Show search input in edit mode, export button in view mode */}
          {onProductAdd ? (
            <div className="w-full max-w-[calc(28rem-120px)] ml-4">
              <ProductSearchInput
                onProductSelect={onProductAdd}
                placeholder="Search and add products..."
                elasticIndex={elasticIndex}
              />
            </div>
          ) : (
            onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="h-2.5 px-1 py-0! text-[10px] font-medium border-gray-300 text-gray-700 hover:bg-gray-50 -my-1"
              >
                <Download className="h-1 w-1 mr-0.5" />
                EXPORT
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
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium text-primary sticky left-0 bg-muted z-20 min-w-[150px] sm:min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] py-3 before:absolute before:inset-0 before:bg-muted before:-z-10">
                  <span className="relative z-10">ITEMS</span>
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[140px] py-3">
                  BASE PRICE(INR₹)
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[120px] py-3">
                  DISCOUNT(%)
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[140px] py-3">
                  UNIT PRICE(INR₹)
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[120px] py-3">
                  USC(INR₹)
                </TableHead>
                <TableHead className="font-medium text-primary text-center min-w-[100px] py-3">
                  QUANTITY
                </TableHead>
                <TableHead className="font-medium text-primary text-center min-w-[140px] py-3">
                  INVOICED QTY
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[150px] py-3">
                  AMOUNT(INR₹)
                </TableHead>
                <TableHead className="font-medium text-primary text-right min-w-[100px] py-3 pr-5">
                  IGST(%)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="min-h-[240px]">
              {currentPageProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {currentPageProducts.map((product, index) => {
                    // Map API fields to display fields
                    const itemName =
                      product.productShortDescription ||
                      product.itemName ||
                      product.orderName ||
                      "-";
                    const itemCode =
                      product.brandProductId ||
                      product.itemCode ||
                      product.orderIdentifier ||
                      "";
                    const discountValue =
                      product.discount ?? product.discountPercentage ?? 0;
                    // Use unitListPrice as primary source for base price, fallback to other fields
                    const basePrice =
                      product.unitListPrice ??
                      product.itemTaxableAmount ??
                      product.unitPrice ??
                      product.basePrice;
                    const originalQuantity =
                      product.unitQuantity ?? product.quantity ?? 0;
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
                    const amount = product.totalPrice ?? product.amount;
                    const igst =
                      product.tax ??
                      product.igst ??
                      product.igstPercentage ??
                      0;

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
                        className="group hover:bg-muted/30 h-12 border-b"
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
                                <span className="text-white font-semibold text-sm">
                                  {firstLetter}
                                </span>
                              </div>
                            )}
                            {/* Product Name and Code */}
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <span className="font-medium text-sm truncate">
                                {itemName}
                              </span>
                              {itemCode && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {itemCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right min-w-[140px] py-3">
                          <PricingFormat value={basePrice ?? 0} />
                        </TableCell>
                        <TableCell className="text-right min-w-[120px] py-3">
                          {`${discountValue}%`}
                        </TableCell>
                        <TableCell className="text-right min-w-[140px] py-3">
                          <PricingFormat value={product.unitPrice ?? 0} />
                        </TableCell>
                        <TableCell className="text-right min-w-[120px] py-3">
                          <PricingFormat value={product.usc ?? 0} />
                        </TableCell>
                        <TableCell className="text-center min-w-[100px] py-3">
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
                              className="w-20 h-8 text-center text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                              min="0"
                            />
                          ) : (
                            quantity
                          )}
                        </TableCell>
                        <TableCell className="text-center min-w-[140px] py-3">
                          {invoicedQty}
                        </TableCell>
                        <TableCell className="text-right min-w-[150px] py-3">
                          <PricingFormat value={amount ?? 0} />
                        </TableCell>
                        <TableCell className="text-right min-w-[100px] py-3 pr-5">
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
                      className="h-12 border-b-0"
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
                      <TableCell className="min-w-[140px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[120px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[100px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
                      <TableCell className="min-w-[140px] py-3">
                        <div className="h-6"></div>
                      </TableCell>
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
