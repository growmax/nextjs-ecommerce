# Product Detail Page Implementation Guide

## 🎯 Overview

This document provides a comprehensive guide to the product detail page implementation, which features:

- **High Performance**: ISR (Incremental Static Regeneration) for fast page loads
- **SEO Optimized**: Dynamic meta tags, structured data, and sitemap integration
- **Modern Architecture**: Server Components with streaming for non-critical content
- **Multi-tenant Support**: Handles tenant-specific data and configurations
- **Responsive Design**: Mobile-first approach with excellent UX

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── opensearch/
│   │       └── products/
│   │           └── [id]/
│   │               └── route.ts                    # OpenSearch API proxy
│   └── [locale]/
│       └── (app)/
│           └── products/
│               ├── [slug]/
│               │   ├── page.tsx                    # Main product page (Server Component)
│               │   ├── loading.tsx                 # Loading skeleton
│               │   ├── error.tsx                   # Error boundary
│               │   ├── not-found.tsx               # 404 page
│               │   └── components/
│               │       ├── ProductHero.tsx         # Product images & CTA
│               │       ├── ProductInfo.tsx         # Details & descriptions
│               │       ├── ProductSpecifications.tsx # Tech specs
│               │       └── RelatedProducts.tsx     # Similar products (streaming)
│               └── sitemap.ts                      # Dynamic XML sitemap
│
├── components/
│   └── seo/
│       └── ProductStructuredData.tsx               # JSON-LD schema
│
├── lib/
│   └── api/
│       └── services/
│           └── OpenSearchService.ts                # Product data fetching
│
├── types/
│   └── product/
│       └── product-detail.ts                       # TypeScript interfaces
│
└── utils/
    └── product/
        ├── slug-generator.ts                       # SEO-friendly URL generation
        └── product-formatter.ts                    # Data formatting utilities
```

## 🚀 Getting Started

### 1. Environment Configuration

Add the following to your `.env.local` or `.env`:

```env
# Base URL for canonical URLs and sitemap
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# OpenSearch endpoint
OPENSEARCH_URL=https://api.myapptino.com/opensearch/invocations
NEXT_PUBLIC_OPENSEARCH_URL=https://api.myapptino.com/opensearch/invocations

# Tenant configuration (optional, can be extracted from JWT)
TENANT_CODE=schwingstetterdemo
NEXT_PUBLIC_TENANT_CODE=schwingstetterdemo
```

### 2. URL Structure

Product pages use SEO-friendly URLs with the following structure:

```
/[locale]/products/[brand-slug]-[product-name-slug]-[product-id]
```

**Examples:**

```
/en/products/generics-bearing-j-06-07-prod0000012390
/es/products/milwaukee-m18-impact-driver-prod0000012345
/fr/products/dewalt-cordless-drill-20v-prod0000067890
```

**Benefits:**

- ✅ Search engines can understand the content from the URL
- ✅ Includes brand name for better branded search ranking
- ✅ Descriptive and shareable
- ✅ Unique product ID prevents collisions

### 3. Accessing Product Pages

To navigate to a product page or generate a link:

```typescript
import { generateProductSlug, generateProductUrl } from "@/utils/product/slug-generator";
import { ProductDetail } from "@/types/product/product-detail";

// Generate slug from product data
const slug = generateProductSlug(product);
// Result: "generics-bearing-j-06-07-prod0000012390"

// Generate full URL path
const url = generateProductUrl(product, "en");
// Result: "/en/products/generics-bearing-j-06-07-prod0000012390"

// Use in Link component
<Link href={url}>View Product</Link>
```

## 🏗️ Architecture Details

### Server-Side Rendering with ISR

The product page uses Next.js 14+ App Router with ISR for optimal performance:

```typescript
// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// Allow new products without rebuild
export const dynamicParams = true;
```

**How it works:**

1. First request: Page is generated on-demand (SSR)
2. Subsequent requests: Served from cache (static)
3. After 1 hour: Next request triggers regeneration in background
4. Build time: Top N products can be pre-generated with `generateStaticParams()`

### Data Flow

```
Browser Request
    ↓
Next.js Server Component (page.tsx)
    ↓
OpenSearchService.getProduct()
    ↓
API Route (/api/opensearch/products/[id])
    ↓
OpenSearch/Elasticsearch
    ↓
Product Data (typed with TypeScript)
    ↓
Render Product Page + SEO Meta
```

### Multi-Tenant Support

The system automatically extracts tenant information from JWT tokens:

```typescript
// JWT token structure
{
  "iss": "schwingstetterdemo",  // Tenant code
  "tenantId": "schwingstetterdemo",
  // ... other claims
}

