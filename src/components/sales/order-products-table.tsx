"use client";

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
}: OrderProductsTableProps) {
  const displayCount = totalCount || products.length;

  // Sort products by itemNo to ensure correct order
  const sortedProducts = [...products].sort((a, b) => {
    const itemNoA = a.itemNo ?? 0;
    const itemNoB = b.itemNo ?? 0;
    return itemNoA - itemNoB;
  });

  return (
    <Card className={cn("", className)}>
      {/* Header with Export Button */}
      <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-0">
        <CardTitle className="text-sm font-semibold">
          Products ({displayCount})
        </CardTitle>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
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
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                sortedProducts.map((product, index) => {
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
                    product.tax ?? product.igst ?? product.igstPercentage ?? 0;

                  return (
                    <TableRow
                      key={product.itemNo || index}
                      className="group hover:bg-muted/30"
                    >
                      <TableCell className="sticky left-0 bg-white dark:bg-gray-950 group-hover:bg-muted/30 z-10 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] transition-colors py-2 before:absolute before:inset-0 before:bg-white dark:before:bg-gray-950 before:-z-10">
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
                      <TableCell className="text-right min-w-[140px] py-2">
                        {formatCurrency(basePrice)}
                      </TableCell>
                      <TableCell className="text-right min-w-[120px] py-2">
                        {`${discountValue}%`}
                      </TableCell>
                      <TableCell className="text-right min-w-[140px] py-2">
                        {formatCurrency(product.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right min-w-[120px] py-2">
                        {formatCurrency(product.usc || 0)}
                      </TableCell>
                      <TableCell className="text-center min-w-[100px] py-2">
                        {quantity}
                      </TableCell>
                      <TableCell className="text-center min-w-[140px] py-2">
                        {invoicedQty}
                      </TableCell>
                      <TableCell className="text-right min-w-[150px] py-2">
                        {formatCurrency(amount)}
                      </TableCell>
                      <TableCell className="text-right min-w-[100px] py-2 pr-5">
                        {igst}%
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

