"use client";

import Image, { ImageProps, StaticImageData } from "next/image";
import { useState } from "react";
import placeholderimg from "@/../public/asset/default-placeholder.png";

interface ImageWithFallbackProps
  extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
}

/**
 * Image component with automatic fallback to default placeholder
 * If src is invalid or fails to load, shows fallbackSrc or default placeholder
 *
 * Supports both fixed dimensions (width/height) and fill layout
 */
export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  className = "",
  ...imageProps
}: ImageWithFallbackProps) {
  // Use fallback immediately if src is null/undefined/empty
  const validSrc = src && src.trim() !== "" ? src : placeholderimg;
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(validSrc);

  const handleError = () => {
    // Only set fallback if we haven't already
    if (typeof imgSrc === "string") {
      setImgSrc(fallbackSrc || placeholderimg);
    }
  };

  // Only use blur placeholder for StaticImageData (local images)
  // Next.js automatically generates blurDataURL for imported static images
  const isStaticImage = typeof imgSrc !== "string";

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...imageProps}
      {...(isStaticImage && !imageProps.placeholder && { placeholder: "blur" })}
    />
  );
}
