import ImageWithFallback from "@/components/ImageWithFallback";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { DiscountItem } from "@/lib/api/services/DiscountService/DiscountService";
import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { ProductListItem } from "@/types/product-listing";
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
  locale?: string;
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
  locale = "en",
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {products.map(product => {
        const productListItem = transformProduct(product);
        const productSlug = product.productIndexName || product.id || "";
        const productUrl = `/${locale}/products/${productSlug}`;

        return (
          <div
            key={productListItem.id}
            className="group transition-shadow hover:shadow-lg overflow-hidden h-full flex flex-col min-h-[320px] sm:min-h-[380px] border rounded-lg"
          >
            <div className="p-0 flex flex-col h-full">
              {/* Product Image */}
              <div className="relative w-full bg-white flex items-center justify-center min-h-[140px] sm:min-h-[180px] md:min-h-[220px] aspect-square rounded-t-lg overflow-hidden">
                <Link href={productUrl} prefetch={true}>
                  <ImageWithFallback
                    src={productListItem.image}
                    alt={productListItem.title}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                </Link>
                {productListItem.isNew && (
                  <span className="absolute top-6 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    New
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 p-2 sm:p-3 md:p-5 flex flex-col justify-between">
                <div className="space-y-2 sm:space-y-3">
                  <Link href={productUrl} prefetch={true}>
                    <h3 className="line-clamp-2 text-xs sm:text-sm md:text-base font-medium leading-tight hover:text-blue-600">
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

                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                    {productListItem.brand}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate hidden sm:block">
                    {productListItem.sku}
                  </p>

                  {/* Stock Status */}
                  {!productListItem.inStock && (
                    <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-red-100 text-red-800 w-fit">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <div className="pt-3 sm:pt-5 mt-auto">
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
