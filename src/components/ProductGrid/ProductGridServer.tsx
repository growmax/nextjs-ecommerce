import { FormattedProduct } from "@/lib/api/services/SearchService/SearchService";
import { ProductListItem } from "@/types/product-listing";
import Image from "next/image";
import Link from "next/link";

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

  return {
    id: productId,
    sku: String(sku),
    title: productName,
    brand: brandName,
    price: productPrice,
    image: productImage,
    images: product.productAssetss?.map(asset => asset.source) || [],
    isNew: false,
    inStock: true,
    category: "",
  };
}

interface ProductGridServerProps {
  products: FormattedProduct[];
  locale?: string;
}

/**
 * ProductGridServer Component
 * Server-side rendered product grid for SEO
 * Renders product HTML directly in server component
 */
export function ProductGridServer({
  products,
  locale = "en",
}: ProductGridServerProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center rounded-lg">
        <p className="text-lg text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map(product => {
        const productListItem = transformProduct(product);
        const productSlug = product.productIndexName || product.id || "";
        const productUrl = `/${locale}/products/${productSlug}`;

        return (
          <div
            key={productListItem.id}
            className="group transition-shadow hover:shadow-lg overflow-hidden h-full flex flex-col min-h-[380px] border rounded-lg"
          >
            <div className="p-0 flex flex-col h-full">
              {/* Product Image */}
              <div className="relative w-full aspect-[16/10]">
                <Link href={productUrl} prefetch={true}>
                  <Image
                    src={productListItem.image}
                    alt={productListItem.title}
                    fill
                    className="object-cover"
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
              <div className="flex-1 p-2 md:p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <Link href={productUrl} prefetch={true}>
                    <h3 className="line-clamp-2 text-base font-medium leading-tight hover:text-blue-600">
                      {productListItem.title}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{productListItem.price}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Brand: {productListItem.brand}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {productListItem.sku}
                  </p>

                  {/* Stock Status */}
                  {!productListItem.inStock && (
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 w-fit">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Add to Cart Button - Will be hydrated client-side */}
                <div
                  className="pt-5 mt-auto"
                  data-product-id={productListItem.id}
                >
                  {/* This will be hydrated by client component */}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
