import AddToCartSection from "@/components/product/AddToCartSection";
import MobileCartAction from "@/components/product/MobileCartAction";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductVariants from "@/components/product/ProductVariants";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProducts from "@/components/product/ProductRelated";
import { ProductStructuredData } from "@/components/seo/ProductStructuredData";
import { ProductDetail } from "@/types/product/product-detail";

interface ProductLayoutProps {
  product: ProductDetail;
  canonicalUrl: string;
}

export default function ProductLayout({
  product,
  canonicalUrl,
}: ProductLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data for SEO */}
      <ProductStructuredData product={product} url={canonicalUrl} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Product Breadcrumb */}
        <div className="py-3">
          <ProductBreadcrumb product={product} />
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
            <ProductInfo product={product} />
            <ProductVariants attributes={product.set_product_atributes} />
            <AddToCartSection
              productId={product.product_id}
              productTitle={product.title}
              isAvailable={true}
            />
          </div>
        </div>
        {/* Product Reviews */}
        <div className="mt-12">
          <ProductReviews />
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts />
        </div>

        {/* Mobile Only: Fixed Bottom Cart Action */}
        <div className="lg:hidden">
          <MobileCartAction product={product} />
        </div>
      </div>
    </div>
  );
}
