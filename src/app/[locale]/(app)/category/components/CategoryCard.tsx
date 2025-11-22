import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

interface CategoryCardProps {
  index?: number;
  img?: string;
  alt?: string;
  title?: string;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
  cardWidth?: number | string;
  cardHeight?: number | string;
  showTitle?: boolean;
  imagePosition?: "top" | "center" | "bottom";
  bgColor?: string;
  hoverEffect?: boolean;
  children?: React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  index = 0,
  img,
  alt,
  title,
  imageWidth = 150,
  imageHeight = 150,
  className = "",
  cardWidth,
  cardHeight,
  showTitle = true,
  imagePosition = "center",
  bgColor = "bg-white",
  hoverEffect = true,
  children,
}) => {
  const t = useTranslations("category");
  // Inline style for outer wrapper
  const wrapperStyle: React.CSSProperties = {
    width: cardWidth,
    height: cardHeight,
  };

  return (
    <div className={`mx-auto ${className}`} style={wrapperStyle}>
      <Card
        className={`group flex flex-col transition-all duration-200 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden h-full ${
          hoverEffect ? "hover:border-sky-500 hover:shadow-lg" : ""
        }`}
      >
        {/* Image Section (optional) */}
        {img && (
          <div
            className={`relative overflow-hidden flex items-${imagePosition} justify-center ${bgColor} w-full flex-1`}
          >
            <Image
              src={img}
              alt={alt || title || `${t("categoryImage")} ${index}`}
              width={imageWidth}
              height={imageHeight}
              className="object-contain max-h-full"
            />
          </div>
        )}

        {/* Footer Section (title or custom children) */}
        {(showTitle && title) || children ? (
          <CardFooter className="flex items-center justify-center py-2">
            {children ? (
              children
            ) : (
              <h3 className="text-lg font-semibold transition-all group-hover:text-sky-600 text-center truncate w-full whitespace-nowrap">
                {title}
              </h3>
            )}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
};

export default CategoryCard;
