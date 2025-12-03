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
  const inventory = (product.inventory as Array<{ availableQty?: number; inStock?: boolean }>) || [];
  const totalAvailable = inventory.reduce((sum, inv) => sum + (inv.availableQty || 0), 0);
  // Product is in stock if totalAvailable > 0
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

interface ProductTableViewProps {
  products: FormattedProduct[];
  locale?: string;
  discountData?: DiscountItem[]; // Optional - passed from client wrapper
  discountLoading?: boolean;
  discountError?: Error | null;
}

/**
 * ProductTableView Component
 * Server-side rendered product table view for SEO
 * Compact table format on desktop, stacked cards on mobile
 */
export function ProductTableView({
  products,
  locale = "en",
  discountData,
  discountLoading = false,
  discountError,
}: ProductTableViewProps) {
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
    <>
      {/* Desktop & Tablet Table View - Responsive Layout */}
      <div className="hidden md:block w-full overflow-x-auto product-table-wrapper">
        <table className="w-full table-fixed border-collapse">
          {/* This colgroup fixes column jumping — do not remove */}
          <colgroup>
            <col style={{ width: "var(--product-table-col-product, 35%)" }} />
            <col className="hidden lg:table-column" style={{ width: "var(--product-table-col-brand, 13%)" }} />
            <col className="hidden xl:table-column" style={{ width: "var(--product-table-col-sku, 11%)" }} />
            <col style={{ width: "var(--product-table-col-price, 18%)" }} />
            <col className="hidden lg:table-column" style={{ width: "var(--product-table-col-stock, 12%)" }} />
            <col style={{ width: "var(--product-table-col-actions, 23%)" }} />
          </colgroup>
          <thead>
            <tr className="border-b bg-muted/30">
              <th scope="col" className="text-left p-2 md:p-3 font-medium text-xs md:text-sm text-primary">
                Product
              </th>
              <th scope="col" className="hidden lg:table-cell text-left p-2 md:p-3 font-medium text-xs md:text-sm text-primary">
                Brand
              </th>
              <th scope="col" className="hidden xl:table-cell text-left p-2 md:p-3 font-medium text-xs md:text-sm text-primary">
                SKU
              </th>
              <th scope="col" className="text-right p-2 md:p-3 font-medium text-xs md:text-sm text-primary">
                Price
              </th>
              <th scope="col" className="hidden lg:table-cell text-center p-2 md:p-3 font-medium text-xs md:text-sm text-primary">
                Stock
              </th>
              <th scope="col" className="text-center p-2 md:p-3 font-medium text-xs md:text-sm text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const productListItem = transformProduct(product);
              const productSlug = product.productIndexName || product.id || "";
              const productUrl = `/${locale}/products/${productSlug}`;

              return (
                <tr
                  key={productListItem.id}
                  className="border-b hover:bg-muted/50 transition-colors"
                  data-testid={`product-row-${productListItem.id}`}
                >
                  <td className="p-2 md:p-3">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      {/* Fixed aspect ratio image - responsive size */}
                      <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0 aspect-square">
                        <ImageWithFallback
                          src={productListItem.image}
                          alt={productListItem.title}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 40px, 48px"
                        />
                      </div>
                      {/* Title with line-clamp and tooltip for overflow */}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={productUrl}
                          prefetch={true}
                          className="text-sm md:text-base font-medium hover:text-blue-600 line-clamp-2 block"
                          title={productListItem.title}
                        >
                          {productListItem.title}
                        </Link>
                        {/* Show brand and SKU inline on tablet when columns are hidden */}
                        <div className="lg:hidden mt-1 text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                          <div>{productListItem.brand}</div>
                          <div className="xl:hidden">SKU: {productListItem.sku}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell p-2 md:p-3 text-xs md:text-sm text-gray-700 dark:text-gray-300 truncate">
                    {productListItem.brand}
                  </td>
                  <td className="hidden xl:table-cell p-2 md:p-3 text-xs md:text-sm text-gray-700 dark:text-gray-300 truncate">
                    {productListItem.sku}
                  </td>
                  <td className="p-2 md:p-3 text-right">
                    <ProductPrice
                      productId={productListItem.id}
                      unitListPrice={productListItem.price}
                      {...(discountData && { discountData })}
                      discountLoading={discountLoading || false}
                      {...(discountError && { discountError })}
                    />
                  </td>
                  <td className="hidden lg:table-cell p-2 md:p-3 text-center">
                    {productListItem.inStock ? (
                      <span className="text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-green-100 text-green-800 whitespace-nowrap inline-block">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-red-100 text-red-800 whitespace-nowrap inline-block">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="p-2 md:p-3 text-center">
                    <div className="inline-flex flex-col lg:flex-row gap-1 lg:gap-2 items-center">
                      {/* Show stock status on mobile/tablet when column is hidden */}
                      {!productListItem.inStock && (
                        <span className="lg:hidden text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800 whitespace-nowrap">
                          Out of Stock
                        </span>
                      )}
                      <AddToCartButton
                        productId={productListItem.id}
                        productTitle={productListItem.title}
                        isAvailable={productListItem.inStock}
                        compact
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="md:hidden space-y-3">
        {products.map(product => {
          const productListItem = transformProduct(product);
          const productSlug = product.productIndexName || product.id || "";
          const productUrl = `/${locale}/products/${productSlug}`;

          return (
            <div
              key={productListItem.id}
              className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-3">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                  <ImageWithFallback
                    src={productListItem.image}
                    alt={productListItem.title}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 640px) 64px, 80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={productUrl}
                    prefetch={true}
                    className="text-sm sm:text-base font-medium hover:text-blue-600 line-clamp-2 block"
                  >
                    {productListItem.title}
                  </Link>
                  <div className="mt-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                    <p className="truncate">{productListItem.brand}</p>
                    <p className="truncate">SKU: {productListItem.sku}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 mt-3 border-t">
                <div className="flex items-center gap-2">
                  <ProductPrice
                    productId={productListItem.id}
                    unitListPrice={productListItem.price}
                    {...(discountData && { discountData })}
                    discountLoading={discountLoading || false}
                    {...(discountError && { discountError })}
                  />
                  {!productListItem.inStock && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800 whitespace-nowrap">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  <AddToCartButton
                    productId={productListItem.id}
                    productTitle={productListItem.title}
                    isAvailable={productListItem.inStock}
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
          );
        })}
      </div>
    </>
  );
}

