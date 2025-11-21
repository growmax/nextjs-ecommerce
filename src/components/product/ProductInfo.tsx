import { Badge } from "@/components/ui/badge";
import { CollapsibleSection } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ProductDetail } from "@/types/product/product-detail";
import {
  formatLeadTime,
  getProductAvailability,
} from "@/utils/product/product-formatter";
import {
  Box,
  Building2,
  Calendar,
  Clock,
  Info,
  Package,
  Ruler,
  ShieldCheck,
  Truck,
  Weight,
} from "lucide-react";
import AddToCartSectionWrapper from "./AddToCartSectionWrapper";
import SpecificationsTable from "./SpecificationsTable";
import VariantInventoryUpdater from "./VariantInventoryUpdater";
import VariantPriceUpdater from "./VariantPriceUpdater";

interface ProductInfoProps {
  product: ProductDetail;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const availability = getProductAvailability(product);
  // product data available for rendering

  return (
    <div className="space-y-8">
      {/* Product Title & Key Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            id="product-title"
            className="text-2xl md:text-3xl font-bold text-foreground leading-tight"
          >
            {product.product_short_description || product.title}
          </h1>
          {product.is_new && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-xs font-semibold py-1 px-3">
              NEW
            </Badge>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {product.brands_name || product.brand_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              SKU: {product.brand_product_id}
            </span>
          </div>
          {product.min_order_quantity && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Min: {product.min_order_quantity}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stock Status Badge - Client Component for Variant Updates */}
      <VariantInventoryUpdater baseInventory={product.inventory || []} />

      {/* Price Section - Client Component for Variant Updates */}
      <VariantPriceUpdater
        basePrice={product.unit_list_price}
        baseMrp={product.unit_mrp}
        showPrice={product.show_price}
        isTaxInclusive={product.is_tax_inclusive}
      />

      {/* Add to Cart Section - Client Component with Variant Support */}
      <AddToCartSectionWrapper
        baseProductId={product.product_id}
        productTitle={product.product_short_description || product.title}
        isAvailable={availability.available}
      />

      {/* Product Information - Collapsible Sections */}
      <div className="space-y-4">
        {/* Basic Information */}
        <CollapsibleSection
          title="Product Information"
          icon={<Info className="h-5 w-5" />}
          defaultOpen={true}
        >
          <div className="space-y-4 text-sm">
            {/* Brand Name */}
            {(product.brands_name || product.brand_name) && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Brand Name:</span>
                  <span className="text-muted-foreground ml-2">
                    {product.brands_name || product.brand_name}
                  </span>
                </div>
              </div>
            )}

            {/* HSN Code */}
            {product.hsn_code && (
              <div className="flex items-center gap-3">
                <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">HSN Code:</span>
                  <span className="font-mono text-muted-foreground ml-2">
                    {product.hsn_code}
                  </span>
                </div>
              </div>
            )}

            {/* Primary UOM */}
            {product.primary_uom && product.primary_uom.trim() !== "" && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Primary UOM:</span>
                  <span className="text-muted-foreground ml-2">
                    {product.primary_uom}
                  </span>
                </div>
              </div>
            )}

            {/* Secondary UOM */}
            {product.secondary_uom && product.secondary_uom.trim() !== "" && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Secondary UOM:</span>
                  <span className="text-muted-foreground ml-2">
                    {product.secondary_uom}
                  </span>
                </div>
              </div>
            )}

            {/* Unit of Measure (Fallback) */}
            {(!product.primary_uom || product.primary_uom.trim() === "") &&
              (!product.secondary_uom || product.secondary_uom.trim() === "") &&
              product.unit_of_measure && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium">Unit of Measure:</span>
                    <span className="text-muted-foreground ml-2">
                      {product.unit_of_measure}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </CollapsibleSection>

        {/* Shipping & Logistics */}
        <CollapsibleSection
          title="Shipping & Logistics"
          icon={<Truck className="h-5 w-5" />}
        >
          <div className="space-y-4 text-sm">
            {/* Delivery Time */}
            {product.standard_lead_time && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Delivery Time:</span>
                  <span className="text-muted-foreground ml-2">
                    {formatLeadTime(
                      product.standard_lead_time,
                      product.lead_uom
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Minimum Order Quantity */}
            {product.min_order_quantity && (
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Min. Order Quantity:</span>
                  <span className="text-muted-foreground ml-2">
                    {product.min_order_quantity} {product.unit_of_measure}
                  </span>
                </div>
              </div>
            )}

            {/* Pack Quantity */}
            {product.packaging_qty && (
              <div className="flex items-center gap-3">
                <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Pack of:</span>
                  <span className="text-muted-foreground ml-2">
                    {product.packaging_qty}
                  </span>
                </div>
              </div>
            )}

            {/* Outer Pack Quantity */}
            {product.outer_pack_qty && (
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Outer Pack Qty:</span>
                  <span className="text-muted-foreground ml-2">
                    {product.outer_pack_qty}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Physical Specifications */}
        <CollapsibleSection
          title="Physical Specifications"
          icon={<Ruler className="h-5 w-5" />}
        >
          <div className="space-y-4 text-sm">
            {/* Weight */}
            {product.net_weight && (
              <div className="flex items-center gap-3">
                <Weight className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Weight:</span>
                  <span className="text-muted-foreground ml-2">
                    {product.net_weight}
                  </span>
                </div>
              </div>
            )}

            {/* Dimensions */}
            {product.packaging_dimension && (
              <div className="flex items-center gap-3">
                <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Dimensions:</span>
                  <span className="text-muted-foreground ml-2">
                    {product.packaging_dimension}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      </div>

      <Separator className="my-6" />

      {/* Description */}
      {product.product_description && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Info className="h-5 w-5" />
            Description
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {product.product_description}
            </p>
          </div>
        </div>
      )}

      {/* Technical Specifications */}
      {product.product_specifications &&
        product.product_specifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Technical Specifications
            </h2>
            <SpecificationsTable
              specifications={product.product_specifications}
            />
          </div>
        )}
    </div>
  );
}
