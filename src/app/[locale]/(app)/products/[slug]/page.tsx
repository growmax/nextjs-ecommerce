import { ProductStructuredData } from "@/components/seo/ProductStructuredData";
import { OpenSearchService, TenantService } from "@/lib/api";
import { RequestContext } from "@/lib/api/client";
import { getDomainInfo } from "@/lib/utils/getDomainInfo";
import { ProductDetail } from "@/types/product/product-detail";
import { ProductPageProps } from "@/types/product/product-page";
import { getPrimaryImageUrl } from "@/utils/product/product-formatter";
import { parseProductSlug } from "@/utils/product/slug-generator";
import { Metadata } from "next";

export const revalidate = 300; // Revalidate every 5 minutes

export const dynamicParams = true;

const getProductCached = async (
  productId: string,
  elasticIndex: string,
  origin: string,
  tenantCode: string
) => {
  const context: RequestContext = { origin, tenantCode };
  return await OpenSearchService.getProductCached(
    productId,
    elasticIndex,
    "pgproduct",
    "get",
    context
  );
};

export async function generateStaticParams() {
  try {
    const { domainUrl, origin } = getDomainInfo();

    const tenantData = await TenantService.getTenantDataCached(
      domainUrl,
      origin
    );

    if (!tenantData?.data?.tenant?.elasticCode) {
      return [];
    }

    // TODO: Replace with actual API call to fetch popular/featured products
    // Example: Fetch top 100 products by views, sales, or featured flag
    // const popularProducts = await fetchPopularProducts(elasticIndex, 100);

    // For now, return empty array - all pages will be generated on-demand
    // Uncomment and modify when you have a popular products API
    /*
    const popularProducts = await OpenSearchService.searchProducts({
      index: elasticIndex,
      size: 100,
      query: {
        bool: {
          must: [
            { term: { is_published: true } },
            { range: { view_count: { gte: 100 } } } // Example: products with 100+ views
          ]
        }
      },
      sort: [{ view_count: { order: "desc" } }]
    });

    // Generate slugs for all locales
    const locales = ['en', 'es', 'fr'];
    const paths = popularProducts.flatMap(product => 
      locales.map(locale => ({
        locale,
        slug: generateProductSlug(product)
      }))
    );

    return paths;
    */

    // Return empty array for now - on-demand generation only
    return [];
  } catch (_error) {
    // Silently fail - ISR will generate pages on-demand
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const { domainUrl, origin } = getDomainInfo();

  try {
    const tenantData = await TenantService.getTenantDataCached(
      domainUrl,
      origin
    );
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

    const elasticIndex = `${elasticCode}pgandproducts`;
    const product = await getProductData(
      productId,
      elasticIndex,
      origin,
      tenantCode
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
        ...(product.product_categories?.map(cat => cat.categoryName) || []),
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
  const { slug, locale } = await params;
  const { domainUrl, origin } = getDomainInfo();

  try {
    const tenantData = await TenantService.getTenantDataCached(
      domainUrl,
      origin
    );
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
    const elasticIndex = `${elasticCode}pgandproducts`;
    const productData = await getProductCached(
      productId,
      elasticIndex,
      origin,
      tenantCode
    );

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
      </>
    );
  } catch (error) {
    /* eslint-disable no-console */
    console.error("Product page error:", error);
    /* eslint-enable no-console */

    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">
          Unexpected Error
        </h1>
        <p className="text-muted-foreground mb-4">
          We encountered an error while loading this product.
        </p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }
}