// Elastic index is built dynamically
const elasticIndex = `${tenantCode.toLowerCase()}pgandproducts`;
```

## 🎨 Component Breakdown

### ProductHero Component

**Purpose:** Display product images, pricing, and primary CTA

**Features:**

- Image gallery with thumbnail navigation
- Pricing display with discount calculation
- Add to cart functionality
- Quantity selector with min order quantity validation
- Stock availability indicator
- Share functionality

**Client-side:** Yes (for interactivity)

### ProductInfo Component

**Purpose:** Show detailed product information

**Features:**

- Tabbed interface (Description, Details, Tax & HSN)
- Product specifications
- Category breadcrumbs
- Business unit information
- Tax breakup (CGST, SGST, IGST)

**Client-side:** Yes (for tabs)

### ProductSpecifications Component

**Purpose:** Display technical specifications

**Features:**

- Accordion interface for specifications
- Product attributes
- Accessories list

**Client-side:** Yes (for accordion)

### RelatedProducts Component

**Purpose:** Show similar products for cross-selling

**Features:**

- Fetches products with same brand or category
- Streams data (non-blocking)
- Wrapped in Suspense boundary
- Generates proper product links

**Server Component:** Yes (streaming)

## 🔍 SEO Features

### 1. Dynamic Meta Tags

Generated in `generateMetadata()`:

```typescript
export async function generateMetadata({ params }) {
  const product = await getProductData(params.slug);

  return {
    title: `${product.title} - ${brandName}`,
    description: product.product_short_description,
    keywords: [...],
    openGraph: { ... },
    twitter: { ... },
    alternates: { canonical, languages },
    robots: { ... }
  };
}
```

### 2. Structured Data (JSON-LD)

Implements schema.org Product and BreadcrumbList schemas:

```typescript
<ProductStructuredData
  product={product}
  url={canonicalUrl}
  locale={locale}
/>
```

**Generates:**

- Product schema with pricing, availability, brand
- Breadcrumb schema for navigation
- Proper @graph structure for multiple schemas

### 3. Dynamic Sitemap

Located at `/[locale]/products/sitemap.ts`:

```typescript
export const revalidate = 21600; // 6 hours

export default async function sitemap() {
  // Fetch all published products
  // Generate entries for all locales
  // Include lastModified, changeFrequency, priority
}
```

**Access:** `/en/products/sitemap.xml`

### 4. Canonical URLs and Alternates

Automatically generated for each locale:

```html
<link rel="canonical" href="https://example.com/en/products/..." />
<link rel="alternate" hreflang="en" href="..." />
<link rel="alternate" hreflang="es" href="..." />
<link rel="alternate" hreflang="fr" href="..." />
```

## 🚦 Performance Optimizations

### 1. ISR with Streaming

- Critical content (hero, info): Rendered immediately
- Non-critical content (related products): Streamed with Suspense
- Result: Fast initial page load, enhanced progressively

### 2. Image Optimization

```typescript
import Image from "next/image";

<Image
  src={imageUrl}
  alt={product.title}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  priority // For hero image only
/>
```

### 3. Code Splitting

- Components are automatically split
- Heavy components can be dynamically imported
- Reduces initial bundle size

### 4. Caching Headers

API route includes proper cache headers:

```typescript
headers: {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200"
}
```

## 🔧 Customization Guide

### Changing URL Structure

Edit `/src/utils/product/slug-generator.ts`:

```typescript
export function generateProductSlug(product, maxLength = 100) {
  // Modify this function to change URL structure
  // Example: Remove brand, change separator, add category, etc.
}
```

### Adding More Meta Tags

Edit the `generateMetadata()` function in `page.tsx`:

```typescript
return {
  // ... existing meta tags
  other: {
    "your-custom-meta": "value",
  },
};
```

### Customizing Structured Data

Edit `/src/components/seo/ProductStructuredData.tsx`:

```typescript
const productSchema = {
  "@type": "Product",
  // Add more schema.org properties here
  "additionalProperty": [ ... ],
  "review": [ ... ],
  "aggregateRating": { ... }
};
```

### Modifying Related Products Logic

Edit `/src/app/[locale]/(app)/products/[slug]/components/RelatedProducts.tsx`:

```typescript
async function getRelatedProducts(product) {
  // Change the query logic
  // Example: Use ML recommendations, different filters, etc.
}
```

## 🐛 Troubleshooting

### Issue: Product Not Found

**Symptoms:** 404 page shows for valid product IDs

**Solutions:**

1. Check tenant code extraction from JWT
2. Verify elastic index name format
3. Ensure product is published (`is_published: 1`)
4. Check OpenSearch endpoint configuration

### Issue: Meta Tags Not Showing

**Symptoms:** Social sharing doesn't show preview

**Solutions:**

1. Verify `generateMetadata()` is returning data
2. Check that product fetch is using `await`
3. View page source to confirm tags in HTML
4. Clear social platform cache (Facebook Debugger)

### Issue: Related Products Not Loading

**Symptoms:** Related products section is empty

**Solutions:**

1. Check server logs for query errors
2. Verify products exist in same category/brand
3. Ensure `is_published` filter is correct
4. Test query directly in OpenSearch

### Issue: Slow Page Load

**Symptoms:** Pages take >3 seconds to load

**Solutions:**

1. Verify ISR is enabled (`revalidate` is set)
2. Check OpenSearch response time
3. Optimize image sizes
4. Enable compression at server level
5. Use CDN for static assets

## 📊 Monitoring & Analytics

### Recommended Monitoring

1. **Google Search Console**
   - Monitor indexing status
   - Check for crawl errors
   - Track search performance

2. **Core Web Vitals**
   - LCP: < 2.5s
   - FID: < 100ms
   - CLS: < 0.1

3. **OpenSearch Performance**
   - Query response time
   - Error rates
   - Cache hit ratio

4. **Page Analytics**
   - Add to cart rate
   - Time on page
   - Bounce rate
   - Related product clicks

### Logging

Enable debug logging for development:

```typescript
// In OpenSearchService or API route
if (process.env.NODE_ENV === "development") {
}
```

## 🧪 Testing

See [PRODUCT_PAGE_SEO_TESTING.md](./PRODUCT_PAGE_SEO_TESTING.md) for comprehensive testing guide.

**Quick Test Commands:**

```bash
# Build and test production
npm run build
npm run start

