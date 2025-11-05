import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ProductDetail } from "@/types/product/product-detail";
import {
  formatLeadTime,
  formatPrice,
  getProductAvailability,
} from "@/utils/product/product-formatter";
import { Box, Building2, Calendar, Package, Truck } from "lucide-react";
import AddToCartSection from "./AddToCartSection";

interface ProductInfoProps {
  product: ProductDetail;
  locale: string;
}

export default function ProductInfo({
  product,
  locale: _locale,
}: ProductInfoProps) {
  const availability = getProductAvailability(product);

  // Check inventory status
  const hasInventory = product.inventory && product.inventory.length > 0;
  const totalAvailableQty = hasInventory
    ? product.inventory.reduce(
        (sum, inv) => sum + (inv.availableQuantity || 0),
        0
      )
    : 0;
  const isInStock = hasInventory && product.inventory.some(inv => inv.inStock);

  return (
    <div className="space-y-5">
      {/* Brand/Store Name */}
      {(product.brands_name || product.brand_name) && (
        <div className="text-sm">
          <span className="text-primary hover:underline cursor-pointer">
            Visit {product.brands_name || product.brand_name} Store
          </span>
        </div>
      )}

      {/* Product Title */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {product.product_short_description || product.title}
        </h1>
        <div className="text-sm text-muted-foreground">
          SKU# {product.brand_product_id}
        </div>
      </div>

      {/* Stock Status Badge */}
      <div>
        <Badge
          variant={isInStock ? "default" : "destructive"}
          className={cn(
            "text-sm py-1.5 px-3 font-medium",
            isInStock
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          )}
        >
          {isInStock ? "✓ In Stock" : "✕ Out of Stock"}
        </Badge>
        {hasInventory && isInStock && totalAvailableQty > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            ({totalAvailableQty} available)
          </span>
        )}
      </div>

      {/* Product Information List */}
      <div className="space-y-3 text-sm">
        {/* Brand Name */}
        {(product.brands_name || product.brand_name) && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">Brand Name:</span>
            <span className="text-muted-foreground">
              {product.brands_name || product.brand_name}
            </span>
          </div>
        )}

        {/* HSN Code */}
        {product.hsn_code && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">HSN#</span>
            <span className="font-mono text-muted-foreground">
              {product.hsn_code}
            </span>
          </div>
        )}

        {/* Delivery Time */}
        {product.standard_lead_time && (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">Delivery Time:</span>
            <span className="text-muted-foreground">
              {formatLeadTime(product.standard_lead_time, product.lead_uom)}
            </span>
          </div>
        )}

        {/* Minimum Order Quantity */}
        {product.min_order_quantity && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">Min. Order Quantity:</span>
            <span className="text-muted-foreground">
              {product.min_order_quantity} {product.unit_of_measure}
            </span>
          </div>
        )}

        {/* Pack Quantity */}
        {product.packaging_qty && (
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">Pack of:</span>
            <span className="text-muted-foreground">
              {product.packaging_qty}
            </span>
          </div>
        )}

        {/* Weight */}
        {product.net_weight && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">Weight:</span>
            <span className="text-muted-foreground">{product.net_weight}</span>
          </div>
        )}

        {/* Dimensions */}
        {product.packaging_dimension && (
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">Dimensions:</span>
            <span className="text-muted-foreground">
              {product.packaging_dimension}
            </span>
          </div>
        )}

        {/* Outer Pack Quantity */}
        {product.outer_pack_qty && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">Outer Pack Qty:</span>
            <span className="text-muted-foreground">
              {product.outer_pack_qty}
            </span>
          </div>
        )}

        {/* Unit of Measure */}
        {product.unit_of_measure && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">Unit of Measure:</span>
            <span className="text-muted-foreground">
              {product.unit_of_measure}
            </span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">
            {formatPrice(product.unit_list_price)}
          </span>
        </div>
        {product.show_price === false && (
          <p className="text-sm text-muted-foreground">
            Please contact seller for pricing information
          </p>
        )}
      </div>

      {/* Add to Cart Section - Client Component */}
      <AddToCartSection
        productId={product.product_id}
        productTitle={product.product_short_description || product.title}
        isAvailable={availability.available}
      />

      <Separator className="my-6" />

      {/* Description */}
      {product.product_description && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            {product.product_description}
          </p>
        </div>
      )}

      {/* Specifications Table */}
      {product.product_specifications &&
        product.product_specifications.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Technical Specifications
              </h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {product.product_specifications.map((spec, index) => (
                      <tr
                        key={spec.id || index}
                        className={cn(
                          "border-b last:border-b-0",
                          index % 2 === 0 ? "bg-muted/30" : "bg-background"
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-sm w-1/3">
                          {spec.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {spec.value}
                          {spec.unit && (
                            <span className="ml-1">{spec.unit}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
