import ImageWithFallback from "@/components/ImageWithFallback";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { DiscountItem } from "@/lib/api/services/DiscountService/DiscountService";
import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { ProductListItem } from "@/types/product-listing";
import { generateProductSlug } from "@/utils/product/slug-generator";
import { Package } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

/**
 * Transform FormattedProduct to ProductListItem
 */
function transformProduct(product: FormattedProduct): ProductListItem {
  const productId = product.productId || parseInt(product.id || "0", 10) || 0;
  const productName =
    product.productName ||
    product.productShortDescription ||
    product.shortDescription ||
    "Product";
  const productImage =
    (product.productAssetss &&
      Array.isArray(product.productAssetss) &&
      product.productAssetss[0]?.source) ||
    (product.productAssets &&
      Array.isArray(product.productAssets) &&
      product.productAssets[0]?.source) ||
    "/placeholder-product.jpg";
  const productPrice: number =
    (typeof product.unitListPrice === "number" ? product.unitListPrice : 0) ||
    (typeof product.unitPrice === "number" ? product.unitPrice : 0) ||
    (typeof product.b2CUnitListPrice === "number"
      ? product.b2CUnitListPrice
      : 0) ||
    (typeof product.b2CDiscountPrice === "number"
      ? product.b2CDiscountPrice
      : 0) ||
    0;
  const brandName = product.brandName || product.brandsName || "";
  const sku =
    product.brandProductId || product.productIndexName || product.id || "";

  const inventory =
    (product.inventory as Array<{
      availableQty?: number;
      inStock?: boolean;
    }>) || [];
  const totalAvailable = inventory.reduce(
    (sum, inv) => sum + (inv.availableQty || 0),
    0
  );
  // Product is in stock if totalAvailable > 0
  // If no inventory data exists, default to false (out of stock)
  const inStock = totalAvailable > 0;

  return {
    id: productId,
    sku: String(sku),
    title: productName,
    brand: brandName,
    price: productPrice,
    image: productImage,
    images: product.productAssetss?.map(asset => asset.source) || [],
    isNew: false,
    inStock,
    category: "",
  };
}

interface ProductGridServerProps {
  products: FormattedProduct[];
  discountData?: DiscountItem[]; // Optional - passed from client wrapper
  discountLoading?: boolean;
  discountError?: Error | null;
}

/**
 * ProductGridServer Component
 * Server-side rendered product grid for SEO
 * Renders product HTML directly in server component
 */
export function ProductGridServer({
  products,
  discountData,
  discountLoading = false,
  discountError,
}: ProductGridServerProps) {
  if (products.length === 0) {
    return (
      <div className="py-12">
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              No products found
            </h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              We couldn't find any products matching your criteria. Try adjusting your filters or browse other categories.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {products.map(product => {
        const productListItem = transformProduct(product);
        // Generate proper slug with brand name and lowercase product index
        const productSlug = generateProductSlug({
          brand_name: product.brandName || product.brandsName || "product",
          brands_name: product.brandName || product.brandsName || "product",
          title: product.productShortDescription || product.shortDescription || product.productName || "Product",
          product_index_name: String(product.productIndexName || product.id || "unknown"),
          product_id: product.productId || parseInt(product.id || "0", 10),
        });
        // Don't include locale in URL - Link component from i18n/navigation adds it automatically
        const productUrl = `/products/${productSlug}`;

        return (
          <div
            key={productListItem.id}
            className="group bg-card transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 overflow-hidden h-full flex flex-col border border-border/60 rounded-lg"
          >
            <div className="flex flex-col h-full">
              {/* Product Image */}
              <div className="relative w-full bg-muted/30 flex items-center justify-center aspect-square rounded-t-lg overflow-hidden">
                <Link href={productUrl} prefetch={true}>
                  <ImageWithFallback
                    src={productListItem.image}
                    alt={productListItem.title}
                    fill
                    className="object-contain p-3 sm:p-4 transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </Link>
                {productListItem.isNew && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                    New
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 p-2.5 sm:p-3 md:p-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <Link href={productUrl} prefetch={true}>
                    <h3 className="line-clamp-2 text-xs sm:text-sm font-medium leading-snug text-foreground hover:text-primary transition-colors">
                      {productListItem.title}
                    </h3>
                  </Link>

                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {productListItem.brand}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 truncate">
                    {productListItem.sku}
                  </p>

                  {/* Price and Stock Status Row */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <ProductPrice
                      productId={productListItem.id}
                      unitListPrice={productListItem.price}
                      {...(discountData && { discountData })}
                      discountLoading={discountLoading || false}
                      {...(discountError && { discountError })}
                    />
                    {/* Stock Status */}
                    {!productListItem.inStock && (
                      <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium whitespace-nowrap flex-shrink-0">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="pt-2.5 sm:pt-3 mt-auto">
                  <AddToCartButton
                    productId={productListItem.id}
                    productTitle={productListItem.title}
                    isAvailable={productListItem.inStock}
                    {...(discountData && { discountData })}
                    {...(discountLoading !== undefined && { discountLoading })}
                    {...(discountError && { discountError })}
                    {...(typeof (product as any).packaging_qty === "number" && {
                      packagingQty: (product as any).packaging_qty,
                    })}
                    {...(typeof (product as any).min_order_quantity ===
                      "string" && {
                      minOrderQuantity: parseFloat(
                        (product as any).min_order_quantity
                      ),
                    })}
                    {...(typeof (product as any).min_order_quantity ===
                      "number" && {
                      minOrderQuantity: (product as any).min_order_quantity,
                    })}
                    {...(product.unitListPrice !== undefined && {
                      unitListPrice: product.unitListPrice,
                    })}
                    {...(product.productAssetss && {
                      productAssetss: product.productAssetss,
                    })}
                    {...((product.brandsName || product.brandName) && {
                      brandsName: product.brandsName || product.brandName,
                    })}
                    {...((product.productShortDescription ||
                      product.shortDescription) && {
                      productShortDescription:
                        product.productShortDescription ||
                        product.shortDescription,
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
