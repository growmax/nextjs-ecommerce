"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

interface ProductTileProps {
  id: string;
  title: string;
  img: string;
  alt?: string;
  sku?: string | undefined;
  link?: string;
  price?: number | undefined;
  currency?: string;
  inStock?: boolean;
  flashSale?: boolean;
  freeShipping?: boolean;
  rating?: number;
  reviews?: number;
  promoCode?: string;
  promoDiscount?: string;
  onAddToCart?: (id: string) => void;
  showCompare?: boolean;
  showFavorite?: boolean;
  className?: string;
}

const ProductTile: React.FC<ProductTileProps> = ({
  id,
  title,
  img,
  alt,
  sku,
  link = "#",
  price,
  currency = "$",
  inStock = true,
  flashSale = false,
  freeShipping = false,
  rating,
  reviews,
  promoCode,
  promoDiscount,
  onAddToCart,
  showCompare = true,
  showFavorite = true,
  className = "",
}) => {
  const t = useTranslations("category");
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isCompared, setIsCompared] = React.useState(false);

  return (
    <div className={`product mb-3 ${className}`} data-pid={id}>
      <Card className="relative flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
        {/* Flash Sale Badge */}
        {flashSale && (
          <Badge className="absolute top-3 left-3 bg-yellow-400 text-black hover:bg-yellow-500 flex items-center gap-1 z-20">
            <i className="fa-solid fa-bolt"></i> {t("flashSale")}
          </Badge>
        )}
        {/* Favorite Button */}
        {showFavorite && (
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-30"
            aria-label={t("addToFavorites")}
          >
            <i
              className={`fa-${isFavorite ? "solid" : "regular"} fa-heart text-lg`}
            ></i>
          </button>
        )}

        {/* Product Image Section */}
        <div className="relative w-full bg-white flex justify-center items-center py-4">
          <a href={link} className="flex items-center justify-center">
            <Image
              src={img}
              alt={alt || title}
              width={300}
              height={300}
              className="object-contain max-h-60 w-auto"
            />
          </a>
        </div>

        {/* Product Details */}
        <CardContent className="flex flex-col flex-1 p-3 gap-2">
          {/* Title */}
          <a href={link} className="hover:text-sky-600 transition-colors">
            <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
          </a>

          {/* SKU */}
          {sku && (
            <p className="text-sm text-gray-500">
              {t("sku")} {sku}
            </p>
          )}

          {/* Availability Badge */}
          <div>
            {inStock ? (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <i className="fas fa-check fa-fw mr-1"></i> {t("inStock")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                <i className="fas fa-ban fa-fw mr-1"></i> {t("outOfStock")}
              </Badge>
            )}
          </div>

          {/* Free Shipping */}
          {freeShipping && (
            <Badge variant="secondary" className="w-fit text-xs">
              <i className="fas fa-truck fa-fw mr-1"></i>
              {t("freeShipping")}
            </Badge>
          )}

          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(starPosition => (
                  <i
                    key={`star-${id}-${starPosition}`}
                    className={`fa-star text-sm ${
                      starPosition <= Math.floor(rating)
                        ? "fa-solid text-yellow-400"
                        : starPosition - 0.5 <= rating
                          ? "fa-solid text-yellow-300 opacity-70"
                          : "fa-regular text-gray-300"
                    }`}
                  ></i>
                ))}
              </div>
              <span className="font-medium">{rating.toFixed(1)}</span>
              {reviews && <span className="text-gray-500">({reviews})</span>}
            </div>
          )}

          {/* Price */}
          {price && (
            <div className="text-xl font-bold text-slate-900">
              {currency}
              {price.toFixed(2)}
            </div>
          )}

          {/* Promo Badge */}
          {promoCode && (
            <Badge variant="destructive" className="w-fit">
              + {promoDiscount || "10%"} {t("off")}
            </Badge>
          )}
          {promoCode && (
            <p className="text-xs text-gray-600">
              {t("withCode")} <span className="font-semibold">{promoCode}</span>
            </p>
          )}
        </CardContent>

        {/* Footer Buttons */}
        <CardFooter className="flex justify-between items-center border-t gap-15 ">
          {showCompare && (
            <div className="flex items-center gap-3">
              <Checkbox
                id={`compare-${id}`}
                checked={isCompared}
                onCheckedChange={checked => setIsCompared(checked as boolean)}
              />
              <label
                htmlFor={`compare-${id}`}
                className="text-sm cursor-pointer"
              >
                {t("compare")}
              </label>
            </div>
          )}

          <Button
            size="lg"
            onClick={() => onAddToCart?.(id)}
            disabled={!inStock}
            className="flex-1"
            variant={inStock ? "default" : "outline"}
          >
            {inStock ? t("addToCart") : t("outOfStockButton")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductTile;
