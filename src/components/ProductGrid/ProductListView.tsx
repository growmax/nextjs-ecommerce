import ImageWithFallback from "@/components/ImageWithFallback";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Card, CardContent } from "@/components/ui/card";
import { DiscountItem } from "@/lib/api/services/DiscountService/DiscountService";
import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { ProductListItem } from "@/types/product-listing";
import { Package } from "lucide-react";
import Link from "next/link";
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

  // Extract stock status from inventory array
  const inventory = (product.inventory as Array<{ availableQuantity?: number; inStock?: boolean }>) || [];
  const totalAvailable = inventory.reduce((sum, inv) => sum + (inv.availableQuantity || 0), 0);
  const inStock = inventory.length > 0 
    ? (inventory.some(inv => inv.inStock === true) || totalAvailable > 0)
    : true; // Default to true if no inventory data

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

interface ProductListViewProps {
  products: FormattedProduct[];
  locale?: string;
  discountData?: DiscountItem[]; // Optional - passed from client wrapper
  discountLoading?: boolean;
  discountError?: Error | null;
}

/**
 * ProductListView Component
 * Server-side rendered product list view for SEO
 * Horizontal layout with image on left, details on right
 */
export function ProductListView({
  products,
  locale = "en",
  discountData,
  discountLoading = false,
  discountError,
}: ProductListViewProps) {
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
    <div className="space-y-3 sm:space-y-4">
      {products.map(product => {
        const productListItem = transformProduct(product);
        const productSlug = product.productIndexName || product.id || "";
        const productUrl = `/${locale}/products/${productSlug}`;

        return (
          <div
            key={productListItem.id}
            className="group transition-shadow hover:shadow-lg overflow-hidden border rounded-lg flex flex-col sm:flex-row min-h-[200px] sm:min-h-[220px]"
          >
            <div className="p-0 flex flex-col sm:flex-row w-full">
              {/* Product Image */}
              <div className="relative w-full sm:w-2/5 bg-white flex items-center justify-center min-h-[160px] sm:min-h-[200px] aspect-square sm:aspect-auto sm:min-w-[180px] sm:max-w-[280px] shrink-0 sm:py-4 sm:pl-4 md:py-6 md:pl-6 rounded-t-lg sm:rounded-l-lg sm:rounded-t-none overflow-hidden">
                <Link href={productUrl} prefetch={true}>
                  <ImageWithFallback
                    src={productListItem.image}
                    alt={productListItem.title}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                </Link>
                {productListItem.isNew && (
                  <span className="absolute top-6 left-2 md:top-12 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    New
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 p-3 sm:p-4 md:p-6 flex flex-col justify-between">
                <div className="space-y-2 sm:space-y-3">
                  <Link href={productUrl} prefetch={true}>
                    <h3 className="line-clamp-2 text-sm sm:text-base md:text-lg font-medium leading-tight hover:text-blue-600">
                      {productListItem.title}
                    </h3>
                  </Link>

                  {/* Price */}
                  <ProductPrice
                    productId={productListItem.id}
                    unitListPrice={productListItem.price}
                    {...(discountData && { discountData })}
                    discountLoading={discountLoading || false}
                    {...(discountError && { discountError })}
                  />

                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <p className="truncate">{productListItem.brand}</p>
                    <p className="truncate hidden sm:block">SKU: {productListItem.sku}</p>
                  </div>

                  {/* Stock Status */}
                  {!productListItem.inStock && (
                    <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-red-100 text-red-800 w-fit">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <div className="pt-3 sm:pt-5 mt-auto w-full sm:w-1/2">
                  <AddToCartButton
                    productId={productListItem.id}
                    productTitle={productListItem.title}
                    isAvailable={productListItem.inStock}
                    className="md:w-full"
                    {...(discountData && { discountData })}
                    {...(discountLoading !== undefined && { discountLoading })}
                    {...(discountError && { discountError })}
                    {...(typeof (product as any).packaging_qty === "number" && { packagingQty: (product as any).packaging_qty })}
                    {...(typeof (product as any).min_order_quantity === "string" && { minOrderQuantity: parseFloat((product as any).min_order_quantity) })}
                    {...(typeof (product as any).min_order_quantity === "number" && { minOrderQuantity: (product as any).min_order_quantity })}
                    {...(product.unitListPrice !== undefined && { unitListPrice: product.unitListPrice })}
                    {...(product.productAssetss && { productAssetss: product.productAssetss })}
                    {...((product.brandsName || product.brandName) && { brandsName: product.brandsName || product.brandName })}
                    {...((product.productShortDescription || product.shortDescription) && { productShortDescription: product.productShortDescription || product.shortDescription })}
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

