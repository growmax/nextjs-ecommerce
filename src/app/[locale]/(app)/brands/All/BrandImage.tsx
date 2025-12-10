"use client";

interface BrandImageProps {
  src: string;
  alt: string;
  brandName: string;
}

export function BrandImage({ src, alt, brandName }: BrandImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      onError={(e) => {
        // Fallback to placeholder if image fails
        (e.target as HTMLImageElement).src =
          "https://placehold.co/200x200?text=" + encodeURIComponent(brandName);
      }}
    />
  );
}
