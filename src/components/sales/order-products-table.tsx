"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomPagination } from "@/components/ui/custom-pagination";

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
}

// Format currency
const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "INR ₹0.00";
  return `INR ₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function OrderProductsTable({
  products = [],
  totalCount = 0,
  onExport,
  className,
  itemsPerPage = 5,
}: OrderProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const displayCount = totalCount || products.length;
  const totalPages = Math.ceil(displayCount / itemsPerPage);

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
      {/* Header with Export Button */}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold">
          Products ({displayCount})
        </CardTitle>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-3 px-1 text-xs m-0"
          >
            <Download className="h-2 w-2" />
            EXPORT
          </Button>
        )}
      </CardHeader>

      {/* Products Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium text-primary sticky left-0 bg-muted z-20 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] py-3 before:absolute before:inset-0 before:bg-muted before:-z-10">
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
                    // Use itemTaxableAmount or unitPrice as base price
                    const basePrice =
                      product.itemTaxableAmount ??
                      product.unitPrice ??
                      product.basePrice;
                    const quantity =
                      product.unitQuantity ?? product.quantity ?? 0;
                    const invoicedQty =
                      product.invoiceQuantity ?? product.invoicedQty ?? 0;
                    const amount = product.totalPrice ?? product.amount;
                    const igst =
                      product.tax ??
                      product.igst ??
                      product.igstPercentage ??
                      0;

                    return (
                      <TableRow
                        key={product.itemNo || index}
                        className="group hover:bg-muted/30 h-12"
                      >
                        <TableCell className="sticky left-0 bg-white dark:bg-gray-950 group-hover:bg-muted/30 z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] transition-colors py-3 before:absolute before:inset-0 before:bg-white dark:before:bg-gray-950 before:-z-10">
                          <div className="flex flex-col gap-0.5 relative z-10">
                            <span className="font-medium text-sm">
                              {itemName}
                            </span>
                            {itemCode && (
                              <span className="text-xs text-muted-foreground">
                                {itemCode}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right min-w-[140px] py-3">
                          {formatCurrency(basePrice)}
                        </TableCell>
                        <TableCell className="text-right min-w-[120px] py-3">
                          {`${discountValue}%`}
                        </TableCell>
                        <TableCell className="text-right min-w-[140px] py-3">
                          {formatCurrency(product.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right min-w-[120px] py-3">
                          {formatCurrency(product.usc || 0)}
                        </TableCell>
                        <TableCell className="text-center min-w-[100px] py-3">
                          {quantity}
                        </TableCell>
                        <TableCell className="text-center min-w-[140px] py-3">
                          {invoicedQty}
                        </TableCell>
                        <TableCell className="text-right min-w-[150px] py-3">
                          {formatCurrency(amount)}
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
                    <TableRow key={`empty-${index}`} className="h-12">
                      <TableCell className="sticky left-0 bg-white dark:bg-gray-950 z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] py-3 before:absolute before:inset-0 before:bg-white dark:before:bg-gray-950 before:-z-10">
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
