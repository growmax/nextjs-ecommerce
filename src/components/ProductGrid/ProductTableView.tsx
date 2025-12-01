import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { DiscountItem } from "@/lib/api/services/DiscountService/DiscountService";
import { ProductListItem } from "@/types/product-listing";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

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
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                Product
              </th>
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                Brand
              </th>
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                SKU
              </th>
              <th className="text-right p-3 font-medium text-sm text-muted-foreground">
                Price
              </th>
              <th className="text-center p-3 font-medium text-sm text-muted-foreground">
                Stock
              </th>
              <th className="text-center p-3 font-medium text-sm text-muted-foreground">
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
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 shrink-0">
                        <Image
                          src={productListItem.image}
                          alt={productListItem.title}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      </div>
                      <Link
                        href={productUrl}
                        prefetch={true}
                        className="font-medium hover:text-blue-600 line-clamp-2"
                      >
                        {productListItem.title}
                      </Link>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {productListItem.brand}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {productListItem.sku}
                  </td>
                  <td className="p-3 text-right">
                    <ProductPrice
                      productId={productListItem.id}
                      unitListPrice={productListItem.price}
                      {...(discountData && { discountData })}
                      discountLoading={discountLoading || false}
                      {...(discountError && { discountError })}
                    />
                  </td>
                  <td className="p-3 text-center">
                    {productListItem.inStock ? (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-block">
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
      <div className="md:hidden space-y-4">
        {products.map(product => {
          const productListItem = transformProduct(product);
          const productSlug = product.productIndexName || product.id || "";
          const productUrl = `/${locale}/products/${productSlug}`;

          return (
            <div
              key={productListItem.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex gap-3">
                <div className="relative w-20 h-20 shrink-0">
                  <Image
                    src={productListItem.image}
                    alt={productListItem.title}
                    fill
                    className="object-cover rounded"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={productUrl}
                    prefetch={true}
                    className="font-medium hover:text-blue-600 line-clamp-2"
                  >
                    {productListItem.title}
                  </Link>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <p>Brand: {productListItem.brand}</p>
                    <p>SKU: {productListItem.sku}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <ProductPrice
                    productId={productListItem.id}
                    unitListPrice={productListItem.price}
                    {...(discountData && { discountData })}
                    discountLoading={discountLoading || false}
                    {...(discountError && { discountError })}
                  />
                  {!productListItem.inStock && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div>
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

