import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ProductDetail } from "@/types/product/product-detail";
import {
  formatLeadTime,
  formatPrice,
  getProductAvailability,
} from "@/utils/product/product-formatter";
import { Box, Building2, Calendar, Hash, Package, Truck } from "lucide-react";
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
    <div className="space-y-6">
      {/* Product Title - Using product_short_description as main title */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {product.product_short_description || product.title}
        </h1>

        {/* Product Meta Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* SKU */}
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">SKU#</span>
            <span className="font-mono text-muted-foreground">
              {product.brand_product_id}
            </span>
          </div>

          {/* Brand Name */}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Brand Name:</span>
            <span className="text-muted-foreground">
              {product.brands_name || product.brand_name || "N/A"}
            </span>
          </div>

          {/* HSN Code */}
          {product.hsn_code && (
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">HSN#</span>
              <span className="font-mono text-muted-foreground">
                {product.hsn_code}
              </span>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Status:</span>
            <Badge
              variant={isInStock ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isInStock && "bg-green-500 hover:bg-green-600"
              )}
            >
              {isInStock ? "In Stock" : "Out of Stock"}
              {hasInventory && isInStock && ` (${totalAvailableQty} available)`}
            </Badge>
          </div>

          {/* Pack Quantity */}
          {product.packaging_qty && (
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Pack of:</span>
              <span className="text-muted-foreground">
                {product.packaging_qty}
              </span>
            </div>
          )}

          {/* MOQ */}
          {product.min_order_quantity && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">MOQ:</span>
              <span className="text-muted-foreground">
                {product.min_order_quantity} {product.unit_of_measure}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Price Section */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-foreground">
            {formatPrice(product.unit_list_price)}
          </span>
          <span className="text-sm text-muted-foreground">
            per {product.unit_of_measure}
          </span>
        </div>
        {product.show_price === false && (
          <p className="text-sm text-muted-foreground">
            Please contact seller for pricing information
          </p>
        )}
      </div>

      <Separator />

      {/* Add to Cart Section - Client Component */}
      <AddToCartSection
        productId={product.product_id}
        productTitle={product.product_short_description || product.title}
        isAvailable={availability.available}
      />

      <Separator />

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
            <Separator />
            <div className="space-y-3">
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

      {/* Other Information Section */}
      {(product.standard_lead_time ||
        product.net_weight ||
        product.packaging_dimension ||
        product.outer_pack_qty ||
        product.unit_of_measure) && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Other Information
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {product.standard_lead_time && (
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium block">Delivery Time</span>
                        <span className="text-muted-foreground">
                          {formatLeadTime(
                            product.standard_lead_time,
                            product.lead_uom
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {product.net_weight && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium block">Weight</span>
                        <span className="text-muted-foreground">
                          {product.net_weight}
                        </span>
                      </div>
                    </div>
                  )}

                  {product.packaging_dimension && (
                    <div className="flex items-start gap-3">
                      <Box className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium block">Dimensions</span>
                        <span className="text-muted-foreground">
                          {product.packaging_dimension}
                        </span>
                      </div>
                    </div>
                  )}

                  {product.outer_pack_qty && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium block">
                          Outer Pack Qty
                        </span>
                        <span className="text-muted-foreground">
                          {product.outer_pack_qty}
                        </span>
                      </div>
                    </div>
                  )}

                  {product.unit_of_measure && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium block">
                          Unit of Measure
                        </span>
                        <span className="text-muted-foreground">
                          {product.unit_of_measure}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
