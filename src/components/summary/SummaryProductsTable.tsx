"use client";

import { useFormContext } from "react-hook-form";
import OrderProductsTable, {
  ProductItem,
} from "@/components/sales/order-products-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryProductsTableProps {
  products?: ProductItem[];
  isEditable?: boolean;
  onQuantityChange?: (productId: string, quantity: number) => void;
  editedQuantities?: Record<string, number>;
  elasticIndex?: string;
  className?: string;
}

/**
 * Products table component for summary pages
 * Wraps OrderProductsTable with summary-specific configuration
 *
 * @param products - Array of products to display
 * @param isEditable - Whether quantities can be edited
 * @param onQuantityChange - Callback when quantity changes
 * @param editedQuantities - Map of edited quantities
 * @param elasticIndex - Elasticsearch index for product images
 * @param className - Additional CSS classes
 */
export default function SummaryProductsTable({
  products = [],
  isEditable = true,
  onQuantityChange,
  editedQuantities = {},
  elasticIndex,
  className,
}: SummaryProductsTableProps) {
  const { watch } = useFormContext();
  const formProducts = watch("products") || products;

  // Use form products if available, otherwise use prop products
  const displayProducts = formProducts.length > 0 ? formProducts : products;

  return (
    <Card className={className}>
      <CardHeader className="px-6 -my-5 bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl font-semibold text-gray-900 m-0">
          Products
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {onQuantityChange && (
          <OrderProductsTable
            products={displayProducts}
            isEditable={isEditable}
            onQuantityChange={onQuantityChange}
            editedQuantities={editedQuantities}
            elasticIndex={elasticIndex}
            showInvoicedQty={false}
            itemsPerPage={10}
          />
        )}
        {!onQuantityChange && (
          <OrderProductsTable
            products={displayProducts}
            isEditable={isEditable}
            editedQuantities={editedQuantities}
            elasticIndex={elasticIndex}
            showInvoicedQty={false}
            itemsPerPage={10}
          />
        )}
      </CardContent>
    </Card>
  );
}
