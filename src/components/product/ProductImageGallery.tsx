import { ProductAsset } from "@/types/product/product-detail";
import Image from "next/image";
import ProductImageGalleryClient from "./ProductImageGalleryClient";

interface ProductImageGalleryProps {
  images: ProductAsset[];
  productTitle: string;
}

export default function ProductImageGallery({
  images,
  productTitle,
}: ProductImageGalleryProps) {
  // Filter valid images and add fallback
  const validImages =
    images && images.length > 0
      ? images.filter(img => img.source)
      : [
          {
            source: "/asset/default-placeholder.png",
            type: "image",
            height: "800",
            width: "800",
            isDefault: true,
          },
        ];

  return (
    <div>
      {/* Hidden images in HTML for SEO - crawlers will find these */}
      <div className="hidden">
        {validImages.map((image, index) => (
          <Image
            key={index}
            src={image.source}
            alt={`${productTitle} - Image ${index + 1}`}
            width={800}
            height={800}
            className="object-contain"
            priority={index === 0}
          />
        ))}
      </div>

      {/* Client-side interactive gallery */}
      <ProductImageGalleryClient
        images={validImages}
        productTitle={productTitle}
      />
    </div>
  );
}
