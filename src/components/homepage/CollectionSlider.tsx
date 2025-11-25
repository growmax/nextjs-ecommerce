"use client";

import defaultPlaceholder from "@/../public/asset/default-placeholder.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import TitleComponent from "@/components/homepage/TitleComponent";

interface CollectionItem {
  id?: string | number;
  name?: string;
  image?: string;
  imgUrl?: string;
  selectedItems?: Array<{ name: string }>;
}

interface CollectionSliderProps {
  data?: {
    bottomPadding?: number;
    bottomPaddingMob?: number;
    sectionAlign?: "flex-start" | "center" | "flex-end";
    sectionAlignMob?: "flex-start" | "center" | "flex-end";
    showTitleImage?: boolean;
    showTitleImageMob?: boolean;
    subtitle?: string;
    title?: string;
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
    perRowMobileView?: number;
    noOfRowsMob?: number;
    isOpenNewTabMob?: boolean;
    perRowMobileViewWidth?: number;
    listOfItems?: CollectionItem[];
    hideImageMob?: boolean;
    imageOuterPaddingMob?: number;
    imageHeightMobileView?: number;
    imageAlignMob?: "contain" | "cover";
    hideTextMob?: boolean;
    textAlignMob?: "left" | "center" | "right";
    textSizeMob?: number;
    perRowWebView?: number;
    noOfRows?: number;
    isOpenNewTab?: boolean;
    imageOuterPadding?: number;
    hideImage?: boolean;
    hideText?: boolean;
    textAlign?: "left" | "center" | "right";
    textSize?: number;
    imageAlign?: "contain" | "cover";
    imageHeightWebView?: number;
  };
  sectionType?: "subcategory" | "productgroup" | "brands";
  isMobile?: boolean;
  placeholderImage?: string | undefined;
}

/**
 * Collection slider component for categories, subcategories, product groups, and brands
 * Migrated from MUI/react-slick to embla-carousel-react
 */
