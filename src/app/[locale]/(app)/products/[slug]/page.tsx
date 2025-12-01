import MobileCartAction from "@/components/product/MobileCartAction";
import MobileNavigation from "@/components/product/MobileNavigation";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductImageGalleryClient from "@/components/product/ProductImageGalleryClient";
import ProductInfo from "@/components/product/ProductInfo";
import ProductPageClient from "@/components/product/ProductPageClient";
import ProductPageClientContainer from "@/components/product/ProductPageClientContainer";
import { ProductStructuredData } from "@/components/seo/ProductStructuredData";
import { Button } from "@/components/ui/button";
import { ProductVariantProvider } from "@/contexts/ProductVariantContext";
import { ProductPageService } from "@/lib/api";
import { ProductAsset, ProductDetail } from "@/types/product/product-detail";
import { ProductPageProps } from "@/types/product/product-page";
import { parseProductSlug } from "@/utils/product/slug-generator";
import { Metadata, Viewport } from "next";
import { Suspense } from "react";

// Configs...
export const revalidate = 3600;

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { tenantData, origin } =
      await ProductPageService.getProductPageContext();

    if (!tenantData?.data?.tenant?.elasticCode) {
      return [];
    }

    // Generate static params for specific products that should be pre-built
    // Add your specific product IDs here that you want to generate at build time
    const staticProducts = [
      "Prod0000012390", // Specific product requested for build-time generation
      // Add more products here as needed
      // "Prod0000012345",
      // "Prod0000016789",
    ];

    // Generate paths without locale support
    const productPaths = [];

    // Fetch product data and generate proper slugs
    for (const productId of staticProducts) {
      try {
        const product = await ProductPageService.fetchProductById(
          productId,
          tenantData.data.tenant.elasticCode,
          tenantData.data.tenant.tenantCode,
          origin
        );

        if (product) {
          // Generate proper slug using the existing slug generator
          const { generateProductSlug } = await import(
            "@/utils/product/slug-generator"
          );
          const slug = generateProductSlug(product);

          // Add path without locale
          productPaths.push({ slug });
        } else {
        }
      } catch {}
    }

    return productPaths;
  } catch {
    return [];
  }
}

/**
 * Generate viewport settings for product pages
 * Separated from metadata as per Next.js 15+ requirements
 */