# Access test URLs
# Replace with your actual product IDs
http://localhost:3000/en/products/generics-bearing-j-06-07-prod0000012390

# Check sitemap
http://localhost:3000/en/products/sitemap.xml

# Run Lighthouse
npx lighthouse http://localhost:3000/en/products/... --view
```

## 📚 API Reference

### OpenSearchService

```typescript
import OpenSearchService from "@/lib/api/services/OpenSearchService";

// Get product by index name
const product = await OpenSearchService.getProductByIndexName(
  "Prod0000012390",
  "schwingstetterpgandproducts",
  { accessToken, tenantCode }
);

// Get product by numeric ID
const product = await OpenSearchService.getProductById(
  12390,
  "schwingstetterpgandproducts",
  { accessToken, tenantCode }
);

// Get multiple products
const products = await OpenSearchService.getProductsByIds(
  ["Prod0000012390", "Prod0000012391"],
  "schwingstetterpgandproducts",
  { accessToken, tenantCode }
);
```

### Slug Utilities

```typescript
import {
  generateProductSlug,
  parseProductSlug,
  generateProductUrl,
  generateProductCanonicalUrl,
} from "@/utils/product/slug-generator";

// Generate slug
const slug = generateProductSlug(product);

// Parse product ID from slug
const productId = parseProductSlug(slug);

// Generate URL path
const url = generateProductUrl(product, "en");

// Generate canonical URL
const canonical = generateProductCanonicalUrl(
  product,
  "en",
  "https://example.com"
);
```

### Product Formatter

```typescript
import {
  formatProductForDisplay,
  getProductAvailability,
  formatPrice,
  getPrimaryImageUrl,
  getCategoryBreadcrumb,
} from "@/utils/product/product-formatter";

// Format for display
const displayData = formatProductForDisplay(product);

// Get availability
const availability = getProductAvailability(product);

// Format price
const priceString = formatPrice(737, "₹", 2);

// Get primary image
const imageUrl = getPrimaryImageUrl(product);

// Get category breadcrumb
const breadcrumb = getCategoryBreadcrumb(product);
```

## 🔐 Security Considerations

1. **JWT Token Handling**: Tokens are read from cookies server-side only
2. **API Route Protection**: OpenSearch credentials never exposed to client
3. **Input Validation**: Product IDs are validated before querying
4. **XSS Prevention**: All user content is sanitized
5. **CORS**: API routes have proper CORS headers

## 🚀 Deployment Checklist

- [ ] Set `NEXT_PUBLIC_BASE_URL` in production environment
- [ ] Configure `OPENSEARCH_URL` with production endpoint
- [ ] Verify tenant configuration
- [ ] Test ISR revalidation in production
- [ ] Submit sitemap to Google Search Console
- [ ] Enable CDN for static assets
- [ ] Set up monitoring and alerts
- [ ] Run Lighthouse audit
- [ ] Test social sharing previews
- [ ] Validate structured data with Google Rich Results Test

## 📞 Support & Contributing

For issues or questions:

1. Check this documentation
2. Review [PRODUCT_PAGE_SEO_TESTING.md](./PRODUCT_PAGE_SEO_TESTING.md)
3. Check console logs for error messages
4. Review OpenSearch query responses

---

**Version:** 1.0.0  
**Last Updated:** November 4, 2025  
**Author:** AI Assistant with NextJS Expertise