export default function CollectionSlider({
  data = {},
  sectionType = "subcategory",
  isMobile = false,
  placeholderImage,
}: CollectionSliderProps) {
  const {
    bottomPadding = 0,
    bottomPaddingMob = 0,
    sectionAlign = "flex-start",
    sectionAlignMob = "flex-start",
    showTitleImage = false,
    showTitleImageMob = false,
    subtitle = "",
    title = "",
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
    perRowMobileView = 2,
    noOfRowsMob: _noOfRowsMob = 1,
    isOpenNewTabMob = false,
    perRowMobileViewWidth,
    listOfItems = [],
    hideImageMob = false,
    imageOuterPaddingMob,
    imageHeightMobileView = 150,
    imageAlignMob = "contain",
    hideTextMob = false,
    textAlignMob = "left",
    textSizeMob,
    perRowWebView = 6,
    noOfRows = 1,
    isOpenNewTab = false,
    imageOuterPadding,
    hideImage = false,
    hideText = false,
    textAlign = "left",
    textSize,
    imageAlign = "contain",
    imageHeightWebView = 213,
  } = data;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const updateScrollButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    updateScrollButtons();
    emblaApi.on("select", updateScrollButtons);
    emblaApi.on("reInit", updateScrollButtons);

    return () => {
      emblaApi.off("select", updateScrollButtons);
    };
  }, [emblaApi]);

  const isOpenNewTabCond = isMobile ? isOpenNewTabMob : isOpenNewTab;
  const showImage = isMobile ? !hideImageMob : !hideImage;
  const showText = isMobile ? !hideTextMob : !hideText;

  // Calculate slides to show
  const slidesToShow = isMobile
    ? perRowMobileViewWidth && Number(perRowMobileViewWidth) > 0
      ? Number(perRowMobileView) + Number(perRowMobileViewWidth)
      : Number(perRowMobileView) || 1.2
    : Number(perRowWebView) || 6;

  const shouldShowArrows =
    !isMobile && listOfItems.length > perRowWebView * noOfRows;

  return (
    <div className="my-1" data-testid="collection-slider">
      <TitleComponent
        className="px-2"
        image={{
          showImage: isMobile
            ? showTitleImageMob || showTitleImage
            : showTitleImage,
          ...((isMobile ? titleImageMob || titleImage : titleImage) && {
            ImageSrc: isMobile ? titleImageMob || titleImage : titleImage,
          }),
          height: isMobile
            ? titleImgHeightMob || titleImgHeight
            : titleImgHeight,
          ...(placeholderImage && { placeholderImage }),
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

      <div className="relative">
        <div
          className={cn("overflow-hidden", !isMobile && "mx-4")}
          style={{
            margin: !isMobile ? "0 16px 0 8px" : undefined,
          }}
          ref={emblaRef}
        >
          <div className="flex" style={{ gap: "8px" }}>
            {sectionType !== "brands" &&
              listOfItems.map((item, i) => {
                const json: Record<string, string[]> = {};
                json[
                  sectionType === "productgroup"
                    ? "productgroups"
                    : "subcategorys"
                ] = (item.selectedItems || []).map(o => o.name);

                const href = `/browse/collection/collection_${item.id || ""}/1?query=${encodeURIComponent(JSON.stringify(json))}`;

                return (
                  <div
                    key={i}
                    className="flex-shrink-0"
                    style={{
                      width: isMobile
                        ? `${100 / slidesToShow}%`
                        : `${100 / perRowWebView}%`,
                      padding: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ height: "100%" }}>
                      <Card
                        className={cn(
                          "cursor-pointer transition-all duration-300",
                          "overflow-hidden h-full",
                          isMobile ? "rounded-2xl" : "rounded-2xl"
                        )}
                        style={{
                          boxShadow: "0px 0px 12px rgba(24, 110, 212, 0.1)",
                          borderRadius: "16px",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow =
                            "0px 8px 16px rgba(24, 110, 212, 0.15)";
                          const img = e.currentTarget.querySelector("img");
                          if (img) {
                            img.style.transform = "scale(1.03)";
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow =
                            "0px 0px 12px rgba(24, 110, 212, 0.1)";
                          const img = e.currentTarget.querySelector("img");
                          if (img) {
                            img.style.transform = "scale(1)";
                          }
                        }}
                      >
                        <Link
                          href={href}
                          target={isOpenNewTabCond ? "_blank" : "_self"}
                          className="block w-full no-underline text-inherit"
                          style={{
                            borderRadius: "16px",
                            textDecoration: "none",
                            color: "inherit",
                            width: "100%",
                          }}
                        >
                          {showImage && (
                            <div
                              className="relative w-full overflow-hidden"
                              style={{
                                margin: isMobile
                                  ? imageOuterPaddingMob
                                    ? `${imageOuterPaddingMob / 8}rem`
                                    : "0.5rem"
                                  : imageOuterPadding
                                    ? `${imageOuterPadding / 8}rem`
                                    : "0.5rem",
                                borderRadius: "16px",
                              }}
                            >
                              <div
                                className="relative w-full overflow-hidden"
                                style={{
                                  height: isMobile
                                    ? `${imageHeightMobileView}px`
                                    : `${imageHeightWebView}px`,
                                  borderRadius: "16px",
                                  position: "relative",
                                }}
                              >
                                <Image
                                  src={
                                    item.image ||
                                    placeholderImage ||
                                    defaultPlaceholder
                                  }
                                  alt={item.name || "Collection"}
                                  fill
                                  className="transition-transform duration-400 ease-in-out"
                                  style={{
                                    objectFit: isMobile
                                      ? imageAlignMob
                                      : imageAlign,
                                    borderRadius: "16px",
                                    transition: "transform 0.4s ease 0s",
                                  }}
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                                />
                              </div>
                            </div>
                          )}
                          {!isMobile && showText && item.name && (
                            <div
                              style={{
                                textAlign,
                                padding: "8px",
                                marginTop: "8px",
                                paddingTop: 0,
                              }}
                            >
                              <h3
                                className="font-semibold truncate"
                                style={{
                                  fontSize: textSize
                                    ? `${textSize}px`
                                    : undefined,
                                  lineHeight: 1.2,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.name}
                              </h3>
                            </div>
                          )}
                        </Link>
                      </Card>
                    </div>
                    {isMobile && showText && item.name && (
                      <div
                        className="p-2 pt-0 mt-1"
                        style={{
                          textAlign: textAlignMob,
                          padding: "8px",
                          marginTop: "8px",
                          paddingTop: 0,
                        }}
                      >
                        <h3
                          className="font-semibold truncate"
                          style={{
                            fontSize: textSizeMob
                              ? `${textSizeMob}px`
                              : undefined,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.name}
                        </h3>
                      </div>
                    )}
                  </div>
                );
              })}

            {sectionType === "brands" &&
              listOfItems.map((item, i) => {
                const href = `/browse/${item.name?.toLowerCase().replace(/\s+/g, "-") || ""}/b_${item.name || ""}/1`;

                return (
                  <div
                    key={i}
                    className="flex-shrink-0"
                    style={{
                      width: isMobile
                        ? `${100 / slidesToShow}%`
                        : `${100 / perRowWebView}%`,
                    }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden p-2",
                        "bg-white"
                      )}
                      style={{
                        boxShadow: "inset 0px 0px 2px rgba(24, 110, 212, 0.08)",
                        borderRadius: "16px",
                        padding: "8px",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow =
                          "0px 4px 12px rgba(24, 110, 212, 0.2)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow =
                          "inset 0px 0px 2px rgba(24, 110, 212, 0.08)";
                      }}
                    >
                      <Link
                        href={href}
                        target={isOpenNewTabCond ? "_blank" : "_self"}
                        className="relative w-full h-[110px] overflow-hidden flex items-center justify-center bg-white"
                        style={{
                          borderRadius: "16px",
                          position: "relative",
                        }}
                      >
                        <Image
                          src={
                            item.imgUrl ||
                            placeholderImage ||
                            defaultPlaceholder
                          }
                          alt={item.name || "Brand"}
                          fill
                          className="object-contain"
                          style={{
                            objectFit: isMobile ? imageAlignMob : imageAlign,
                          }}
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        />
                      </Link>
                    </Card>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Navigation arrows - desktop only */}
        {shouldShowArrows && (
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "pointer-events-auto h-10 w-10 rounded-full",
                !canScrollPrev && "opacity-50 cursor-not-allowed"
              )}
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        {shouldShowArrows && (
          <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "pointer-events-auto h-10 w-10 rounded-full",
                !canScrollNext && "opacity-50 cursor-not-allowed"
              )}
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
