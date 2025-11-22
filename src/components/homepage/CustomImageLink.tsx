"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import TitleComponent from "./TitleComponent";

interface CustomImageLinkItem {
  image?: string;
  link?: string;
  name?: string;
}

interface CustomImageLinkProps {
  data?: {
    listOfItems?: CustomImageLinkItem[];
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
    perRowWebView?: number;
    perRowMobileView?: number;
    perRowMobileViewWidth?: number;
    noOfRows?: number;
    noOfRowsMob?: number;
    imageOuterPadding?: number;
    imageOuterPaddingMob?: number;
    imageHeightWebView?: number | string;
    imageHeightMobileView?: number | string;
    imageAlign?: "contain" | "cover";
    imageAlignMob?: "contain" | "cover";
    hideText?: boolean;
    hideTextMob?: boolean;
    textAlign?: "left" | "center" | "right";
    textAlignMob?: "left" | "center" | "right";
    textSize?: number;
    textSizeMob?: number;
    isOpenNewTab?: boolean;
    isOpenNewTabMob?: boolean;
    hideImage?: boolean;
    hideImageMob?: boolean;
  };
  isMobile?: boolean;
  placeholderImage?: string | undefined;
}

/**
 * Custom image link carousel component
 * Displays custom images with links in a carousel
 */
export default function CustomImageLink({
  data = {},
  isMobile = false,
  placeholderImage,
}: CustomImageLinkProps) {
  const {
    listOfItems = [],
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
    perRowWebView = 6,
    perRowMobileView = 3,
    perRowMobileViewWidth = 1,
    noOfRows = 1,
    noOfRowsMob: _noOfRowsMob = 1,
    imageOuterPadding,
    imageOuterPaddingMob,
    imageHeightWebView = 350,
    imageHeightMobileView = 250,
    imageAlign = "contain",
    imageAlignMob = "contain",
    hideText,
    hideTextMob = false,
    textAlign,
    textAlignMob = "left",
    textSize,
    textSizeMob = 10,
    isOpenNewTab,
    isOpenNewTabMob,
    hideImage,
    hideImageMob,
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

  // Calculate slides to show - match buyer-fe logic exactly
  const slidesToShow = isMobile
    ? Number(perRowMobileView) + Number(perRowMobileViewWidth || 0)
    : Number(perRowWebView);

  const shouldShowArrows =
    !isMobile && listOfItems.length > perRowWebView * noOfRows;

  // Parse image heights - buyer-fe uses parseFloat to handle string values
  const parsedImageHeightWeb =
    typeof imageHeightWebView === "string"
      ? parseFloat(imageHeightWebView) || 350
      : imageHeightWebView || 350;
  const parsedImageHeightMob =
    typeof imageHeightMobileView === "string"
      ? parseFloat(imageHeightMobileView) || 250
      : imageHeightMobileView || 250;

  const handleItemClick = (link?: string) => {
    if (link) {
      if (isOpenNewTabCond) {
        window.open(link, "_blank");
      } else {
        window.open(link, "_self");
      }
    }
  };

  return (
    <div className="my-4" data-testid="custom-image-link">
      <TitleComponent
        className="px-4 py-4"
        image={{
          showImage: isMobile
            ? showTitleImageMob || showTitleImage
            : showTitleImage,
          ...((isMobile && titleImageMob) || titleImage
            ? {
                ImageSrc:
                  isMobile && titleImageMob ? titleImageMob : titleImage,
              }
            : {}),
          height: isMobile
            ? titleImgHeightMob || titleImgHeight
            : titleImgHeight,
          ...(placeholderImage ? { placeholderImage } : {}),
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
            {listOfItems.map((item, i) => (
              <div
                key={`custom-image-${i}-${item.link || item.image || i}`}
                className="flex-shrink-0"
                style={{
                  width: `${100 / slidesToShow}%`,
                  padding: "8px",
                  marginBottom: "10px",
                }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-shadow rounded-2xl overflow-hidden"
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
                      img.style.transform = "scale(1.05)";
                      img.style.transformOrigin = "50% 50%";
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
                  onClick={() => handleItemClick(item.link)}
                >
                  {showImage && (item.image || placeholderImage) && (
                    <div
                      className="relative w-full overflow-hidden rounded-t-2xl"
                      style={{
                        boxShadow: "inset 0px 0px 2px rgba(24, 110, 212, 0.08)",
                        backgroundColor: "white",
                        height: isMobile
                          ? `${parsedImageHeightMob}px`
                          : `${parsedImageHeightWeb}px`,
                        padding: isMobile
                          ? imageOuterPaddingMob
                            ? `${imageOuterPaddingMob / 8}rem`
                            : "0.5rem"
                          : imageOuterPadding
                            ? `${imageOuterPadding / 8}rem`
                            : "0.5rem",
                        marginBottom: "0.5rem", // mb: 1 in MUI = 8px = 0.5rem
                        borderTopLeftRadius: "16px",
                        borderTopRightRadius: "16px",
                      }}
                    >
                      <Image
                        src={item.image || placeholderImage || ""}
                        alt={item.name || "Custom image"}
                        fill
                        className="object-contain"
                        style={{
                          objectFit: isMobile ? imageAlignMob : imageAlign,
                          transition: "transform 0.4s ease",
                        }}
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 16vw, 16vw"
                      />
                    </div>
                  )}
                  {!isMobile && showText && item.name && (
                    <div
                      style={{
                        textAlign,
                        padding: "8px", // p: 1 in MUI = 8px
                        marginTop: "8px", // mt: 1 in MUI = 8px
                      }}
                    >
                      <h3
                        className="font-semibold"
                        style={{
                          fontSize: textSize ? `${textSize}px` : undefined,
                        }}
                      >
                        {item.name}
                      </h3>
                    </div>
                  )}
                </Card>
                {isMobile && showText && item.name && (
                  <div
                    style={{
                      textAlign: textAlignMob,
                      padding: "8px", // p: 1 in MUI = 8px
                    }}
                  >
                    <h3
                      className="font-semibold"
                      style={{
                        fontSize: textSizeMob ? `${textSizeMob}px` : undefined,
                      }}
                    >
                      {item.name}
                    </h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows - desktop only */}
        {shouldShowArrows && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
