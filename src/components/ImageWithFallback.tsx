"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import placeholderimg from "../../public/asset/default-placeholder.png";

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  fallbackSrc?: string;
  className?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

/**
 * Image component with automatic fallback to default placeholder
 * If src is invalid or fails to load, shows fallbackSrc or default placeholder
 */
export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  // fallbackSrc = placeholderimg,
  className = "",
  objectFit = "cover",
}: ImageWithFallbackProps) {
  // Use fallback immediately if src is null/undefined/empty
  const validSrc = src && src.trim() !== "" ? src : placeholderimg;
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(validSrc);

  const handleError = () => {
    // Only set fallback if we haven't already
    if (typeof imgSrc === "string") {
      setImgSrc(placeholderimg);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        objectFit,
        backgroundColor: "#f5f5f5",
      }}
      onError={handleError}
      unoptimized
    />
  );
}
