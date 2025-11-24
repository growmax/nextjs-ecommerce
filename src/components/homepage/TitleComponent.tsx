import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TitleComponentProps {
  image?: {
    showImage?: boolean;
    ImageSrc?: string | undefined;
    placeholderImage?: string | undefined;
    height?: string | number;
  };
  text?: {
    sectionAlign?: "flex-start" | "center" | "flex-end";
    topPadding?: number;
    bottomPadding?: number;
    title?: string;
    titleFontSize?: number;
    subtitle?: string;
    subtitleFontSize?: number;
  };
  className?: string;
}

/**
 * Reusable section title component
 * Supports image or text-based titles with subtitle
 */
export default function TitleComponent({
  image,
  text,
  className,
}: TitleComponentProps) {
  const showImage =
    image?.showImage && (image.ImageSrc || image.placeholderImage);
  const imageSrc = image?.ImageSrc || image?.placeholderImage;
  // Handle both number and string heights (e.g., "250px" or 250)
  const imageHeight = image?.height
    ? typeof image.height === "string" && image.height.includes("px")
      ? image.height
      : `${Number(image.height) || 100}px`
    : "100px";

  if (showImage && imageSrc) {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative w-full" style={{ height: imageHeight }}>
          <Image
            src={imageSrc}
            alt="Section title"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    );
  }

  if (!text?.title && !text?.subtitle) {
    return null;
  }

  const alignClass =
    text.sectionAlign === "center"
      ? "items-center text-center"
      : text.sectionAlign === "flex-end"
        ? "items-end text-right"
        : "items-start text-left";

  return (
    <div
      className={cn("flex flex-col", alignClass, className)}
      style={{
        paddingTop: text.topPadding ? `${text.topPadding}px` : undefined,
        paddingBottom: text.bottomPadding
          ? `${text.bottomPadding}px`
          : undefined,
      }}
    >
      {text.title && (
        <h2
          className="mb-1 font-semibold"
          style={{
            fontSize: text.titleFontSize ? `${text.titleFontSize}px` : "24px",
          }}
        >
          {text.title}
        </h2>
      )}
      {text.subtitle && (
        <p
          className="text-muted-foreground"
          style={{
            fontSize: text.subtitleFontSize
              ? `${text.subtitleFontSize}px`
              : "14px",
          }}
        >
          {text.subtitle}
        </p>
      )}
    </div>
  );
}
