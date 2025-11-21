"use client";

import ProductCard from "@/app/[locale]/(app)/category/components/ProductCard";
import useProductDiscounts from "@/hooks/useProductDiscounts";
import { useProductsByIds } from "@/hooks/useProductsByIds";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import TitleComponent from "./TitleComponent";

interface ProductSectionProps {
  data?: {
    listOfItems?: Array<{ brandProductId?: string | number }>;
    bottomPadding?: number;
    bottomPaddingMob?: number;
    sectionAlign?: "flex-start" | "center" | "flex-end";
    sectionAlignMob?: "flex-start" | "center" | "flex-end";
    showTitleImage?: boolean;
    showTitleImageMob?: boolean;
    subtitle?: string;
    title?: string;
    sectionCardTitle?: string;
    titleImage?: string;
    titleImageMob?: string;
    titleImgHeight?: string | number;
    titleImgHeightMob?: string | number;
    topPadding?: number;
    titleMob?: string;
    topPaddingMob?: number;
    subtitleMob?: string;
    titleFontsize?: number;
    titleFontSizeMob?: number;
    subtitleFontSize?: number;
    subtitleFontSizeMob?: number;
  };
  isMobile?: boolean;
  placeholderImage?: string | undefined;
  elasticIndex?: string | undefined;
}

/**
 * Product section component for homepage
 * Fetches products by brandProductId and displays in grid
 */
export default function ProductSection({
  data = {},
  isMobile = false,
  placeholderImage,
  elasticIndex,
}: ProductSectionProps) {
  const {
    bottomPadding = 0,
    bottomPaddingMob = 0,
    sectionAlign = "flex-start",
    sectionAlignMob = "flex-start",
    showTitleImage = false,
    showTitleImageMob = false,
    subtitle = "",
    title = "",
    sectionCardTitle,
    titleImage = placeholderImage,
    titleImageMob = titleImage,
    titleImgHeight = 50,
    titleImgHeightMob = 50,
    topPadding = 0,
    titleMob = title,
    topPaddingMob = 0,
    subtitleMob,
    titleFontsize = 24,
    titleFontSizeMob = 18,
    subtitleFontSize = 14,
    subtitleFontSizeMob = 13,
    listOfItems = [],
  } = data;

  // Extract brandProductIds
  const brandProductIds = useMemo(
    () =>
      listOfItems
        .map(item => item.brandProductId)
        .filter((id): id is string | number => id !== undefined && id !== null),
    [listOfItems]
  );

  // Use sectionCardTitle for path if available (matches buyer-fe), otherwise fall back to title
  const pathTitle = sectionCardTitle || title;

  // Fetch products
  const { data: productData, isLoading: productsLoading } = useProductsByIds({
    brandProductIds,
    elasticIndex,
    path: `/homepage${pathTitle}`,
    enabled: brandProductIds.length > 0,
  });

  // Extract product IDs for discount fetching
  const productIds = useMemo(
    () =>
      productData
        ?.map(p => p.productId)
        .filter((id): id is number => id !== undefined && id !== null) || [],
    [productData]
  );

  // Fetch discounts
  // Use title for discount path (matches buyer-fe: title + "/homepage")
  const { discountdataLoading: _discountdataLoading } =
    useProductDiscounts(productIds);

  if (brandProductIds.length === 0) {
    return null;
  }

  return (
    <div className="my-4" data-testid="product-section">
      <TitleComponent
        className="px-4 py-4"
        image={{
          showImage: isMobile
            ? showTitleImageMob || showTitleImage
            : showTitleImage,
          ImageSrc: isMobile ? titleImageMob || titleImage : titleImage,
          height: isMobile
            ? titleImgHeightMob || titleImgHeight
            : titleImgHeight,
          placeholderImage,
        }}
        text={{
          sectionAlign: isMobile
            ? sectionAlignMob || sectionAlign
            : sectionAlign,
          topPadding: (isMobile ? topPaddingMob || topPadding : topPadding) / 2,
          bottomPadding:
            (isMobile ? bottomPaddingMob || bottomPadding : bottomPadding) / 2,
          title: isMobile ? titleMob || title : title,
          titleFontSize: isMobile
            ? titleFontSizeMob || titleFontsize
            : titleFontsize,
          subtitle: isMobile ? subtitleMob || subtitle : subtitle,
          subtitleFontSize: isMobile
            ? subtitleFontSizeMob || subtitleFontSize
            : subtitleFontSize,
        }}
      />

      {productsLoading ? (
        <div className="px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      ) : productData && productData.length > 0 ? (
        <div
          className={cn(
            "grid gap-4",
            isMobile ? "px-4 grid-cols-2" : "px-4 md:grid-cols-3 lg:grid-cols-5"
          )}
        >
          {productData.map(product => {
            // Map product to ProductCard format
            const productImage =
              product.productAssetss?.find(asset => asset.isDefault)?.source ||
              product.productAssetss?.[0]?.source ||
              placeholderImage ||
              "";

            return (
              <ProductCard
                key={product.productId || product.id}
                id={String(product.productId || product.id)}
                title={
                  product.productName || product.productShortDescription || ""
                }
                img={productImage}
                alt={product.productName || ""}
                sku={product.brandProductId?.toString()}
                link={`/products/${product.productId || product.id}`}
                price={product.unitListPrice || product.unitPrice}
                currency="$"
                inStock={true}
                showCompare={false}
                showFavorite={false}
                className="h-full"
              />
            );
          })}
        </div>
      ) : (
        <div className="px-4 text-center text-muted-foreground py-8">
          No products found
        </div>
      )}
    </div>
  );
}
