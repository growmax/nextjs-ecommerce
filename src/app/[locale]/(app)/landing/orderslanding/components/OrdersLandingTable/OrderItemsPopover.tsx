"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import OrderDetailsService from "@/lib/api/services/OrderDetailsService/OrderDetailsService";
import { Loader2 } from "lucide-react";

// Product item interface for the popover table
interface ProductItem {
  brandProductId?: string | undefined;
  productId?: string | number | undefined;
  itemNo?: number | undefined;
  askedQuantity?: number | undefined;
  invoicedQuantity?: number | undefined;
}

interface OrderItemsPopoverProps {
  orderIdentifier: string;
  itemCount: number;
  onPopoverClick?: (e: React.MouseEvent) => void;
}

// Cache to store fetched data per orderIdentifier
const dataCache = new Map<string, ProductItem[]>();

export function OrderItemsPopover({
  orderIdentifier,
  itemCount,
  onPopoverClick,
}: OrderItemsPopoverProps) {
  const t = useTranslations("orders");
  const { user } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Fetch product overview when popover opens (with cache)
  useEffect(() => {
    const fetchProductOverview = async () => {
      if (!isOpen || !user?.userId || !user?.companyId) {
        return;
      }

      // Check cache first
      const cachedData = dataCache.get(orderIdentifier);
      if (cachedData) {
        setProducts(cachedData);
        return;
      }

      // Prevent duplicate fetches
      if (hasFetchedRef.current) {
        return;
      }
      hasFetchedRef.current = true;

      setLoading(true);
      setError(null);

      try {
        const response = await OrderDetailsService.getProductOverview({
          orderIdentifier,
          userId: user.userId,
          companyId: user.companyId,
        });

        // Extract product overview from response
        const productOverview = response?.data?.orderProductOverview;
        if (productOverview && Array.isArray(productOverview)) {
          const productItems: ProductItem[] = productOverview.map((product) => ({
            brandProductId: product.brandProductId || "-",
            productId: product.brandProductId || product.itemNo,
            itemNo: product.itemNo,
            askedQuantity: product.askedQuantity || 0,
            invoicedQuantity: product.invoicedQuantity || 0,
          }));

          // Store in cache
          dataCache.set(orderIdentifier, productItems);
          setProducts(productItems);
        }
      } catch (err) {
        console.error("Failed to fetch product overview:", err);
        setError(t("failedToLoadItems"));
        hasFetchedRef.current = false; // Allow retry on error
      } finally {
        setLoading(false);
      }
    };

    fetchProductOverview();
  }, [isOpen, user?.userId, user?.companyId, orderIdentifier, t]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Don't clear products on close - use cached data
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPopoverClick?.(e);
          }}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors cursor-pointer"
        >
          {itemCount}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[332px] p-2"
        onClick={(e) => e.stopPropagation()}
        align="start"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-medium px-2 py-1">
                {t("productId")}
              </TableHead>
              <TableHead className="text-xs font-medium px-2 py-1 text-center">
                <div>Asked</div>
                <div>Qty</div>
              </TableHead>
              <TableHead className="text-xs font-medium px-2 py-1 text-center">
                <div>Invoiced</div>
                <div>Qty</div>
              </TableHead>
              <TableHead className="text-xs font-medium px-2 py-1 text-center">
                <div>Pending</div>
                <div>Qty</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-4">
                  {error}
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-4">
                  {t("noItemsToDisplay")}
                </TableCell>
              </TableRow>
            ) : (
              products.map((prd, index) => (
                <TableRow key={`${prd.productId}-${index}`}>
                  <TableCell className="text-xs px-2 py-1 font-medium">
                    {prd.brandProductId || "-"}
                  </TableCell>
                  <TableCell className="text-xs px-2 py-1 text-center">
                    {prd.askedQuantity ?? 0}
                  </TableCell>
                  <TableCell className="text-xs px-2 py-1 text-center">
                    {prd.invoicedQuantity ?? 0}
                  </TableCell>
                  <TableCell className="text-xs px-2 py-1 text-center">
                    {(prd.askedQuantity ?? 0) - (prd.invoicedQuantity ?? 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </PopoverContent>
    </Popover>
  );
}

export default OrderItemsPopover;
