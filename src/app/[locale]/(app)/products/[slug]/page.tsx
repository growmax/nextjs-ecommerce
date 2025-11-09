import { PageContent } from "@/components/layout/PageContent";
import MobileCartAction from "@/components/product/MobileCartAction";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductVariants from "@/components/product/ProductVariants";
import { ProductStructuredData } from "@/components/seo/ProductStructuredData";
import { OpenSearchService, TenantService } from "@/lib/api";
import { RequestContext } from "@/lib/api/client";
import { getDomainInfo } from "@/lib/utils/getDomainInfo";
import { ProductDetail } from "@/types/product/product-detail";
import { ProductPageProps } from "@/types/product/product-page";
import { getPrimaryImageUrl } from "@/utils/product/product-formatter";
import { parseProductSlug } from "@/utils/product/slug-generator";
import { Metadata } from "next";

// Configs...
export const revalidate = 3600;

export const dynamicParams = true;

// Data Methods...
async function getContext() {
  const { domainUrl, origin } = getDomainInfo();
  const tenantData = await TenantService.getTenantDataCached(domainUrl, origin);
  return { tenantData, origin };
}

async function fetchProduct(
  productId: string,
  elasticCode: string,
  tenantCode: string,
  origin: string
): Promise<ProductDetail | null> {
  const elasticIndex = `${elasticCode}pgandproducts`;
  const context: RequestContext = { origin, tenantCode };
  return await OpenSearchService.getProductCached(
    productId,
    elasticIndex,
    "pgproduct",
    "get",
    context
  );
}

// Next js Methods...

export async function generateStaticParams() {
  try {
    console.log(
      `[Static Generation] Fetching product starging for build-time generation`
    );
    const { tenantData, origin } = await getContext();

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

    // Generate paths for all supported locales
    const locales = ["en", "es", "fr"];
    const productPaths = [];

    // Fetch product data and generate proper slugs
    for (const productId of staticProducts) {
      try {
        // Fetch product data
        console.log(
          `[Static Generation] Fetching product ${productId} for build-time generation`
        );
        const product = await fetchProduct(
          productId,
          tenantData.data.tenant.elasticCode,
          tenantData.data.tenant.tenantCode,
          origin
        );

        if (product) {
          console.log(
            `[Static Generation] fetchProduct succeeded for ${productId}`
          );
          // Generate proper slug using the existing slug generator
          const { generateProductSlug } = await import(
            "@/utils/product/slug-generator"
          );
          const slug = generateProductSlug(product);

          // Add paths for all locales
          for (const locale of locales) {
            productPaths.push({ locale, slug });
          }

          // Static generation logging (build-time only)
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[Static Generation] Pre-generating: ${productId} -> ${slug} for locales: ${locales.join(", ")}`
            );
          }
        } else {
          // Static generation warning (build-time only)
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[Static Generation] Product ${productId} not found, skipping...`
            );
          }
        }
      } catch (error) {
        // Static generation error (build-time only)
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[Static Generation] Failed to fetch product ${productId}:`,
            error
          );
        }
      }
    }

    return productPaths;
  } catch (_error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const { tenantData, origin } = await getContext();

  try {
    if (!tenantData?.data?.tenant?.elasticCode) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    const { elasticCode, tenantCode } = tenantData.data.tenant;
    const productId = parseProductSlug(slug);

    if (!productId) {
      return {
        title: "Invalid Product",
        description: "Invalid product identifier.",
      };
    }

    const product = await fetchProduct(
      productId,
      elasticCode,
      tenantCode,
      origin
    );

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    const brandName = product.brand_name || product.brands_name || "Generic";
    const title = `${product.title} - ${brandName}`;
    const description =
      product.product_short_description ||
      product.product_description ||
      `Buy ${product.title} from ${brandName}`;
    const primaryImage = getPrimaryImageUrl(product);
    const productUrl = `${origin}/${locale}/products/${slug}`;

    return {
      title,
      description: description.substring(0, 160), // SEO best practice: 150-160 chars
      keywords: [
        product.title,
        brandName,
        product.hsn_code,
        product.product_index_name,
        ...(product.product_categories?.map(
          (cat: { categoryName: string }) => cat.categoryName
        ) || []),
      ]
        .filter(Boolean)
        .join(", "),
      authors: [{ name: brandName }],
      creator: brandName,
      publisher: brandName,
      robots: {
        index: product.is_published ? true : false,
        follow: true,
        googleBot: {
          index: product.is_published ? true : false,
          follow: true,
        },
      },
      openGraph: {
        type: "website",
        url: productUrl,
        title,
        description,
        siteName: tenantData.data.tenant.tenantCode || "E-Commerce Store",
        locale,
        images: [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [primaryImage],
      },
      alternates: {
        canonical: productUrl,
        languages: {
          en: `${origin}/en/products/${slug}`,
          es: `${origin}/es/products/${slug}`,
          fr: `${origin}/fr/products/${slug}`,
        },
      },
    };
  } catch (_error) {
    return {
      title: "Error Loading Product",
      description: "An error occurred while loading the product.",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = params;
  const { tenantData, origin } = await getContext();
  if (!tenantData?.data?.tenant?.elasticCode) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">
          Tenant Configuration Error
        </h1>
        <p className="text-muted-foreground">
          Unable to load store configuration. Please contact support.
        </p>
      </div>
    );
  }

  try {
    const { elasticCode, tenantCode } = tenantData.data.tenant;
    const productId = parseProductSlug(slug);
    if (!productId) {
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">
            Invalid Product URL
          </h1>
          <p className="text-muted-foreground">
            The product identifier in the URL is invalid.
          </p>
        </div>
      );
    }

    const startTime = Date.now();

    const productData = await fetchProduct(
      productId,
      elasticCode,
      tenantCode,
      origin
    );
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Performance timing (development only)
    if (process.env.NODE_ENV === "development") {
      console.log(`[Product Fetch] Duration: ${duration}ms`, {
        timestamp: new Date().toISOString(),
        productId: parseProductSlug(slug),
      });
    }

    if (!productData) {
      const { notFound } = await import("next/navigation");
      return notFound();
    }
    const product = productData as ProductDetail;
    const productUrl = `${origin}/${locale}/products/${slug}`;

    return (
      <>
        <ProductStructuredData
          product={product}
          url={productUrl}
          locale={locale}
        />

        <PageContent layout="auto">
          <div className="py-3">
            <ProductBreadcrumb product={product} locale={locale} />
          </div>

          {/* Two-Column Layout: Image Gallery (Left) + Product Details (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-24 lg:pb-8">
            {/* Left Column: Sticky Image Gallery */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <ProductImageGallery
                images={product.product_assetss || []}
                productTitle={product.title}
              />
            </div>

            {/* Right Column: Product Information */}
            <div className="space-y-6">
              <ProductInfo product={product} locale={locale} />
              <ProductVariants attributes={product.set_product_atributes} />
            </div>
          </div>

          {/* Mobile Only: Fixed Bottom Cart Action */}
          <MobileCartAction product={product} />
        </PageContent>
      </>
    );
  } catch (_error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">
          Error Loading Product
        </h1>
        <p className="text-muted-foreground">
          An unexpected error occurred while loading this product. Please try
          again later.
        </p>
      </div>
    );
  }
}
