import { ProductDetail } from "@/types/product/product-detail";
import { ProductStructuredData } from "@/components/seo/ProductStructuredData";
import ProductInfo from "@/components/product/ProductInfo";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductVariants from "@/components/product/ProductVariants";
import MobileCartAction from "@/components/product/MobileCartAction";
import AddToCartSection from "@/components/product/AddToCartSection";

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
        {/* Product Breadcrumb */}
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
            <AddToCartSection 
              productId={product.product_id} 
              productTitle={product.title} 
              isAvailable={true} 
            />
          </div>
        </div>

        {/* Mobile Only: Fixed Bottom Cart Action */}
        <div className="lg:hidden">
          <MobileCartAction product={product} />
        </div>
      </div>
    </div>
  );
}
