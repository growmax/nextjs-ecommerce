import { ProductDetail } from "@/types/product/product-detail";
import { getPrimaryImageUrl, getProductAvailability } from "@/utils/product/product-formatter";

/**
 * ProductStructuredData Component
 * 
 * Generates JSON-LD structured data for product pages
 * following schema.org/Product specification for better SEO
 * and rich results in Google Search.
 */

interface ProductStructuredDataProps {
  product: ProductDetail;
  url: string;
  locale?: string;
}

export function ProductStructuredData({ 
  product, 
  url,
  locale = "en" 
}: ProductStructuredDataProps) {
  const brandName = product.brand_name || product.brands_name || "Generic";
  const availability = getProductAvailability(product);
  const primaryImage = getPrimaryImageUrl(product);
  
  // Get all images
  const images = product.product_assetss
    ?.filter(img => img.source)
    ?.map(img => img.source) || [primaryImage];

  // Product schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.product_description || product.product_short_description,
    image: images,
    sku: product.brand_product_id,
    mpn: product.product_index_name,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "Offer",
      url: url,
      priceCurrency: "INR", // TODO: Make dynamic based on tenant
      price: product.unit_list_price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      availability: availability.available 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(product.unit_mrp && product.unit_mrp > product.unit_list_price && {
        priceSpecification: {
          "@type": "PriceSpecification",
          price: product.unit_mrp,
          priceCurrency: "INR",
        },
      }),
    },
    ...(product.hsn_code && {
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "HSN Code",
          value: product.hsn_code,
        },
      ],
    }),
    ...(product.product_specifications && product.product_specifications.length > 0 && {
      additionalProperty: product.product_specifications.slice(0, 10).map(spec => ({
        "@type": "PropertyValue",
        name: spec.name,
        value: spec.value,
        ...(spec.unit && { unitText: spec.unit }),
      })),
    }),
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: url.split("/products/")[0] || url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${url.split("/products/")[0]}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: url,
      },
    ],
  };

  // Combine both schemas
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumbSchema],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      suppressHydrationWarning
    />
  );
}

/**
 * Organization Structured Data
 * Add to main layout for site-wide organization info
 */
export function OrganizationStructuredData({
  name,
  logo,
  url,
  socialLinks = [],
}: {
  name: string;
  logo: string;
  url: string;
  socialLinks?: string[];
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      suppressHydrationWarning
    />
  );
}

/**
 * WebSite Structured Data with Search Action
 * Add to main layout for site-wide search functionality
 */
export function WebSiteStructuredData({
  name,
  url,
  searchUrl,
}: {
  name: string;
  url: string;
  searchUrl: string;
}) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      suppressHydrationWarning
    />
  );
}

