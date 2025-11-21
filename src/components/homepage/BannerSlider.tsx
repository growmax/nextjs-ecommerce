"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface BannerItem {
  image?: string;
  headline?: string;
  imageAlignX?: number;
  imageAlignY?: number;
  imageSize?: "contain" | "cover";
  background?: string;
  alignText?: { value: "Left" | "Center" | "Right" };
  headlineColor?: string;
  description?: string;
  descriptionColor?: string;
  sliderLink?: string;
  buttonColor?: string;
  buttonLabel?: string;
  showActionButton?: boolean;
  showText?: boolean;
  showSlider?: boolean;
}

interface BannerSliderProps {
  data?: {
    sliderHeightWeb?: { value: number | string } | number | string;
    sliderHeightMobile?: number | string;
    listOfItems?: BannerItem[];
    listOfItemsMob?: BannerItem[];
  };
  isMobile?: boolean;
  fromSlider?: boolean;
}

/**
 * Banner slider component for homepage
 * Migrated from MUI/react-slick to embla-carousel-react
 */
export default function BannerSlider({
  data = {},
  isMobile = false,
  fromSlider = false,
}: BannerSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    sliderHeightWeb,
    sliderHeightMobile = 250,
    listOfItems = [],
    listOfItemsMob,
  } = data;

  // Filter items by showSlider
  const filteredItems = (
    isMobile && listOfItemsMob ? listOfItemsMob : listOfItems
  ).filter(item => item.showSlider !== false);

  // Calculate slider height
  const sliderHeight: string = isMobile
    ? typeof sliderHeightMobile === "number"
      ? `${sliderHeightMobile}px`
      : sliderHeightMobile || "250px"
    : typeof sliderHeightWeb === "object" && sliderHeightWeb?.value
      ? typeof sliderHeightWeb.value === "number"
        ? `${sliderHeightWeb.value}px`
        : String(sliderHeightWeb.value)
      : typeof sliderHeightWeb === "number"
        ? `${sliderHeightWeb}px`
        : typeof sliderHeightWeb === "string"
          ? sliderHeightWeb
          : "480px";

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative w-full", isMobile && !fromSlider && "p-4")}
      data-testid="banner-slider"
    >
      <div
        className={cn(
          "overflow-hidden rounded-lg",
          isMobile && "shadow-md bg-white"
        )}
        ref={emblaRef}
      >
        <div className="flex">
          {filteredItems.map((item, index) => (
            <CarouselItem
              key={index}
              item={item}
              isActive={index === selectedIndex}
              sliderHeight={sliderHeight}
              isMobile={isMobile}
              fromSlider={fromSlider}
            />
          ))}
        </div>
      </div>

      {/* Navigation arrows - desktop only */}
      {!isMobile && filteredItems.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
          <Button
            variant="outline"
            size="icon"
            className="pointer-events-auto h-10 w-10 rounded-full"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="pointer-events-auto h-10 w-10 rounded-full"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Dots indicator - mobile only */}
      {isMobile && filteredItems.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {filteredItems.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full transition-all",
                index === selectedIndex ? "w-8 bg-primary" : "w-2 bg-muted"
              )}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CarouselItemProps {
  item: BannerItem;
  isActive: boolean;
  sliderHeight: string;
  isMobile: boolean;
  fromSlider: boolean;
}

function CarouselItem({
  item,
  isActive,
  sliderHeight,
  isMobile,
  fromSlider,
}: CarouselItemProps) {
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    image,
    headline,
    imageAlignX = 50,
    imageAlignY = 50,
    imageSize = "contain",
    background,
    alignText,
    headlineColor,
    description,
    descriptionColor,
    sliderLink,
    buttonColor,
    buttonLabel,
    showActionButton = false,
    showText = false,
  } = item;

  // Calculate height
  let height = sliderHeight;
  if (!fromSlider && typeof sliderHeight === "string") {
    const heightNum = parseFloat(sliderHeight);
    if (heightNum > 1 && windowWidth > 0) {
      height = `${windowWidth / heightNum}px`;
    } else if (windowHeight > 0) {
      height = `${windowHeight - 64}px`;
    }
  }

  const handleClick = () => {
    if (sliderLink) {
      window.open(sliderLink, "_blank");
    }
  };

  const objectFit = fromSlider
    ? isMobile
      ? imageSize || "cover"
      : "contain"
    : imageSize || "contain";

  const alignClass =
    alignText?.value === "Right"
      ? "right-3 left-auto"
      : alignText?.value === "Center"
        ? "left-1/2 -translate-x-1/2"
        : "left-3 right-auto";

  return (
    <div
      className="relative flex-shrink-0 w-full cursor-pointer"
      style={{ height }}
      onClick={handleClick}
    >
      {image && (
        <Image
          src={image}
          alt={headline || "Banner"}
          fill
          className="object-cover"
          style={{
            objectFit,
            objectPosition: `${imageAlignX}% ${imageAlignY}%`,
          }}
          priority={isActive}
          sizes="100vw"
        />
      )}

      {showText && (
        <div
          className={cn(
            "absolute flex flex-col justify-center",
            isMobile
              ? "top-[30%] w-[70%] p-2.5 text-center"
              : "top-[20%] w-[463px] max-w-[560px] p-4 text-left",
            fromSlider && isMobile && "w-[300px] h-[40%]",
            alignClass
          )}
          style={{
            backgroundColor: background,
          }}
        >
          {isActive && (
            <div className="space-y-2 animate-in fade-in slide-in-from-right duration-500">
              {headline && (
                <h3
                  className="text-2xl font-semibold"
                  style={{ color: headlineColor }}
                >
                  {headline}
                </h3>
              )}
              {description && (
                <p className="text-base" style={{ color: descriptionColor }}>
                  {description}
                </p>
              )}
              {showActionButton && buttonLabel && (
                <a
                  href={sliderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-2 text-sm transition-colors hover:text-primary"
                  style={{ color: buttonColor }}
                >
                  {buttonLabel}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