export async function generateViewport(): Promise<Viewport> {
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: "#ffffff",
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { tenantData, origin } =
    await ProductPageService.getProductPageContext();

  try {
    if (!tenantData?.data?.tenant?.elasticCode) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
        robots: { index: false, follow: false },
      };
    }

    const { elasticCode, tenantCode } = tenantData.data.tenant;
    const productId = parseProductSlug(slug);

    if (!productId) {
      return {
        title: "Invalid Product",
        description: "Invalid product identifier.",
        robots: { index: false, follow: false },
      };
    }

    const product = await ProductPageService.fetchProductById(
      productId,
      elasticCode,
      tenantCode,
      origin
    );

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
        robots: { index: false, follow: false },
      };
    }

    const brandName = product.brand_name || product.brands_name || "General";
    const title = `${product.product_short_description} - ${brandName}`;
    const description =
      product.product_description ||
      product.product_short_description ||
      `Buy ${product.title} from ${brandName}`;

    const primaryImage = product.product_assetss?.[0]?.source || "";
    const productUrl = `${origin}/products/${slug}`;

    return {
      title: title.substring(0, 60), // SEO best practice
      description: description.substring(0, 160),

      // Enhanced Open Graph
      openGraph: {
        type: "website" as const,
        url: productUrl,
        title,
        description,
        siteName: tenantData.data.tenant.tenantCode || "E-Commerce Store",
        images: [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: product.title,
          },
          // Add additional product images
          ...(product.product_assetss
            ?.slice(0, 4)
            .map((asset: ProductAsset, index: number) => ({
              url: asset.source,
              width: 1200,
              height: 630,
              alt: `${product.title} - Image ${index + 1}`,
            })) || []),
        ],
      },

      // Enhanced Twitter Cards
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [primaryImage],
        creator: brandName,
        site: tenantData.data.tenant.tenantCode,
      },

      // Additional metadata
      alternates: {
        canonical: productUrl,
        languages: {
          "en-US": `${productUrl}?lang=en`,
          "es-ES": `${productUrl}?lang=es`,
          "fr-FR": `${productUrl}?lang=fr`,
        },
      },

      // Enhanced robots meta with better control
      robots: {
        index: Boolean(product.is_published && !product.is_discontinued),
        follow: true,
        googleBot: {
          index: Boolean(product.is_published && !product.is_discontinued),
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },

      // Keywords for better SEO
      keywords: [
        title,
        brandName,
        product.hsn_code,
        product.product_index_name,
        ...(product.product_categories?.map(
          (cat: { categoryName: string }) => cat.categoryName
        ) || []),
        ...(product.product_specifications
          ?.slice(0, 5)
          .map(
            (spec: { name: string; value: string }) =>
              `${spec.name} ${spec.value}`
          ) || []),
      ].filter(Boolean),

      // Authors and creators
      authors: [{ name: brandName }],
      creator: brandName,
      publisher: brandName,

      // Manifest for PWA
      manifest: "/manifest.json",

      // Apple specific meta tags
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: title,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error Loading Product",
      description: "An error occurred while loading the product.",
      robots: { index: false, follow: false },
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = await params;
  const { tenantData, origin } =
    await ProductPageService.getProductPageContext();
  if (!tenantData?.data?.tenant?.elasticCode) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The requested product could not be found.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const { elasticCode, tenantCode } = tenantData.data.tenant;
  const productId = parseProductSlug(slug);

  if (!productId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Invalid Product
        </h1>
        <p className="text-gray-600 mb-6">Invalid product identifier.</p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const productData = await ProductPageService.fetchProductById(
    productId,
    elasticCode,
    tenantCode,
    origin
  );
  
  if (!productData) {
    const { notFound } = await import("next/navigation");
    return notFound();
  }
  const product = productData as ProductDetail;
  const productUrl = `${origin}/products/${slug}`;

  const context = {
    origin,
    tenantCode: tenantData.data.tenant.tenantCode,
  };

  const elasticIndex = `${tenantData.data.tenant.elasticCode}pgandproducts`;

  return (
    <ProductVariantProvider>
      <ProductStructuredData product={product} url={productUrl} />

      {/* Mobile Navigation */}
      <MobileNavigation product={product} />

      <div className="py-3">
        <ProductBreadcrumb product={product} locale={locale} />
      </div>

      {/* Two-Column Layout: Image Gallery (Left) + Product Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-24 lg:pb-8">
        {/* Left Column: Sticky Image Gallery */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <ProductImageGalleryClient
            images={product.product_assetss || []}
            productTitle={product.title}
          />
        </div>

        {/* Right Column: Essential SEO Content (Server-Side) + Interactive Features (Client-Side) */}
        <ProductPageClientContainer
          product={product}
          elasticIndex={elasticIndex}
          context={context}
          baseImages={product.product_assetss || []}
        >
          {/* Server-Side SEO Critical Content */}
          <ProductInfo product={product} />

          {/* Client-Side Variant Selection */}
          <Suspense fallback={<VariantPageSkeleton />}>
            <ProductPageClient
              product={product}
              elasticIndex={elasticIndex}
              context={context}
              baseImages={product.product_assetss || []}
            />
          </Suspense>
        </ProductPageClientContainer>
      </div>

      {/* Mobile Only: Fixed Bottom Cart Action */}
      <MobileCartAction product={product} />
    </ProductVariantProvider>
  );
}

// Skeleton component for loading state
function VariantPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Product Title Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-3/4 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </div>

      {/* Product Image Skeleton */}
      <div className="aspect-square w-full max-w-md mx-auto bg-muted rounded-lg" />

      {/* Pricing Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-1/3 bg-muted rounded" />
        <div className="h-4 w-1/4 bg-muted rounded" />
      </div>

      {/* Variant Selectors Skeleton */}
      <div className="space-y-6 pt-6 border-t">
        <div className="space-y-4">
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="w-10 h-10 bg-muted rounded-full" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-16 bg-muted rounded-lg" />
            <div className="h-10 w-16 bg-muted rounded-lg" />
            <div className="h-10 w-16 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
