import { ProductDetail } from "@/types/product/product-detail";
import { Suspense } from "react";
import ProductHero from "@/app/[locale]/(app)/products/[slug]/components/ProductHero";
import ProductInfo from "@/app/[locale]/(app)/products/[slug]/components/ProductInfo";
import ProductSpecifications from "@/app/[locale]/(app)/products/[slug]/components/ProductSpecifications";
import RelatedProducts from "@/app/[locale]/(app)/products/[slug]/components/RelatedProducts";
import { ProductStructuredData } from "@/components/seo/ProductStructuredData";

interface ProductLayoutProps {
  product: ProductDetail;
  locale: string;
  canonicalUrl: string;
}

export default function ProductLayout({
  product,
  locale,
  canonicalUrl,
}: ProductLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data for SEO */}
      <ProductStructuredData
        product={product}
        url={canonicalUrl}
        locale={locale}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Product Hero Section - Critical, rendered immediately */}
        <ProductHero product={product} locale={locale} />

        {/* Product Information - Critical */}
        <div className="mt-8">
          <ProductInfo product={product} />
        </div>

        {/* Product Specifications - Critical */}
        <div className="mt-8">
          <ProductSpecifications product={product} />
        </div>

        {/* Related Products - Non-critical, streamed */}
        <div className="mt-12">
          <Suspense
            fallback={
              <div className="py-8">
                <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 animate-pulse rounded-lg h-64"
                    />
                  ))}
                </div>
              </div>
            }
          >
            <RelatedProducts product={product} locale={locale} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
